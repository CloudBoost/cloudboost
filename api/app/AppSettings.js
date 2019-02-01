/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const _ = require('underscore');
const winston = require('winston');
const { Readable } = require('stream');
const util = require('../../helpers/util.js');

const config = require('../../config/config');
const apiTracker = require('../../database-connect/apiTracker');
const mongoService = require('../../databases/mongo');
const appService = require('../../services/app');
const keyService = require('../../database-connect/keyService');

/* Desc   : Get fileStream and contentType from upload request
  Params : req
  Returns: Promise
           Resolve->JSON{filestream,contentType}
           Reject->
*/
const getFileStream = (req) => {
  const deferred = q.defer();

  const resObj = {
    fileStream: null,
    contentType: null,
  };

  // Create a FileStream(add data)
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
};

module.exports = (app) => {
  // Update Settings for the App
  app.put('/settings/:appId/:category', async (req, res) => {
    const { appId, category, key: pkey } = req.params;
    const { sdk = 'REST', key: appKey = pkey } = req.body;
    let { settings = {} } = req.body;

    if (typeof settings === 'string') {
      settings = JSON.parse(settings);
    }

    apiTracker.log(appId, 'App / Settings', req.url, sdk);

    try {
      const isMasterKey = await appService.isMasterKey(appId, appKey);
      if (isMasterKey) {
        if (config.mongoDisconnected) {
          res.status(500).send('Storage / Cache Backend are temporarily down.');
        } else {
          const updatedSettings = await appService.updateSettings(appId, category, settings);
          res.status(200).send(updatedSettings);
        }
      } else {
        res.status(401).send({ status: 'Unauthorized' });
      }
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      res.status(500).send('Error.');
    }
  });

  // Get Settings for the App
  app.post('/settings/:appId', async (req, res) => {
    const { appId, key: pkey } = req.params;
    const { sdk = 'REST', key: appKey = pkey } = req.body;

    apiTracker.log(appId, 'App / Settings', req.url, sdk);

    try {
      const isMasterKey = await appService.isMasterKey(appId, appKey);
      if (isMasterKey) {
        if (config.mongoDisconnected) {
          res.status(500).send('Storage / Cache Backend are temporarily down.');
        } else {
          const allSettings = await appService.getAllSettings(appId);
          res.status(200).send(allSettings);
        }
      } else {
        res.status(401).send({ status: 'Unauthorized' });
      }
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      res.status(500).send('Error.');
    }
  });

  /* stream file settings file to gridfs
        1.Get fileStream from request
        2.Check if masterKey is false
        3.GetAppSettings and delete previous file if exists(in background)
        4.Get ServerUrl to make fileUri
        5.Save current file to gridfs
    */
  app.put('/settings/:appId/file/:category', async (req, res) => {
    const { appId, category, key: pkey } = req.params;
    const { key: appKey = pkey } = req.body;

    if (config.mongoDisconnected) {
      return res.status(500).send('Storage / Cache Backend are temporarily down.');
    }

    try {
      const isMasterKey = await appService.isMasterKey(appId, appKey);
      const allSettings = await appService.getAllSettings(appId);
      const myUrl = await keyService.getMyUrl();
      const fileStream = await getFileStream(req);
      if (!isMasterKey) {
        return res.status(401).send({ status: 'Unauthorized' });
      }

      if (allSettings && allSettings.length > 0) {
        const categorySettings = _.where(allSettings, { category });

        if (categorySettings && categorySettings.length > 0) {
          let fileName = appId;
          // for category == general , filename is set to appId;

          if (category === 'push') {
            if (categorySettings[0].settings.apple.certificates.length > 0) {
              // get the filename from fileUri
              [fileName] = categorySettings[0].settings.apple.certificates[0].split('/').reverse();
            }
          }

          // Delete from gridFs
          if (fileName) {
            mongoService.document.deleteFileFromGridFs(appId, fileName);
          }
        }
      }

      let fileName = util.getId();
      if (category === 'general') {
        fileName = appId;
      }
      const savedFile = await mongoService.document.saveFileStream(
        appId, fileStream.fileStream, fileName, fileStream.contentType,
      );
      let fileUri = null;
      fileUri = `${myUrl}/settings/${appId}/file/${savedFile.filename}`;
      if (category === 'general') {
        fileUri = `${myUrl}/appfile/${appId}/icon`;
      }

      return res.status(200).send(fileUri);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(500).send(error);
    }
  });

  // get file from gridfs
  app.get('/settings/:appId/file/:fileName', async (req, res) => {
    const { appId, fileName } = req.params;
    const appKey = req.query.key || req.body.key || req.params.key;

    if (!appKey) {
      return res.status(500).send('Unauthorized');
    }

    try {
      const isMasterKey = await appService.isMasterKey(appId, appKey);
      if (!isMasterKey) {
        return res.status(401).send('Unauthorized');
      }
      const file = await mongoService.document.getFile(appId, fileName.split('.')[0]);
      // eslint-disable-next-line no-underscore-dangle
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

      return fileStream.pipe(res);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(500).send(error);
    }
  });
};
