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
var wns = require('wns');

module.exports = function() {

	return {

		/*Desc   : Send Push Notification
		  Params : appId,collectionName,query, sort, limit, skip,accessList,isMasterKey,pushData
		  Returns: Promise
		           Resolve->No devices found or Result of ATLEAST ONE successful sent notifications
		           Reject->Error on find() or getAllSettings() or pushSettings not found or failure of sending all push notifications failed
		*/
		sendPush: function(appId,collectionName,query, sort, limit, skip,accessList,isMasterKey,pushData){

			var _self=this;

			var deferred = global.q.defer();

			try{

				var deviceObjects=null;
				var appSettingsObject=null;
				var pushTitle=null;

				var pushNotificationSettings=null;
				var pushSettingsFound=false;

				var appleCertificate=null;				
				var appleCertificateFound=false;

				var promisesList=[];

				//Get Device Objects 
				promisesList.push(global.customService.find(appId, collectionName, query, null, sort, limit, skip,accessList,isMasterKey));
				//Get App Settings
				promisesList.push(global.appService.getAllSettings(appId));
				//Check and Get Title for push notifications
				promisesList.push(_checkAndGetTitle(appId,pushData,appSettingsObject));				

				//Promise List
            	q.all(promisesList).then(function(resultList){

            		//Retrieve all results
            		deviceObjects=resultList[0];
            		appSettingsObject=resultList[1];
            		pushTitle=resultList[2];

            		//Set and check
            		pushData.title=pushTitle;            		

					if(appSettingsObject && appSettingsObject.length>0){
		                var pushSettings=_.where(appSettingsObject, {category: "push"});
		                if(pushSettings && pushSettings.length>0){

		                    pushSettingsFound=true;
		                    pushNotificationSettings=pushSettings[0].settings;

		                    if(pushSettings[0].settings.apple.certificates && pushSettings[0].settings.apple.certificates.length>0){
		                    	
		                    	//Get file name from uri
		                    	var fileName=pushSettings[0].settings.apple.certificates[0].split("/").reverse()[0];
		                    	if(fileName){
		                    		appleCertificateFound=true;
		                    		return global.mongoService.document.getFile(appId,fileName);
		                    	}
		                    	
		                    }                     
		                }
		            }

		            if(!pushSettingsFound){
		            	var noSettingPromise = global.q.defer();
		            	noSettingPromise.reject("Push Notification Settings not found.");
		            	return noSettingPromise.promise;
		            } 

		            if(pushSettingsFound && !appleCertificateFound){
		            	var emptyAppleCert = global.q.defer();
		            	emptyAppleCert.resolve(null);
		            	return emptyAppleCert.promise;
		            }

            	}).then(function(appleCertFileObj){
            		if(appleCertFileObj){
						appleCertificate=global.mongoService.document.getFileStreamById(appId,appleCertFileObj._id);
					}

					if(!deviceObjects || deviceObjects.length==0){
						return deferred.resolve("No Device objects found.");
					}else{

						var appleTokens =[];
		            	var googleTokens =[];
		            	var windowsUris=[];		            	

		            	for(var i=0;i<deviceObjects.length;++i){

		            		if(deviceObjects[i].deviceOS=="ios" && appleCertificate){	            			
		            			appleTokens.push(deviceObjects[i].deviceToken);
		            		}
		            		if(deviceObjects[i].deviceOS=="android"){
		            			googleTokens.push(deviceObjects[i].deviceToken);
		            		}
		            		if(deviceObjects[i].deviceOS=="windows"){
		            			windowsUris.push(deviceObjects[i].deviceToken);
		            		}		            		
		            	}	            	   		
	            		

	            		var promises=[];

		            	if(appleTokens && appleTokens.length>0 && appleCertificate){
		            		promises.push(_applePush(appleTokens,appleCertificate,pushData));
		            	}

		            	var android=pushNotificationSettings.android.credentials[0];
		            	if(googleTokens && googleTokens.length>0 && android.apiKey){
		            		promises.push(_googlePush(googleTokens,android.senderId,android.apiKey,pushData));
		            	}

		            	var windows=pushNotificationSettings.windows.credentials[0];
		            	if(windowsUris && windowsUris.length>0 && windows.securityId){
		            		promises.push(_windowsPush(windows.securityId,windows.clientSecret,windowsUris,pushData));
		            	}	            	
		            	

		            	//Promise List
		            	q.allSettled(promises).then(function(resultList){

		            		var resFulfilled=[];
		            		var resRejected=[];
		            		resultList.forEach(function (eachResult) {
						        if (eachResult.state === "fulfilled") {
						            resFulfilled.push(eachResult.value);
						        } else {
						            resRejected.push(eachResult.reason);
						        }
						    });

						    var responseObject={};
		            		responseObject.resolvedList=resFulfilled;
		            		responseObject.rejectedList=resRejected;


		            		//Check atleast one is fulfilled	            		
		            		if(resFulfilled && resFulfilled.length>0){
		            			deferred.resolve(responseObject);
		            		}else{
		            			deferred.reject(responseObject);
		            		}
		            		
		            	});
					}	            	
		            
            	},function(error){
					deferred.reject(error);
				});				

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }	

			return deferred.promise
		}
	};

};

