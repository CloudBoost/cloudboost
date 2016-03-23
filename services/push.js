var Collections = require('../database-connect/collections.js');
var q = require('q');
var fs = require('fs');
var crypto = require("crypto");
var uuid = require('uuid');
var customHelper = require('../helpers/custom.js');
var _ = require('underscore');
var util = require('../helpers/util.js');
var Stream = require('stream');
var Grid = require('gridfs-stream');

var gcm = require('node-gcm');
var apn = require('apn');
var mpns = require('mpns');
var wns = require('wns');

module.exports = function() {

	return {

		/*Desc   : Send Push Notification
		  Params : appId,collectionName,query, sort, limit, skip,accessList,isMasterKey,pushData
		  Returns: Promise
		           Resolve->No devices found or Result of sending notifications
		           Reject->Error on find() or getAllSettings() or pushSettings not found or q.all(Promises)
		*/
		sendPush: function(appId,collectionName,query, sort, limit, skip,accessList,isMasterKey,pushData){

			var _self=this;

			var deferred = global.q.defer();

			try{

				var pushNotificationSettings=null;
				var appleCertificate=null;
				
				global.customService.find(appId, collectionName, query, null, sort, limit, skip,accessList,isMasterKey)
				.then(function(deviceObjects){

					if(!deviceObjects || deviceObjects.length==0){
						return deferred.resolve("No Device objects found.");
					}

					global.appService.getAllSettings(appId).then(function(appSettings){

						var pushSettingsFound=false;
						var appleCertificateFound=false;

						if(appSettings && appSettings.length>0){
			                var pushSettings=_.where(appSettings, {category: "push"});
			                if(pushSettings && pushSettings.length>0){

			                    pushSettingsFound=true;
			                    pushNotificationSettings=pushSettings[0].settings;

			                    if(pushSettings[0].settings.apple.certificates && pushSettings[0].settings.apple.certificates.length>0){
			                    	
			                    	//Get file name from uri
			                    	var fileName=pushSettings[0].settings.apple.certificates[0].split("/").reverse()[0];
			                    	if(fileName){
			                    		appleCertificateFound=true;
			                    		return _self.getFile(appId,fileName);
			                    	}
			                    	
			                    }                     
			                }
			            }

			            if(!pushSettingsFound){
			            	return deferred.reject("Push Notification Settings not found.");
			            } 

			            if(pushSettingsFound && !appleCertificateFound){
			            	var emptyAppleCert = global.q.defer();
			            	emptyAppleCert.resolve(null);
			            	return emptyAppleCert.promise
			            }	            

					}).then(function(appleCertFileObj){

						if(appleCertFileObj){
							appleCertificate=_self.getFileStreamById(appId,appleCertFileObj._id);
						}

						if(deviceObjects && deviceObjects.length>0){            	

			            	var appleTokens  =[];
			            	var googleTokens  =[];
			            	var windowsPhoneUris=[];
			            	var windowsDesktopUris=[];

			            	for(var i=0;i<deviceObjects.length;++i){

			            		if(deviceObjects[i].deviceOS=="ios" && appleCertificate){	            			
			            			appleTokens.push(deviceObjects[i].deviceToken);
			            		}
			            		if(deviceObjects[i].deviceOS=="android"){
			            			googleTokens.push(deviceObjects[i].deviceToken);
			            		}
			            		if(deviceObjects[i].deviceOS=="windowsPhone"){
			            			windowsPhoneUris.push(deviceObjects[i].deviceToken);
			            		}
			            		if(deviceObjects[i].deviceOS=="windowsApp"){
			            			windowsDesktopUris.push(deviceObjects[i].deviceToken);
			            		}
			            	}

			            	var promises=[];

			            	if(appleTokens && appleTokens.length>0 && appleCertificate){
			            		promises.push(_applePush(appleTokens,appleCertificate,pushData));
			            	}

			            	var andriod=pushNotificationSettings.andriod.credentials[0];
			            	if(googleTokens && googleTokens.length>0 && andriod.apiKey){
			            		promises.push(_googlePush(googleTokens,andriod.senderId,andriod.apiKey,pushData));
			            	}

			            	var windows=pushNotificationSettings.windows.credentials[0];
			            	if(windowsPhoneUris && windowsPhoneUris.length>0 && windows.securityId){
			            		promises.push(_windowsPhonePush(windows.securityId,windows.clientSecret,windowsPhoneUris,pushData));
			            	}
			            	
			            	if(windowsDesktopUris && windowsDesktopUris.length>0 && windows.securityId){
			            		promises.push(_windowsDesktopPush(windows.securityId,windows.clientSecret,windowsDesktopUris,pushData));
			            	}

			            	//Promise List
			            	q.all(promises).then(function(resultList){
			            		deferred.resolve(resultList);
			            	},function(error){
								deferred.reject(error);
							});		
			            }

					},function(error){
						deferred.reject(error);
					});

				},function(error){
					deferred.reject(error);
				});

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }	

			return deferred.promise
		},

		/*Desc   : Get file from gridfs
		  Params : appId,filename
		  Returns: Promise
		           Resolve->file
		           Reject->Error on findOne() or file not found(null)
		*/
		getFile : function(appId,filename){

		    var deferred = global.q.defer();

		    try{
			    var gfs = Grid(global.mongoClient.db(appId), require('mongodb'));

			    gfs.findOne({filename: filename},function (err, file) {
			        if (err){           
			            return deferred.reject(err);
			        }    
			        if(!file){
			            return deferred.resolve(null);                    
			        }  

			        return deferred.resolve(file);  
			    });

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

		    return deferred.promise;
		},
		/*Desc   : Get fileStream from gridfs
		  Params : appId,fileId
		  Returns: fileStream 
		*/
		getFileStreamById: function(appId,fileId){
			try{
	            var gfs = Grid(global.mongoClient.db(appId), require('mongodb'));

	            var readstream = gfs.createReadStream({
	              _id: fileId
	            });

	            return readstream;

        	} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                return null;
            }
        },
        /*Desc   : Delete file from gridfs
		  Params : appId,filename
		  Returns: Promise
		           Resolve->true
		           Reject->Error on exist() or remove() or file does not exists
		*/
        deleteFileFromGridFs: function(appId,filename){

		    var deferred = global.q.defer(); 

		    try{
			    var gfs = Grid(global.mongoClient.db(appId), require('mongodb'));

			    //File existence checking
			    gfs.exist({filename: filename}, function (err, found) {
			      if (err){
			        //Error while checking file existence
			        deferred.reject(err);
			      }
			      if(found){       
			        gfs.remove({filename: filename},function (err) {
			            if (err){
			                deferred.reject(err);
			                //unable to delete     
			            }else{
			                deferred.resolve(true);
			                //deleted
			            }                            
			            
			            return deferred.resolve("Success");  
			        });
			      }else{
			        //file does not exists
			        deferred.reject("file does not exists");
			      }
			    });

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
		    
		    return deferred.promise;
		},
		/*Desc   : Save filestream to gridfs
		  Params : appId,fileStream,fileName,contentType
		  Returns: Promise
		           Resolve->fileObject
		           Reject->Error on writing file
		*/
		saveFileStream:function (appId,fileStream,fileName,contentType){

		    var deferred = global.q.defer();

		    try{
			    var gfs = Grid(global.mongoClient.db(appId), require('mongodb'));

			    //streaming to gridfs    
			    var writestream = gfs.createWriteStream({
			        filename: fileName,
			        mode: 'w',
			        content_type:contentType
			    });

			    fileStream.pipe(writestream); 		    
			    
			    writestream.on('close', function (file) {               
			        deferred.resolve(file);		        
			        console.log("Successfully saved in gridfs");
			    });

			    writestream.on('error', function (error) {           
			        deferred.reject(error);
			        writestream.destroy();
			        console.log("Failed to saved in gridfs");
			    }); 

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

		    return deferred.promise;
		},
	};

};


/*Desc   : send Apple push notification
  Params : tokens,certifcate,data
  Returns: Promise
           Resolve->Success
           Reject->Error on connecting to apn
*/
function _applePush(tokens,certifcate,data){
    var deferred = global.q.defer();

    try{
	    var options = {cert: certifcate};
	    
	    var apnConnection = new apn.Connection(options);

	    //sending data to devices using device token.
		var note = new apn.Notification();
		note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
		note.badge = data.badge || 1;
		note.sound = data.sound || "ping.aiff";
		note.alert = "\uD83D\uDCE7 \u2709"+ data.title;
		note.payload = {'messageFrom': data.message};

		apnConnection.on("connected", function() {
		    console.log("Connected");
		});
	    apnConnection.on("error", function(error) {
		   return deferred.reject(error);
		});

		apnConnection.pushNotification(note, tokens);

		apnConnection.on("transmitted", function(notification, device) {
		    console.log("Notification transmitted to:" + device.token.toString("hex"));
		});

		apnConnection.on("transmissionError", function(errCode, notification, device) {
		    console.error("Notification caused error: " + errCode + " for device ", device, notification);
		    if (errCode === 8) {
		        console.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
		    }
		});

		apnConnection.on("timeout", function () {
		    console.log("Connection Timeout");
		});

		apnConnection.on("disconnected", function() {
		    console.log("Disconnected from APNS");
		});

		apnConnection.on("socketError", function(){
			console.log("Socket Error");
		});

		deferred.resolve("Notification Sent");

	} catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

	return deferred.promise;    
}

/*Desc   : send Google push notification
  Params : senderId,apiKey,devicesTokens,data
  Returns: Promise
           Resolve->Success
           Reject->Fail to send
*/
function _googlePush(senderId,apiKey,devicesTokens,data){
            
    var defer = global.q.defer();
    
    try{
	    var sender = gcm.Sender(apiKey);    
	    
	    var message = new gcm.Message({
	        collapseKey: 'demo',
	        priority: 'high',
	        contentAvailable: true,
	        delayWhileIdle: true,
	        timeToLive: 3,
	        dryRun: false,
	        data: {
	            data: 'Cloudboost-PN-Service'
	        },
	        notification: {
	            title: data.title,
	            icon: data.icon || 'ic_launcher',
	            body: data.message
	        }
	    });   
	    
	    //send notification
	    sender.send(message, { registrationTokens: devices }, function (error, response) {
	        if(!error){
	            defer.resolve(response);
	        }else{
	            defer.reject(error);
	        } 	
	    });
    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        defer.reject(err);
    }        
    
    return defer.promise;
}

/*Desc   : send WindowsPhone push notification
  Params : securityId,clientSecret,pushUris,data
  Returns: Promise
           Resolve->Success
           Reject->Fail to send
*/
function _windowsPhonePush(securityId,clientSecret,pushUris,data){
    var defer = global.q.defer();   
   
   	try{
	    mpns.sendToast(pushUris, data.title, data.message, function(err, res){
	        if(!err){
	            defer.resolve(res);
	        }else{
	            defer.reject(err);
	        }
	    }); 

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        defer.reject(err);
    }      
   
    return defer.promise;
}

/*Desc   : send WindowsDesktop push notification
  Params : securityId,clientSecret,pushUris,data
  Returns: Promise
           Resolve->Success
           Reject->Fail to send
*/
function _windowsDesktopPush(securityId,clientSecret,pushUris,data){

    var defer = global.q.defer();	 

    try{
		wns.sendToast(pushUris, data.message, {client_id:securityId,client_secret:clientSecret}, function(err, res){
		    if(!err){
		        defer.resolve(res);
		    }else{
		        defer.reject(err);
		    }
		}); 

	} catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        defer.reject(err);
    } 
    
    return defer.promise;
}