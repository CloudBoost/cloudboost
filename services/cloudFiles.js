/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const jimp = require('jimp');
const winston = require('winston');
const util = require('../helpers/util.js');
const mongoService = require('../databases/mongo');
const customService = require('./cloudObjects');
const keyService = require('../database-connect/keyService');

module.exports = {
  /* Desc   : Save FileStream & CloudBoostFileObject
      Params : appId,fileStream,fileContentType,CloudBoostFileObj
      Returns: Promise
               Resolve->cloudBoostFileObj
               Reject->Error on getMyUrl() or saving filestream or saving cloudBoostFileObject
    */
  upload(appId, fileStream, contentType, fileObj, accessList, isMasterKey) {
    const deferred = q.defer();

    try {
      const promises = [];

      keyService.getMyUrl().then((url) => {
        if (!fileObj._id) {
          fileObj._id = util.getId();
          fileObj._version = 0;
          fileObj.url = `${url}/file/${appId}/${fileObj._id}${fileObj.name.slice(fileObj.name.indexOf('.'), fileObj.name.length)}`;
        } else {
          fileObj._version += 1;
        }
        const collectionName = '_File';
        try {
          promises.push(mongoService.document.saveFileStream(appId, fileStream, fileObj._id, contentType));
          promises.push(customService.save(appId, collectionName, fileObj, accessList, isMasterKey));
        } catch (error) {
          winston.error(error);
        }
        // promises.push(mongoService.document.saveFileStream(appId, fileStream, fileObj._id, contentType));
        // promises.push(customService.save(appId, collectionName, fileObj, accessList, isMasterKey));
        q.all(promises).then((array) => {
          deferred.resolve(array[1]);
        }, (err) => {
          deferred.reject(err);
        });
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  /* Desc   : delete file from gridFs & delete CloudBoostFileObj
      Params : appId,cloudBoostFileObj,accessList,masterKey
      Returns: Promise
               Resolve->cloudBoostFileObj
               Reject->Error on getMyUrl() or saving filestream or saving cloudBoostFileObject
    */
  delete(appId, fileObj, accessList, isMasterKey) {
    const deferred = q.defer();
    try {
      const collectionName = '_File';

      const promises = [];
      promises.push(mongoService.document.deleteFileFromGridFs(appId, fileObj._id));
      promises.push(customService.delete(appId, collectionName, fileObj, accessList, isMasterKey));
      q.all(promises).then(() => {
        deferred.resolve();
      }, (err) => {
        deferred.reject(err);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

  /* Desc   : get File
      Params : appId,fileName,accessList,masterKey
      Returns: Promise
               Resolve->gridFsFileObject
               Reject->Error on _readFileACL() or getFile from gridFs
    */
  getFile(appId, filename, accessList, isMasterKey) {
    const deferred = q.defer();

    try {
      const collectionName = '_File';
      customService.find(appId, collectionName, {
        _id: filename.split('.')[0],
      }, null, null, 1, 0, accessList, isMasterKey, null).then((file) => {
        if (file.length == 1) {
          mongoService.document.getFile(appId, filename.split('.')[0]).then((res) => {
            deferred.resolve(res);
          }, (err) => {
            deferred.reject(err);
          });
        } else {
          deferred.reject('Unauthorized');
        }
      }, () => {
        deferred.reject('Unauthorized');
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

  processImage(appId, fileName, resizeWidth, resizeHeight, cropX, cropY, cropW, cropH, quality, opacity, scale, containWidth, containHeight, rDegs, bSigma) {
    const deferred = q.defer();
    try {
      _processImage(appId, fileName, resizeWidth, resizeHeight, cropX, cropY, cropW, cropH, quality, opacity, scale, containWidth, containHeight, rDegs, bSigma).then((image) => {
        deferred.resolve(image);
      }, (err) => {
        deferred.reject(err);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },
};

function _processImage(appId, fileName, resizeWidth, resizeHeight, cropX, cropY, cropW, cropH, quality, opacity, scale, containWidth, containHeight, rDegs, bSigma) {
  const deferred = q.defer();

  try {
    const promises = [];
    jimp.read(fileName, (err, image) => {
      if (err) deferred.reject(err);
      if (typeof resizeWidth !== 'undefined' && typeof resizeHeight !== 'undefined' && typeof quality !== 'undefined' && typeof opacity !== 'undefined' && typeof scale !== 'undefined' && typeof containWidth !== 'undefined' && typeof containHeight !== 'undefined' && typeof rDegs !== 'undefined' && typeof bSigma !== 'undefined' && typeof cropX !== 'undefined' && typeof cropY !== 'undefined' && typeof cropW !== 'undefined' && typeof cropH !== 'undefined') {
        image.resize(resizeWidth, resizeHeight).crop(parseInt(cropX), parseInt(cropY), parseInt(cropW), parseInt(cropH)).quality(parseInt(quality)).opacity(parseFloat(opacity))
          .scale(parseInt(scale))
          .contain(parseInt(containWidth), parseInt(containHeight))
          .rotate(parseFloat(rDegs))
          .blur(parseInt(bSigma), (err, processedImage) => {
            promises.push(processedImage);
          });
      } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma !== 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
        image.blur(parseInt(bSigma), (err, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth !== 'undefined' && typeof resizeHeight !== 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
        image.resize(parseInt(resizeWidth), parseInt(resizeHeight), (err, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX !== 'undefined' && typeof cropY !== 'undefined' && typeof cropW !== 'undefined' && typeof cropH !== 'undefined') {
        image.crop(parseInt(cropX), parseInt(cropY), parseInt(cropW), parseInt(cropH), (err, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality !== 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
        image.quality(parseInt(quality), (err, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale !== 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
        image.scale(parseInt(scale), (err, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth !== 'undefined' && typeof containHeight !== 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
        image.contain(parseInt(containWidth), parseInt(containHeight), (err, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs !== 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
        image.rotate(parseFloat(rDegs), (err, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity !== 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
        image.opacity(parseFloat(opacity), (err, processedImage) => {
          promises.push(processedImage);
        });
      }
    });
    q.all(promises).then((image) => {
      deferred.resolve(image);
    }, (err) => {
      deferred.reject(err);
    });
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }

  return deferred.promise;
}