/*Desc   : Check and get Title for push notifications
  Params : appId,data,appSettingsObject
  Returns: Promise
           Resolve->Title
           Reject->
*/
function _checkAndGetTitle(appId,data,appSettingsObject){

	var deferred = global.q.defer();

	try{

		if(!data.title){
			var appName=null;

			if(appSettingsObject && appSettingsObject.length>0){
	            var generalSettings=_.where(appSettingsObject, {category: "general"});
	            if(generalSettings && generalSettings.length>0){			                   

	                if(generalSettings[0].settings && generalSettings[0].settings.appName){	
	                	appName=generalSettings[0].settings.appName;		                    	
	                }                     
	            }
	        }

	        if(appName){
	        	deferred.resolve(appName);
	        }else{
	        	deferred.resolve("CloudBoost");
	        }

		}else{
			deferred.resolve(data.title);
		}

	} catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

	return deferred.promise;
}

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

		var respObj={};
		respObj.category="Apple Push Notifications";

		apnConnection.on("connected", function() {
		    console.log("Connected");
		});
	    apnConnection.on("error", function(error) {

	        respObj.response=error;
		   	return deferred.reject(respObj);
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

		respObj.response="Notification Sent";
		deferred.resolve(respObj);

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
function _googlePush(devicesTokens,senderId,apiKey,data){
            
    var defer = global.q.defer();
    
    try{
	    var sender = gcm.Sender(apiKey);    
	    
	    var message = new gcm.Message({	       
	        priority: 'high',
	        contentAvailable: true,
	        delayWhileIdle: false,
	        timeToLive: 3,
	        dryRun: false,
	        data: {
	            key: 'Cloudboost-PN-Service'
	        },
	        notification: {
	            title: data.title,
	            icon: data.icon || 'ic_launcher',
	            body: data.message
	        }
	    });   
	    
	    //send notification
	    sender.send(message, { registrationTokens: devicesTokens }, function (error, response) {

	    	var respObj={};
	    	respObj.category="Google Push Notifications";

	        if(error){	        	
	        	respObj.response=error;
		    	defer.reject(respObj);	            
	        }else{
	        	respObj.response=response;
	        	defer.resolve(respObj);             
	        } 	
	    });
    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        defer.reject(err);
    }        
    
    return defer.promise;
}

/*Desc   : Loop over pushUris Array and send Windows push notifications
  Params : securityId,clientSecret,pushUriArray,data
  Returns: Promise
           Resolve->Successfully resolved array if atleast one if fullfilled
           Reject->Rejected array if all failed to send
*/
function _windowsPush(securityId,clientSecret,pushUris,data){
	var defer = global.q.defer();	 

    try{
		 
		var respObj={};
		respObj.category="Windows Push Notifications";
			 
    	var promises=[];

    	for(var i=0;i<pushUris.length;++i){
    		promises.push(_sendWindowsPushNotification(securityId,clientSecret,pushUris[i],data));
    	}
    	
        //Promise List
    	q.allSettled(promises).then(function(resultList){

    		var resFulfilled=[];
    		var resRejected=[];
    		resultList.forEach(function (eachResult) {
		        if (eachResult.state === "fulfilled") {
		            resFulfilled.push(eachResult.value);
		        } else {
		            resRejected.push(eachResult.reason);
		        }
		    });		    

    		//Check atleast one is fulfilled	            		
    		if(resFulfilled && resFulfilled.length>0){
    			respObj.response=resFulfilled;
    			defer.resolve(respObj);
    		}else{
    			respObj.response=resRejected;
    			defer.reject(respObj);
    		}
    		
    	}); 

	} catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        defer.reject(err);
    } 
    
    return defer.promise;
}

/*Desc   : Send Windows push notification
  Params : securityId,clientSecret,pushUri,data
  Returns: Promise
           Resolve->Success
           Reject->Fail to send
*/
function _sendWindowsPushNotification(securityId,clientSecret,pushUri,data){

    var defer = global.q.defer();	 

    try{
		wns.send(pushUri, data.message, "wns/toast", {client_id:securityId,client_secret:clientSecret}, function(err, res){			

		    if(err){	        	
		        defer.reject(err);
		    }else{        	
		    	defer.resolve(res);		        
		    }
		}); 

	} catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        defer.reject(err);
    } 
    
    return defer.promise;
}