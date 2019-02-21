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
const config = require('../config/config');

module.exports = {
  /* Desc   : Save FileStream & CloudBoostFileObject
      Params : appId,fileStream,fileContentType,CloudBoostFileObj
      Returns: Promise
               Resolve->cloudBoostFileObj
               Reject->Error on getMyUrl() or saving filestream or saving cloudBoostFileObject
    */
  upload(appId, fileStream, contentType, _fileObj, accessList, isMasterKey) {
    const deferred = q.defer();
    const fileObj = Object.assign({}, _fileObj);
    try {
      const promises = [];
      if (!fileObj._id) {
        fileObj._id = util.getId();
        fileObj._version = 0;
        fileObj.url = `${config.fileUrl}/${appId}/${fileObj._id}${fileObj.name.slice(fileObj.name.indexOf('.'), fileObj.name.length)}`;
      } else {
        fileObj._version += 1;
      }
      const collectionName = '_File';
      try {
        promises.push(mongoService.document.saveFileStream(appId, fileStream, fileObj._id, contentType));
        promises.push(customService.save(appId, collectionName, fileObj, accessList, isMasterKey));
      } catch (error) {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
      }
      // promises.push(mongoService.document.saveFileStream(appId, fileStream, fileObj._id, contentType));
      // promises.push(customService.save(appId, collectionName, fileObj, accessList, isMasterKey));
      q.all(promises).then((array) => {
        deferred.resolve(array[1]);
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
        if (file.length === 1) {
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

  async processImage(...args) {
    const deferred = q.defer();
    try {
      const image = await _processImage(...args); // eslint-disable-line
      deferred.resolve(image);
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

function _processImage(appId, fileName, resizeWidth, resizeHeight,
  cropX, cropY, cropW, cropH, quality,
  opacity, scale, containWidth, containHeight, rDegs, bSigma) {
  const deferred = q.defer();

  try {
    const promises = [];
    jimp.read(fileName, (err, image) => {
      if (err) deferred.reject(err);
      if (typeof resizeWidth !== 'undefined'
      && typeof resizeHeight !== 'undefined'
      && typeof quality !== 'undefined'
      && typeof opacity !== 'undefined'
      && typeof scale !== 'undefined'
      && typeof containWidth !== 'undefined'
      && typeof containHeight !== 'undefined'
      && typeof rDegs !== 'undefined'
      && typeof bSigma !== 'undefined'
      && typeof cropX !== 'undefined'
      && typeof cropY !== 'undefined'
      && typeof cropW !== 'undefined'
      && typeof cropH !== 'undefined') {
        image.resize(resizeWidth, resizeHeight)
          .crop(
            parseInt(cropX, 10),
            parseInt(cropY, 10),
            parseInt(cropW, 10),
            parseInt(cropH, 10),
          )
          .quality(parseInt(quality, 10))
          .opacity(parseFloat(opacity))
          .scale(parseInt(scale, 10))
          .contain(
            parseInt(containWidth, 10),
            parseInt(containHeight, 10),
          )
          .rotate(parseFloat(rDegs))
          .blur(parseInt(bSigma, 10), (err1, processedImage) => {
            promises.push(processedImage);
          });
      } else if (typeof resizeWidth === 'undefined'
      && typeof resizeHeight === 'undefined'
      && typeof quality === 'undefined'
      && typeof opacity === 'undefined'
      && typeof scale === 'undefined'
      && typeof containWidth === 'undefined'
      && typeof containHeight === 'undefined'
      && typeof rDegs === 'undefined'
      && typeof bSigma !== 'undefined'
      && typeof cropX === 'undefined'
      && typeof cropY === 'undefined'
      && typeof cropW === 'undefined'
      && typeof cropH === 'undefined') {
        image.blur(parseInt(bSigma, 10), (err2, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth !== 'undefined'
        && typeof resizeHeight !== 'undefined'
        && typeof quality === 'undefined'
        && typeof opacity === 'undefined'
        && typeof scale === 'undefined'
        && typeof containWidth === 'undefined'
        && typeof containHeight === 'undefined'
        && typeof rDegs === 'undefined'
        && typeof bSigma === 'undefined'
        && typeof cropX === 'undefined'
        && typeof cropY === 'undefined'
        && typeof cropW === 'undefined'
        && typeof cropH === 'undefined') {
        image.resize(parseInt(resizeWidth, 10), parseInt(resizeHeight, 10), (err3, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth === 'undefined'
        && typeof resizeHeight === 'undefined'
        && typeof quality === 'undefined'
        && typeof opacity === 'undefined'
        && typeof scale === 'undefined'
        && typeof containWidth === 'undefined'
        && typeof containHeight === 'undefined'
        && typeof rDegs === 'undefined'
        && typeof bSigma === 'undefined'
        && typeof cropX !== 'undefined'
        && typeof cropY !== 'undefined'
        && typeof cropW !== 'undefined'
        && typeof cropH !== 'undefined') {
        image.crop(
          parseInt(cropX, 10),
          parseInt(cropY, 10),
          parseInt(cropW, 10),
          parseInt(cropH, 10), (err4, processedImage) => promises.push(processedImage),
        );
      } else if (typeof resizeWidth === 'undefined'
        && typeof resizeHeight === 'undefined'
        && typeof quality !== 'undefined'
        && typeof opacity === 'undefined'
        && typeof scale === 'undefined'
        && typeof containWidth === 'undefined'
        && typeof containHeight === 'undefined'
        && typeof rDegs === 'undefined'
        && typeof bSigma === 'undefined'
        && typeof cropX === 'undefined'
        && typeof cropY === 'undefined'
        && typeof cropW === 'undefined'
        && typeof cropH === 'undefined') {
        image.quality(parseInt(quality, 10), (err5, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth === 'undefined'
        && typeof resizeHeight === 'undefined'
        && typeof quality === 'undefined'
        && typeof opacity === 'undefined'
        && typeof scale !== 'undefined'
        && typeof containWidth === 'undefined'
        && typeof containHeight === 'undefined'
        && typeof rDegs === 'undefined'
        && typeof bSigma === 'undefined'
        && typeof cropX === 'undefined'
        && typeof cropY === 'undefined'
        && typeof cropW === 'undefined'
        && typeof cropH === 'undefined') {
        image.scale(parseInt(scale, 10), (err6, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth === 'undefined'
        && typeof resizeHeight === 'undefined'
        && typeof quality === 'undefined'
        && typeof opacity === 'undefined'
        && typeof scale === 'undefined'
        && typeof containWidth !== 'undefined'
        && typeof containHeight !== 'undefined'
        && typeof rDegs === 'undefined'
        && typeof bSigma === 'undefined'
        && typeof cropX === 'undefined'
        && typeof cropY === 'undefined'
        && typeof cropW === 'undefined'
        && typeof cropH === 'undefined') {
        image.contain(parseInt(containWidth, 10), parseInt(containHeight, 10), (err7, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth === 'undefined'
        && typeof resizeHeight === 'undefined'
        && typeof quality === 'undefined'
        && typeof opacity === 'undefined'
        && typeof scale === 'undefined'
        && typeof containWidth === 'undefined'
        && typeof containHeight === 'undefined'
        && typeof rDegs !== 'undefined'
        && typeof bSigma === 'undefined'
        && typeof cropX === 'undefined'
        && typeof cropY === 'undefined'
        && typeof cropW === 'undefined'
        && typeof cropH === 'undefined') {
        image.rotate(parseFloat(rDegs), (err8, processedImage) => {
          promises.push(processedImage);
        });
      } else if (typeof resizeWidth === 'undefined'
        && typeof resizeHeight === 'undefined'
        && typeof quality === 'undefined'
        && typeof opacity !== 'undefined'
        && typeof scale === 'undefined'
        && typeof containWidth === 'undefined'
        && typeof containHeight === 'undefined'
        && typeof rDegs === 'undefined'
        && typeof bSigma === 'undefined'
        && typeof cropX === 'undefined'
        && typeof cropY === 'undefined'
        && typeof cropW === 'undefined'
        && typeof cropH === 'undefined') {
        image.opacity(parseFloat(opacity), (err9, processedImage) => {
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
