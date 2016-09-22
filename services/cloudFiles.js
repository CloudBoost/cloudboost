
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var q =           require("q");
var fs =          require('fs');
var GridStore =   require('mongodb').GridStore;
var Grid =        require('gridfs-stream');
var util =        require("../helpers/util.js");
var jimp =        require("jimp");


module.exports = function() {

	return {
        /*Desc   : Save FileStream & CloudBoostFileObject
          Params : appId,fileStream,fileContentType,CloudBoostFileObj
          Returns: Promise
                   Resolve->cloudBoostFileObj
                   Reject->Error on getMyUrl() or saving filestream or saving cloudBoostFileObject
        */
		upload: function(appId,fileStream,contentType,fileObj) {
			console.log('+++++ In File Upload Service ++++++++');
			var deferred = q.defer();

            try{
                var promises = [];
                var newFileName ='';      

                global.keyService.getMyUrl().then(function(url){

                    if(!fileObj._id){
                        fileObj._id = util.getId();
                        fileObj._version = 0;
                        newFileName = fileObj._id+fileObj.name.slice(fileObj.name.indexOf('.'),fileObj.name.length);
                        fileObj.url = url+"/file/"+appId + "/" + fileObj._id+fileObj.name.slice(fileObj.name.indexOf('.'),fileObj.name.length);
                        console.log("File URL : ");
                        console.log(fileObj.url);
                    }else{
                        fileObj._version = fileObj._version+1;
                    }

                    promises.push(global.mongoService.document.saveFileStream(appId,fileStream,fileObj._id,contentType));
                    promises.push(_saveFileObj(appId,fileObj));
                    global.q.all(promises).then(function(array){
                        deferred.resolve(array[1]);
                    },function(err){
                        deferred.reject(err);
                    });

                }, function(error){
                    deferred.reject(error);
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
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
		delete: function(appId,fileObj,accessList,isMasterKey) {
			console.log('+++++ In File Delete Service ++++++++');

			var deferred = q.defer();
            try{
                var collectionName = "_File";
    			var fileUrl = global.keys.fileUrl +appId+"/";
    			var filename = fileObj.url.substr(fileUrl.length, fileObj.url.length+1);
    			console.log(filename + "  " +fileObj.url);

                var promises = [];

                _checkWriteACL(appId,collectionName,fileObj._id,accessList,isMasterKey).then(function(){
                    promises.push(global.mongoService.document.deleteFileFromGridFs(appId,fileObj._id));
                    promises.push(_deleteFileObj(appId,fileObj));

                    global.q.all(promises).then(function(){
                        deferred.resolve();
                    },function(err){
                        deferred.reject(err);
                    });
                },function(err){
                    deferred.reject("Unauthorized");
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
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
		getFile: function(appId, filename,accessList,isMasterKey) {
			console.log('+++++ In Get File Service ++++++++');
			var deferred = q.defer();

            try{
    			var collectionName = "_File";
                var promises = [];
    			_readFileACL(appId,collectionName,filename.split('.')[0],accessList,isMasterKey).then(function(allowRead){
                    console.log("Read Access Allowed.");
                    global.mongoService.document.getFile(appId,filename.split('.')[0]).then(function(res){
                        deferred.resolve(res);
                    },function(err){
                       deferred.reject(err);
                    });
                },function(){
                    deferred.reject("Unauthorized");
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            return deferred.promise;
		},

        processImage: function(appId,fileName, resizeWidth, resizeHeight,cropX, cropY, cropW, cropH, quality, opacity, scale, containWidth, containHeight,rDegs,bSigma){
            var deferred = q.defer();
            try{
                _processImage(appId,fileName, resizeWidth, resizeHeight,cropX, cropY, cropW, cropH, quality, opacity, scale, containWidth, containHeight,rDegs,bSigma).then(function(image){
                    deferred.resolve(image);
                }, function(err){
                    deferred.reject(err);
                });
            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            return deferred.promise;
        },
      
	};
};

/*Desc   : Save cloudBoostFileObject
  Params : appId,cloudBoostFileObject
  Returns: Promise
           Resolve->saved cloudBoostFileObject
           Reject->Error on saving
*/
function _saveFileObj(appId,document){
    var deferred = global.q.defer();

    try{
        var collectionName = "_File";
        global.mongoService.document._update(appId, collectionName, document).then(function(doc){
            console.log('Document updated.');
            deferred.resolve(doc);
        },function(err){
            global.winston.log('error',err);
            deferred.reject(err);
        });

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;
}

/*Desc   : delete cloudBoostFileObject
  Params : appId,cloudBoostFileObject
  Returns: Promise
           Resolve->deleted cloudBoostFileObject
           Reject->Error on deleting
*/
function _deleteFileObj(appId,document){
    var deferred = global.q.defer();

    try{
        var collectionName = "_File";
        global.mongoService.document.delete(appId, collectionName, document).then(function(doc){
            console.log('Document Deleted');
            deferred.resolve(doc);
        },function(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack});
            deferred.reject(err);
        });

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }
    return deferred.promise;
}


function _checkWriteACL(appId,collectionName,fileId,accessList,isMasterKey){
    var deferred = global.q.defer();

    try{
        var status = false;
        console.log("File write ACL check...");

        var done = false;

        if(isMasterKey){
            console.log("Deleting file with master key");
            deferred.resolve(true);
        }else {
            //Setting the Master key to true because if it is False and the User Does not have access to read the document
            // then this will return true which is wrong.
            global.mongoService.document.get(appId, collectionName, fileId, accessList, true).then(function (doc) {

                console.log("File object found.")
                console.log(doc);

                if (doc) {
                    var acl = doc.ACL;
                    console.log("ACL");
                    console.log(acl);
                    if (acl.write.allow.user.indexOf("all") > -1) {
                        console.log("Public write access");
                        status = true;
                        deferred.resolve(true);
                        done = true;
                    } else {
                        if (Object.keys(accessList).length === 0) {
                            console.log("Write Access Denied.");
                            deferred.reject(false);
                            done = true;
                        } else {
                            if (accessList.userId && acl.write.allow.user.indexOf(accessList.userId) > -1) {
                                console.log("Write Access Granted to specific user");
                                status = true;
                                deferred.resolve(true);
                                done = true;
                            }
                            else if (accessList.userId && acl.write.deny.user.indexOf(accessList.userId) > -1){
                                deferred.reject(false);
                                console.log("Write Access Denied to specific user");
                                done = true;
                            }
                            else {
                                for (var i = 0; i < accessList.roles.length; i++) {
                                    if (acl.write.allow.role.indexOf(accessList.roles[i]) > -1) {
                                        status = true;
                                        deferred.resolve(true);
                                        console.log("Write Access Granted to specific role");
                                        done = true;
                                    }

                                    if(acl.write.deny.role.indexOf(accessList.roles[i]) > -1){
                                        console.log("Write Access Denied to a specific role");
                                        deferred.reject(false);
                                        done = true;
                                    }
                                }
                            }

                            if(!done){
                                console.log("Unauthorized to write.");
                                deferred.reject(false);
                            }

                        }
                    }
                } else {
                    deferred.reject(false);
                }
            }, function (err) {
                deferred.reject(false);
            });
        }

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }
    return deferred.promise;
}

function _readFileACL(appId,collectionName,fileId,accessList,isMasterKey){

    console.log("IS MASKER : "+isMasterKey);

    var deferred = global.q.defer();

    try{
        var status = false;

        if(isMasterKey){
            deferred.resolve(true);
        }else{

            //Setting the Master key to true because if it is False and the User Does not have access to read the document
            // then this will return true which is wrong.

            global.mongoService.document.get(appId, collectionName, fileId, accessList, true).then(function (doc) {
                if(doc) {
                    var acl = doc.ACL;
                    console.log("ACL");
                    console.log(acl);
                    if (acl.read.allow.user.indexOf("all") > -1) {
                        console.log("All users read allowed");
                        status = true;
                        deferred.resolve(true);
                    } else {
                        if (Object.keys(accessList).length === 0) {
                            console.log("All user Access Denied");
                            deferred.reject(false);
                        } else {
                            if (accessList.userId && acl.read.allow.user.indexOf(accessList.userId) > -1) {
                                console.log("Specific User Access Allowed.")
                                status = true;
                                deferred.resolve(true);
                            }
                            else if (accessList.userId && acl.read.deny.user.indexOf(accessList.userId) > -1) {
                                console.log("Specific User Access Denied.");
                                deferred.reject(false);
                            }
                            else {
                                for (var i = 0; i < accessList.roles.length; i++) {
                                    if (acl.read.allow.role.indexOf(accessList.roles[i]) > -1) {
                                        console.log("Specific Role Access Allowed");
                                        status = true;
                                        deferred.resolve(true);
                                    }

                                    if(acl.read.deny.role.indexOf(accessList.roles[i]) > -1){
                                        console.log("Specific Role Access Denied");
                                        deferred.reject(false);
                                    }
                                }
                            }

                            deferred.reject(false);
                        }
                    }
                }else{
                    deferred.reject(false);
                }
            }, function (err) {
                deferred.reject(false);
            });
        }

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;
}


function _processImage(appId,fileName, resizeWidth, resizeHeight,cropX, cropY, cropW, cropH, quality, opacity, scale, containWidth, containHeight,rDegs,bSigma){
    var deferred = global.q.defer();

    try{
        var promises = [];
        jimp.read(fileName, function(err, image){
            if(err) deferred.reject(err);
            if(typeof resizeWidth != 'undefined' && typeof resizeHeight != 'undefined' && typeof quality != 'undefined' && typeof opacity != 'undefined' && typeof scale != 'undefined' && typeof containWidth != 'undefined' && typeof containHeight != 'undefined' && typeof rDegs != 'undefined' && typeof bSigma != 'undefined' && typeof cropX != 'undefined' && typeof cropY != 'undefined' && typeof cropW !='undefined' && typeof cropH != 'undefined'){
               image.resize(resizeWidth, resizeHeight)
               .crop(parseInt(cropX), parseInt(cropY), parseInt(cropW), parseInt(cropH))
               .quality(parseInt(quality))
               .opacity(parseFloat(opacity))
               .scale(parseInt(scale))
               .contain(parseInt(containWidth), parseInt(containHeight))
               .rotate(parseFloat(rDegs))
               .blur(parseInt(bSigma), function(err, processedImage){
                promises.push(processedImage);
              });
           }else if(typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma != 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW ==='undefined' && typeof cropH === 'undefined'){
               image.blur(parseInt(bSigma), function(err, processedImage){
                promises.push(processedImage);
              });
          }else if(typeof resizeWidth != 'undefined' && typeof resizeHeight != 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW ==='undefined' && typeof cropH === 'undefined'){
               image.resize(parseInt(resizeWidth), parseInt(resizeHeight), function(err, processedImage){
                promises.push(processedImage);
              });
          }else if(typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX != 'undefined' && typeof cropY != 'undefined' && typeof cropW !='undefined' && typeof cropH != 'undefined'){
              image.crop(parseInt(cropX),parseInt(cropY),parseInt(cropW),parseInt(cropH), function(err, processedImage){
                promises.push(processedImage);
              });
          }else if(typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality != 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW ==='undefined' && typeof cropH === 'undefined'){
              image.quality(parseInt(quality), function(err, processedImage){
                promises.push(processedImage);
              });
          }else if(typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale != 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW ==='undefined' && typeof cropH === 'undefined'){
               image.scale(parseInt(scale), function(err, processedImage){
                promises.push(processedImage);
              });
          }else if(typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth != 'undefined' && typeof containHeight != 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW ==='undefined' && typeof cropH === 'undefined'){
               image.contain(parseInt(containWidth), parseInt(containHeight), function(err, processedImage){
                promises.push(processedImage);
              });
          }else if(typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth == 'undefined' && typeof containHeight == 'undefined' && typeof rDegs != 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW ==='undefined' && typeof cropH === 'undefined'){
              image.rotate(parseFloat(rDegs), function(err, processedImage){
                promises.push(processedImage);
              });
          }else if(typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity != 'undefined' && typeof scale === 'undefined' && typeof containWidth == 'undefined' && typeof containHeight == 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW ==='undefined' && typeof cropH === 'undefined'){
             image.opacity(parseFloat(opacity), function(err, processedImage){
                promises.push(processedImage);
              });
          }
        });
        q.all(promises).then(function (image) {
             deferred.resolve(image);
          }, function (err) {
             deferred.reject(err)
        });

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;
};