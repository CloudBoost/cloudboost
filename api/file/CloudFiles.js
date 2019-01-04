/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const customHelper = require('../../helpers/custom.js');

const apiTracker = require('../../database-connect/apiTracker');
const config = require('../../config/config');
const mongoService = require('../../databases/mongo');
const customService = require('../../services/cloudObjects');
const appService = require('../../services/app');
const fileService = require('../../services/cloudFiles');

module.exports = function (app) {
  app.post('/file/:appId', (req, res) => {
    const appId = req.params.appId;
    let document = req.body.fileObj;

    if (typeof req.body.fileObj === 'string') {
      document = JSON.parse(req.body.fileObj);
    }

    const appKey = req.body.key;

    const sdk = req.body.sdk || 'REST';
    if (document._id) {
      appService.isMasterKey(appId, appKey).then(isMasterKey => customService.save(appId, '_File', document, customHelper.getAccessList(req), isMasterKey)).then((result) => {
        res.status(200).send(result);
      }, (error) => {
        res.status(400).send(error);
      });

      apiTracker.log(appId, 'File / Save', req.url, sdk);
    } else {
      appService.isMasterKey(appId, appKey).then((isMasterKey) => {
        _getFileStream(req).then((result) => {
          config.fileUrl = `${config.myURL}/file/`;
          return fileService.upload(appId, result.fileStream, result.contentType, result.fileObj, customHelper.getAccessList(req), isMasterKey);
        }).then(file => res.status(200).send(file), err => res.status(500).send(err));
      });

      apiTracker.log(appId, 'File / Upload', req.url, sdk);
    }
  });

  // Delete File
  app.delete('/file/:appId/:fileId', _deleteFile);
  app.put('/file/:appId/:fileId', _deleteFile);

  function _deleteFile(req, res) {
    const appId = req.params.appId;
    const fileObj = req.body.fileObj;
    const appKey = req.body.key;
    const sdk = req.body.sdk || 'REST';
    config.fileUrl = `${config.myURL}/file/`;
    appService.isMasterKey(appId, appKey).then((isMasterKey) => {
      fileService.delete(appId, fileObj, customHelper.getAccessList(req), isMasterKey).then(() => res.status(200).send(null), err => res.status(500).send(err));
    });

    apiTracker.log(appId, 'File / Delete', req.url, sdk);
  }

  app.get('/file/:appId/:fileId', _getFile);
  app.post('/file/:appId/:fileId', _getFile);
};

function _getFile(req, res) {
  const appId = req.params.appId;
  const fileId = req.params.fileId;
  const appKey = req.body.key;
  const sdk = req.body.sdk || 'REST';
  const resizeWidth = req.query.resizeWidth;
  const resizeHeight = req.query.resizeHeight;
  const quality = req.query.quality;
  const opacity = req.query.opacity;
  const scale = req.query.scale;
  const containWidth = req.query.containWidth;
  const containHeight = req.query.containHeight;
  const rDegs = req.query.rDegs;
  const bSigma = req.query.bSigma;
  const cropX = req.query.cropX;
  const cropY = req.query.cropY;
  const cropW = req.query.cropW;
  const cropH = req.query.cropH;

  if (!fileId) {
    return res.status(400).send('File ID is Required');
  }
  appService.isMasterKey(appId, appKey).then((isMasterKey) => {
    fileService.getFile(appId, fileId, customHelper.getAccessList(req), isMasterKey).then((file) => {
      if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined') {
        const fileStream = mongoService.document.getFileStreamById(appId, file._id);

        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', `inline; filename="${file.filename}"`);

        fileStream.on('error', (err) => {
          res.send(500, `Got error while processing stream ${err.message}`);
          res.end();
        });

        fileStream.on('end', () => {
          res.end();
        });

        fileStream.pipe(res);
      } else {
        fileService.processImage(appId, file, resizeWidth, resizeHeight, cropX, cropY, cropW, cropH, quality, opacity, scale, containWidth, containHeight, rDegs, bSigma).then(file => res.status(200).send(file), err => res.status(500).send(err));
      }
    }, err => res.status(500).send(err));
  }, err => res.status(500).send(err));

  apiTracker.log(appId, 'File / Get', req.url, sdk);
}

/* Desc   : Get file params from upload request
  Params : req
  Returns: Promise
           Resolve->JSON{filestream,contentType,cloudBoostFileObj}
           Reject->
*/
function _getFileStream(req) {
  const deferred = q.defer();

  const resObj = {
    fileStream: null,
    fileObj: null,
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
    resObj.contentType = req.body.fileObj.contentType;
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
    resObj.contentType = req.files.fileToUpload.mimetype;
    resObj.fileObj = JSON.parse(req.body.fileObj);

    deferred.resolve(resObj);
  }

  return deferred.promise;
}
