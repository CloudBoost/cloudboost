/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const winston = require('winston');
const { Readable } = require('stream');
const customHelper = require('../../helpers/custom.js');

const apiTracker = require('../../database-connect/apiTracker');
const config = require('../../config/config');
const mongoService = require('../../databases/mongo');
const customService = require('../../services/cloudObjects');
const appService = require('../../services/app');
const fileService = require('../../services/cloudFiles');


/* Desc   : Get file params from upload request
  Params : req
  Returns: Promise
           Resolve->JSON{filestream,contentType,cloudBoostFileObj}
           Reject->
*/
const getFileStream = (req) => {
  const deferred = q.defer();

  const resObj = {
    fileStream: null,
    fileObj: null,
    contentType: null,
  };

  // Create a FileStream(add data)
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
};

const deleteFile = async (req, res) => {
  const { appId } = req.params;
  const { fileObj, key: appKey, sdk = 'REST' } = req.body;
  config.fileUrl = `${config.hostUrl}/file/`;
  try {
    const isMasterKey = await appService.isMasterKey(appId, appKey);
    await fileService.delete(appId, fileObj, customHelper.getAccessList(req), isMasterKey);
    apiTracker.log(appId, 'File / Delete', req.url, sdk);
    res.status(200).send(null);
  } catch (error) {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    res.status(500).send(error);
  }
};

const getFile = async (req, res) => {
  const { appId, fileId } = req.params;
  const { key: appKey, sdk = 'REST' } = req.body;
  const {
    resizeWidth,
    resizeHeight,
    quality,
    opacity,
    scale,
    containWidth,
    containHeight,
    rDegs,
    bSigma,
    cropX,
    cropY,
    cropW,
    cropH,
  } = req.query;

  if (!fileId) {
    return res.status(400).send('File ID is Required');
  }
  try {
    const isMasterKey = await appService.isMasterKey(appId, appKey);
    const file = await fileService.getFile(
      appId, fileId, customHelper.getAccessList(req), isMasterKey,
    );
    apiTracker.log(appId, 'File / Get', req.url, sdk);
    if (typeof resizeWidth === 'undefined'
        && typeof resizeHeight === 'undefined'
        && typeof quality === 'undefined'
        && typeof opacity === 'undefined'
        && typeof scale === 'undefined'
        && typeof containWidth === 'undefined'
        && typeof containHeight === 'undefined'
        && typeof rDegs === 'undefined'
        && typeof bSigma === 'undefined') {
      // eslint-disable-next-line
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

      return fileStream.pipe(res);
    }
    const processedFile = await fileService.processImage(
      appId, file, resizeWidth, resizeHeight, cropX, cropY,
      cropW, cropH, quality, opacity, scale, containWidth, containHeight, rDegs, bSigma,
    );
    return res.status(200).send(processedFile);
  } catch (error) {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    return res.status(500).send(error);
  }
};

module.exports = (app) => {
  app.post('/file/:appId', async (req, res) => {
    const { appId } = req.params;
    let document = req.body.fileObj;

    if (typeof req.body.fileObj === 'string') {
      document = JSON.parse(req.body.fileObj);
    }

    const { sdk = 'REST', key: appKey } = req.body;

    if (document._id) { // eslint-disable-line no-underscore-dangle
      apiTracker.log(appId, 'File / Save', req.url, sdk);
      try {
        const isMasterKey = await appService.isMasterKey(appId, appKey);
        const result = await customService.save(appId, '_File', document, customHelper.getAccessList(req), isMasterKey);
        res.status(200).send(result);
      } catch (error) {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        res.status(400).send(error);
      }
    } else {
      try {
        apiTracker.log(appId, 'File / Upload', req.url, sdk);
        const isMasterKey = await appService.isMasterKey(appId, appKey);
        const result = await getFileStream(req);
        config.fileUrl = `${config.hostUrl}/file`;
        const file = await fileService.upload(
          appId, result.fileStream, result.contentType,
          result.fileObj, customHelper.getAccessList(req), isMasterKey,
        );
        res.status(200).send(file);
      } catch (error) {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        res.status(500).send(error);
      }
    }
  });

  // Delete File
  app.delete('/file/:appId/:fileId', deleteFile);
  app.put('/file/:appId/:fileId', deleteFile);

  app.get('/file/:appId/:fileId', getFile);
  app.post('/file/:appId/:fileId', getFile);
};
