/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const _ = require('underscore');
const winston = require('winston');
const util = require('../../helpers/util.js');

const config = require('../../config/config');
const apiTracker = require('../../database-connect/apiTracker');
const mongoService = require('../../databases/mongo');
const appService = require('../../services/app');
const keyService = require('../../database-connect/keyService');

module.exports = function (app) {
  // Update Settings for the App
  app.put('/settings/:appId/:category', (req, res) => {
    const appId = req.params.appId;
    const category = req.params.category;
    const sdk = req.body.sdk || 'REST';
    let settings = req.body.settings || {};
    const appKey = req.body.key || req.params.key;

    if (typeof settings === 'string') {
      settings = JSON.parse(settings);
    }

    appService.isMasterKey(appId, appKey).then((isMasterKey) => {
      if (isMasterKey) {
        if (config.mongoDisconnected) {
          return res.status(500).send('Storage / Cache Backend are temporarily down.');
        }

        appService.updateSettings(appId, category, settings).then(settings => res.status(200).send(settings), (err) => {
          winston.error({
            error: err,
          });
          return res.status(500).send('Error');
        });
      } else {
        return res.status(401).send({ status: 'Unauthorized' });
      }
    }, (err) => {
      winston.error({
        error: err,
      });
      return res.status(500).send('Cannot retrieve security keys.');
    });

    apiTracker.log(appId, 'App / Settings', req.url, sdk);
  });

  // Get Settings for the App
  app.post('/settings/:appId', (req, res) => {
    const appId = req.params.appId;
    const sdk = req.body.sdk || 'REST';
    const appKey = req.body.key || req.params.key;

    appService.isMasterKey(appId, appKey).then((isMasterKey) => {
      if (isMasterKey) {
        if (config.mongoDisconnected) {
          return res.status(500).send('Storage / Cache Backend are temporarily down.');
        }

        appService.getAllSettings(appId).then(settings => res.status(200).send(settings), (err) => {
          winston.error({
            error: err,
          });
          return res.status(500).send('Error');
        });
      } else {
        return res.status(401).send({ status: 'Unauthorized' });
      }
    }, (err) => {
      winston.error({
        error: err,
      });
      return res.status(500).send('Cannot retrieve security keys.');
    });

    apiTracker.log(appId, 'App / Settings', req.url, sdk);
  });

  /* stream file settings file to gridfs
        1.Get fileStream from request
        2.Check if masterKey is false
        3.GetAppSettings and delete previous file if exists(in background)
        4.Get ServerUrl to make fileUri
        5.Save current file to gridfs
    */
  app.put('/settings/:appId/file/:category', (req, res) => {
    const appId = req.params.appId;
    const appKey = req.body.key || req.params.key;
    const category = req.params.category;

    let thisUri = null;
    const promises = [];

    promises.push(_getFileStream(req));
    promises.push(appService.isMasterKey(appId, appKey));
    promises.push(appService.getAllSettings(appId));
    promises.push(keyService.getMyUrl());

    q.all(promises).then((resultList) => {
      // Check database connectivity
      if (config.mongoDisconnected) {
        return res.status(500).send('Storage / Cache Backend are temporarily down.');
      }
      // Check if masterKey is false
      if (!resultList[1]) {
        return res.status(401).send({ status: 'Unauthorized' });
      }
      // Delete previous file from gridfs
      if (resultList[2] && resultList[2].length > 0) {
        const categorySettings = _.where(resultList[2], { category });

        if (categorySettings && categorySettings.length > 0) {
          let fileName = appId;
          // for category == general , filename is set to appId;

          if (category == 'push') {
            if (categorySettings[0].settings.apple.certificates.length > 0) {
              // get the filename from fileUri
              fileName = categorySettings[0].settings.apple.certificates[0].split('/').reverse()[0];
            }
          }

          // Delete from gridFs
          if (fileName) {
            mongoService.document.deleteFileFromGridFs(appId, fileName);
          }
        }
      }

      // Server URI
      thisUri = resultList[3];

      let fileName = util.getId();
      if (category == 'general') {
        fileName = appId;
      }
      return mongoService.document.saveFileStream(appId, resultList[0].fileStream, fileName, resultList[0].contentType);
    }).then((savedFile) => {
      let fileUri = null;

      fileUri = `${thisUri}/settings/${appId}/file/${savedFile.filename}`;
      if (category == 'general') {
        fileUri = `${thisUri}/appfile/${appId}/icon`;
      }

      return res.status(200).send(fileUri);
    }, error => res.status(500).send(error));
  });

  // get file from gridfs
  app.get('/settings/:appId/file/:fileName', (req, res) => {
    const appId = req.params.appId;
    const fileName = req.params.fileName;
    const appKey = req.query.key || req.body.key || req.params.key;

    if (!appKey) {
      return res.status(500).send('Unauthorized');
    }

    appService.isMasterKey(appId, appKey).then((masterKey) => {
      if (!masterKey) {
        const unathorizedPromise = q.defer();
        unathorizedPromise.reject('Unauthorized.');
        return unathorizedPromise.promise;
      }
      return mongoService.document.getFile(appId, fileName.split('.')[0]);
    }).then((file) => {
      const fileStream = mongoService.document.getFileStreamById(appId, file._id);

      res.set('Content-Type', file.contentType);
      res.set('Content-Disposition', `attachment; filename="${file.filename}"`);

      fileStream.on('error', (err) => {
        res.send(500, `Got error while processing stream ${err.message}`);
        res.end();
      });

      fileStream.on('end', () => {
        res.end();
      });

      fileStream.pipe(res);
    }, error => res.status(500).send(error));
  });
};

/* Desc   : Get fileStream and contentType from upload request
  Params : req
  Returns: Promise
           Resolve->JSON{filestream,contentType}
           Reject->
*/
function _getFileStream(req) {
  const deferred = q.defer();

  const resObj = {
    fileStream: null,
    contentType: null,
  };

  // Create a FileStream(add data)
  const Readable = require('stream').Readable;
  const readableStream = new Readable();

  if (req.body.data) {
    readableStream.push(req.body.data); // the string you want
    readableStream.push(null);

    // Setting response
    resObj.fileStream = readableStream;
    resObj.contentType = 'text/plain';
    resObj.fileObj = req.body.fileObj;

    deferred.resolve(resObj);
  } else if (req.files.file) {
    readableStream.push(req.files.file.data);
    readableStream.push(null);

    // Setting response
    resObj.fileStream = readableStream;
    resObj.contentType = req.files.file.mimetype;
    if (req.body.fileObj) {
      resObj.fileObj = JSON.parse(req.body.fileObj);
    }

    deferred.resolve(resObj);
  } else {
    readableStream.push(req.files.fileToUpload.data);
    readableStream.push(null);

    // Setting response
    resObj.fileStream = readableStream;
    resObj.contentType = req.files.file.mimetype;

    deferred.resolve(resObj);
  }

  // Setting response
  resObj.fileStream = readableStream;
  resObj.contentType = req.files.file.mimetype;

  deferred.resolve(resObj);

  return deferred.promise;
}
