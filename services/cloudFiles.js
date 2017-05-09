/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require("q");
var Grid = require('gridfs-stream');
var util = require("../helpers/util.js");
var jimp = require("jimp");

module.exports = function() {

    return {
        /*Desc   : Save FileStream & CloudBoostFileObject
          Params : appId,fileStream,fileContentType,CloudBoostFileObj
          Returns: Promise
                   Resolve->cloudBoostFileObj
                   Reject->Error on getMyUrl() or saving filestream or saving cloudBoostFileObject
        */
        upload: function(appId, fileStream, contentType, fileObj, accessList, isMasterKey) {
            console.log('+++++ In File Upload Service ++++++++');
            var deferred = q.defer();

            try {
                var promises = [];
                var newFileName = '';

                global.keyService.getMyUrl().then(function(url) {

                    if (!fileObj._id) {
                        fileObj._id = util.getId();
                        fileObj._version = 0;
                        newFileName = fileObj._id + fileObj.name.slice(fileObj.name.indexOf('.'), fileObj.name.length);
                        fileObj.url = url + "/file/" + appId + "/" + fileObj._id + fileObj.name.slice(fileObj.name.indexOf('.'), fileObj.name.length);
                        console.log("File URL : ");
                        console.log(fileObj.url);
                    } else {
                        fileObj._version = fileObj._version + 1;
                    }
                    var collectionName = "_File";
                    promises.push(global.mongoService.document.saveFileStream(appId, fileStream, fileObj._id, contentType));
                    promises.push(global.customService.save(appId, collectionName, fileObj, accessList, isMasterKey));
                    global.q.all(promises).then(function(array) {
                        deferred.resolve(array[1]);
                    }, function(err) {
                        deferred.reject(err);
                    });
                }, function(error) {
                    deferred.reject(error);
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }

            return deferred.promise;
        },

        /*Desc   : delete file from gridFs & delete CloudBoostFileObj
          Params : appId,cloudBoostFileObj,accessList,masterKey
          Returns: Promise
                   Resolve->cloudBoostFileObj
                   Reject->Error on getMyUrl() or saving filestream or saving cloudBoostFileObject
        */
        delete: function(appId, fileObj, accessList, isMasterKey) {
            console.log('+++++ In File Delete Service ++++++++');
            var collectionName = '_File';
            var deferred = q.defer();
            try {
                var collectionName = "_File";
                var fileUrl = global.keys.fileUrl + appId + "/";
                var filename = fileObj.url.substr(fileUrl.length, fileObj.url.length + 1);
                console.log(filename + "  " + fileObj.url);

                var promises = [];
                promises.push(global.mongoService.document.deleteFileFromGridFs(appId, fileObj._id));
                promises.push(global.customService.delete(appId, collectionName, fileObj, accessList, isMasterKey));
                global.q.all(promises).then(function() {
                    deferred.resolve();
                }, function(err) {
                    deferred.reject(err);
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
            return deferred.promise;
        },

        /*Desc   : get File
          Params : appId,fileName,accessList,masterKey
          Returns: Promise
                   Resolve->gridFsFileObject
                   Reject->Error on _readFileACL() or getFile from gridFs
        */
        getFile: function(appId, filename, accessList, isMasterKey) {
            console.log('+++++ In Get File Service ++++++++');
            var deferred = q.defer();

            try {
                var collectionName = "_File";
                global.customService.find(appId, collectionName, {
                    _id: filename.split('.')[0]
                }, null, null, 1, 0, accessList, isMasterKey, null).then(function(file) {
                    if (file.length == 1) {
                        console.log("Read Access Allowed.");
                        global.mongoService.document.getFile(appId, filename.split('.')[0]).then(function(res) {
                            deferred.resolve(res);
                        }, function(err) {
                            deferred.reject(err);
                        });
                    } else {
                        console.log("Read Access Denied.");
                        deferred.reject("Unauthorized");
                    }
                }, function() {
                    deferred.reject("Unauthorized");
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
            return deferred.promise;
        },

        processImage: function(appId, fileName, resizeWidth, resizeHeight, cropX, cropY, cropW, cropH, quality, opacity, scale, containWidth, containHeight, rDegs, bSigma) {
            var deferred = q.defer();
            try {
                _processImage(appId, fileName, resizeWidth, resizeHeight, cropX, cropY, cropW, cropH, quality, opacity, scale, containWidth, containHeight, rDegs, bSigma).then(function(image) {
                    deferred.resolve(image);
                }, function(err) {
                    deferred.reject(err);
                });
            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
            return deferred.promise;
        }
    };
};

function _processImage(appId, fileName, resizeWidth, resizeHeight, cropX, cropY, cropW, cropH, quality, opacity, scale, containWidth, containHeight, rDegs, bSigma) {
    var deferred = global.q.defer();

    try {
        var promises = [];
        jimp.read(fileName, function(err, image) {
            if (err)
                deferred.reject(err);
            if (typeof resizeWidth != 'undefined' && typeof resizeHeight != 'undefined' && typeof quality != 'undefined' && typeof opacity != 'undefined' && typeof scale != 'undefined' && typeof containWidth != 'undefined' && typeof containHeight != 'undefined' && typeof rDegs != 'undefined' && typeof bSigma != 'undefined' && typeof cropX != 'undefined' && typeof cropY != 'undefined' && typeof cropW != 'undefined' && typeof cropH != 'undefined') {
                image.resize(resizeWidth, resizeHeight).crop(parseInt(cropX), parseInt(cropY), parseInt(cropW), parseInt(cropH)).quality(parseInt(quality)).opacity(parseFloat(opacity)).scale(parseInt(scale)).contain(parseInt(containWidth), parseInt(containHeight)).rotate(parseFloat(rDegs)).blur(parseInt(bSigma), function(err, processedImage) {
                    promises.push(processedImage);
                });
            } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma != 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
                image.blur(parseInt(bSigma), function(err, processedImage) {
                    promises.push(processedImage);
                });
            } else if (typeof resizeWidth != 'undefined' && typeof resizeHeight != 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
                image.resize(parseInt(resizeWidth), parseInt(resizeHeight), function(err, processedImage) {
                    promises.push(processedImage);
                });
            } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX != 'undefined' && typeof cropY != 'undefined' && typeof cropW != 'undefined' && typeof cropH != 'undefined') {
                image.crop(parseInt(cropX), parseInt(cropY), parseInt(cropW), parseInt(cropH), function(err, processedImage) {
                    promises.push(processedImage);
                });
            } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality != 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
                image.quality(parseInt(quality), function(err, processedImage) {
                    promises.push(processedImage);
                });
            } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale != 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
                image.scale(parseInt(scale), function(err, processedImage) {
                    promises.push(processedImage);
                });
            } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth != 'undefined' && typeof containHeight != 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
                image.contain(parseInt(containWidth), parseInt(containHeight), function(err, processedImage) {
                    promises.push(processedImage);
                });
            } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth == 'undefined' && typeof containHeight == 'undefined' && typeof rDegs != 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
                image.rotate(parseFloat(rDegs), function(err, processedImage) {
                    promises.push(processedImage);
                });
            } else if (typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity != 'undefined' && typeof scale === 'undefined' && typeof containWidth == 'undefined' && typeof containHeight == 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW === 'undefined' && typeof cropH === 'undefined') {
                image.opacity(parseFloat(opacity), function(err, processedImage) {
                    promises.push(processedImage);
                });
            }
        });
        q.all(promises).then(function(image) {
            deferred.resolve(image);
        }, function(err) {
            deferred.reject(err);
        });

    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
        deferred.reject(err);
    }

    return deferred.promise;
}
