
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


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
var webPush = require('web-push');

module.exports = function() {

	return {
		
	   /*Desc   : Upsert Device Object
		  Params : appId, collectionName, document, accessList, isMasterKey
		  Returns: Promise
		           Resolve->device object
		           Reject->Error on findOne() or save()
		*/
		upsertDevice: function(appId, collectionName, document, accessList, isMasterKey){

			var _self=this;			
			
			var deferred = global.q.defer();

			try{					
			   			    
			    var select = {};
			    var sort = {};
			    var skip = 0;			    

			    var query = {};
			    query.$include = [];
				query.$includeList = [];
				query["deviceOS"] = document.deviceOS;
				query["deviceToken"] = document.deviceToken;

			    global.customService.findOne(appId, collectionName, query, select, sort, skip, accessList, isMasterKey).then(function(respDoc){
			    	
			    	if(respDoc){
			    		console.log("Device found with given deviceToken");

			    		respDoc.deviceOS=document.deviceOS;
			    		respDoc.deviceOS=document.deviceToken;

			    		respDoc._modifiedColumns=["deviceOS"];
			    		respDoc._modifiedColumns=["deviceToken"];
			    	}else{
						var respDoc=document;
			    	}	    				    	
			    	
			    	return global.customService.save(appId, collectionName, respDoc, accessList, isMasterKey);

			    }).then(function(result){		    	
			    	deferred.resolve(result);
			    },function(error){
			    	deferred.reject(error);
			    });			    						

			} catch(err){           
	            global.winston.log('error',{"error":String(err),"stack": new Error().stack});
	            deferred.reject(err);
	        }	

			return deferred.promise
		},

		/*Desc   : Delete Device Object
		  Params : appId, collectionName, document, accessList, isMasterKey
		  Returns: Promise
		           Resolve->device object
		           Reject->Error on find()  or delete()
		*/
		deleteDevice: function(appId, collectionName, document, accessList, isMasterKey){

			var _self=this;			
			
			var deferred = global.q.defer();

			try{					
			   			    
			    var select = {};
			    var sort = {};
			    var skip = 0;
			    var limit=999999;			    

			    var query = {};
			    query.$include = [];
				query.$includeList = [];
				query["deviceOS"] = document.deviceOS;
				query["deviceToken"] = document.deviceToken;

			    global.customService.find(appId, collectionName, query, select, sort, limit, skip, accessList, isMasterKey,null).then(function(list){			    			    	
			    	
			    	return global.customService.delete(appId, collectionName, list, accessList, isMasterKey);

			    }).then(function(result){		    	
			    	deferred.resolve(result);
			    },function(error){
			    	deferred.reject(error);
			    });			    						

			} catch(err){           
	            global.winston.log('error',{"error":String(err),"stack": new Error().stack});
	            deferred.reject(err);
	        }	

			return deferred.promise
		},
		

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
				

				var pushNotificationSettings=null;
				var pushSettingsFound=false;

				var appleCertificate=null;				
				var appleCertificateFound=false;

				var promisesList=[];

				//Get Device Objects 
				promisesList.push(global.customService.find(appId, collectionName, query, null, sort, limit, skip,accessList,isMasterKey));
				//Get App Settings
				promisesList.push(global.appService.getAllSettings(appId));				
								

				//Promise List
            	q.all(promisesList).then(function(respList){

            		deviceObjects=respList[0];
            		appSettingsObject=respList[1];

            		//Check and Get Title for push notifications
            		pushData.title=_checkAndGetTitle(appId,pushData,appSettingsObject);            		
           		


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
		                    		return _getAppleCertificateBuffer(appId,fileName);
		                    	}
		                    	
		                    }                     
		                }
		            }		           

		            if(!appleCertificateFound){
		            	var emptyAppleCert = global.q.defer();
		            	emptyAppleCert.resolve(null);
		            	return emptyAppleCert.promise;
		            }

            	}).then(function(appleCertificate){            		

					if(!deviceObjects || deviceObjects.length==0){
						return deferred.resolve("No Device objects found.");
					}else{

						var appleTokens =[];
		            	var googleTokens =[];
		            	var windowsUris=[];	

		            	var chromeBrowser=[];
		            	var firefoxBrowser=[]; 
		            	var edgeBrowser=[]; 
		            	var operaBrowser=[]; 
		            	var safariBrowser=[]; 
		            	var ieBrowser=[];           	            	

		            	for(var i=0;i<deviceObjects.length;++i){

		            		//Mobiles
		            		if(deviceObjects[i].deviceOS=="ios" && appleCertificate){	            			
		            			appleTokens.push(deviceObjects[i].deviceToken);
		            		}
		            		if(deviceObjects[i].deviceOS=="android"){
		            			googleTokens.push(deviceObjects[i].deviceToken);
		            		}
		            		if(deviceObjects[i].deviceOS=="windows"){
		            			windowsUris.push(deviceObjects[i].deviceToken);
		            		}

		            		//Browsers
		            		if(deviceObjects[i].deviceOS=="chrome"){
		            			chromeBrowser.push(deviceObjects[i]);		            			
		            		}

		            		if(deviceObjects[i].deviceOS=="firefox"){
		            			firefoxBrowser.push(deviceObjects[i]);		            			
		            		}

		            		if(deviceObjects[i].deviceOS=="edge"){
		            			edgeBrowser.push(deviceObjects[i]);		            			
		            		}

		            		if(deviceObjects[i].deviceOS=="opera"){
		            			operaBrowser.push(deviceObjects[i]);		            			
		            		}

		            		if(deviceObjects[i].deviceOS=="safari"){
		            			safariBrowser.push(deviceObjects[i]);		            			
		            		}

		            		if(deviceObjects[i].deviceOS=="ie"){
		            			ieBrowser.push(deviceObjects[i]);		            			
		            		}		            				            		
		            	}	            	   		
	            		

	            		var promises=[];

	            		//Apple
		            	if(appleTokens && appleTokens.length>0 && appleCertificate){
		            		promises.push(_applePush(appleTokens,appleCertificate,pushData));
		            	}

		            	//Android
		            	if(pushNotificationSettings){
		            		var android=pushNotificationSettings.android.credentials[0];
			            	if(googleTokens && googleTokens.length>0 && android && android.apiKey){
			            		promises.push(_googlePush(googleTokens,android.senderId,android.apiKey,pushData));
			            	}
		            	}

		            	//Windows
		            	if(pushNotificationSettings){
		            		var windows=pushNotificationSettings.windows.credentials[0];
			            	if(windowsUris && windowsUris.length>0 && windows && windows.securityId){
			            		promises.push(_windowsPush(windows.securityId,windows.clientSecret,windowsUris,pushData));
			            	}
		            	}           		            	
		            	
		            	//if Browsers
		            	if(chromeBrowser.length>0 || firefoxBrowser.length>0 || edgeBrowser.length>0 || operaBrowser.length>0 || safariBrowser.length>0 || ieBrowser.length>0){
		            		//Notification Icon
		            		pushData.icon="https://api.cloudboost.io"+"/images/cloudboostsm.png";
		            		if(appSettingsObject && appSettingsObject.length>0){
				                var generalSettings=_.where(appSettingsObject, {category: "general"});
				                if(generalSettings && generalSettings.length>0 && generalSettings[0].settings.appIcon){
				                	pushData.icon=generalSettings[0].settings.appIcon;				                                    
				                }
				            }
		            	}

		            	var isChromeBrowser=false;

		            	//Chrome Browser
		            	if((chromeBrowser && chromeBrowser.length>0) && pushNotificationSettings){

		            		var android=pushNotificationSettings.android.credentials[0];
		            		isChromeBrowser=true;

		            		if(android && android.apiKey){
		            			promises.push(_browserPush(chromeBrowser,pushData,isChromeBrowser,android.apiKey));
		            		}		            		
		            	}

		            	//Firefox Browser
		            	if(firefoxBrowser && firefoxBrowser.length>0){
		            		promises.push(_browserPush(firefoxBrowser,pushData,isChromeBrowser,null));		            	            		
		            	}

		            	//Edge Browser
		            	if(edgeBrowser && edgeBrowser.length>0){
		            		promises.push(_browserPush(edgeBrowser,pushData,isChromeBrowser,null));		            	            		
		            	}

		            	//Opera Browser
		            	if(operaBrowser && operaBrowser.length>0){
		            		promises.push(_browserPush(operaBrowser,pushData,isChromeBrowser,null));		            	            		
		            	}

		            	//Safari Browser
		            	if(safariBrowser && safariBrowser.length>0){
		            		promises.push(_browserPush(safariBrowser,pushData,isChromeBrowser,null));		            	            		
		            	}

		            	//IE Browser
		            	if(ieBrowser && ieBrowser.length>0){
		            		promises.push(_browserPush(ieBrowser,pushData,isChromeBrowser,null));		            	            		
		            	}

		            	//Promise List
		            	if(promises && promises.length>0){

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
			            			deferred.resolve();
			            		}else{
			            			deferred.reject("Failed to send push notifications because invalid credentials or expired device tokens.");
			            		}
			            		
			            	});

		            	}else{		            		
		            		deferred.reject("Push notifications credentials not found. Please go to your app settings and add push credentials.");
		            	}
		            	
					}	            	
		            
            	},function(error){
					deferred.reject(error);
				});				

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }	

			return deferred.promise;
		}
	}

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
	        	return appName;
	        }else{
	        	return "CloudBoost";
	        }

		}else{
			return data.title;
		}

	} catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        return "CloudBoost";
    }

	return "CloudBoost";
}


/*Desc   : Get apple certificate buffer
  Params : appId,fileName
  Returns: Promise
           Resolve->Buffer
           Reject->Failure message
*/
function _getAppleCertificateBuffer(appId,fileName){

	var deferred = global.q.defer();

	try{
		global.mongoService.document.getFile(appId,fileName).then(function(appleCertFileObj){
			return global.mongoService.document.getFileStreamById(appId,appleCertFileObj._id);
		}).then(function(fileStream){

			  var str = []
			  fileStream.on('data', function(chunk) {
			    str.push(chunk);
			  });
			  fileStream.on('end', function() {
			    deferred.resolve(Buffer.concat(str));
			  });

		},function(error){
			deferred.reject(error);
		});

	}catch(error){
		global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(error);
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
	   
    	var respObj={};
		respObj.category="Apple Push Notifications";
			 
    	var promises=[];

    	for(var i=0;i<tokens.length;++i){
    		promises.push(_sendApplePushNotification(tokens[i],certifcate,data));
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
    			deferred.resolve(respObj);
    		}else{
    			respObj.response=resRejected;
    			deferred.reject(respObj);
    		}
    		
    	});

	} catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

	return deferred.promise;    
}

/*Desc   : Send Windows push notification
  Params : securityId,clientSecret,pushUri,data
  Returns: Promise
           Resolve->Success
           Reject->Fail to send
*/
function _sendApplePushNotification(token,certifcate,data){

    var deferred = global.q.defer();	 

    try{

		var options = {pfx:certifcate};
	    
	    var apnConnection = new apn.Connection(options);

	    var note = new apn.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.

        note.alert = data.title;

        if (data.badge != null) {
               note.badge = data.badge;
        }
        if (data.sound != null) {
            note.sound = data.sound;
        }
        if (data.contentAvailable != null) {
            // True if silent notification is requested
            note.contentAvailable = data.contentAvailable;
        }
        if (data.category != null) {
            // The message category for actionable notifications
            note.category = data.category;
        }
        if (data.actionLocKey != null) {
            // A string for the action localized key
            note.actionLocKey = data.actionLocKey;
        }
        if (data.localizedKey != null) {
            // A string for the localized key
            note.localizedKey = data.localizedKey;
        }
        if (data.localizedArguments != null) {
            // An array of strings for localized arguments 
            note.localizedArguments = data.localizedArguments;
        }
        if (data.custom != null) {
            // Provide an optional custom dictionary into request.body.data
            note.payload = data.custom;
        }

		var respObj={};
		respObj.category="Apple Push Notifications";

		apnConnection.on("connected", function() {
		    console.log("Connected");
		});
	    apnConnection.on("error", function(error) {

	        respObj.response=error;
		   	return deferred.reject(respObj);
		});

		apnConnection.pushNotification(note, token);

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

	    //Add custom data to the message.

	    var customData = data.custom;

        if (customData != null) {
            message.addData(customData);
        } 
	    
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


/*Desc   : Loop over browserArrayObj Array and send Browser push notifications
  Params : browserArrayObj, pushData, isChromeBrowser, GCMAPIKey
  Returns: Promise
           Resolve->List of successfully resolved 
           Reject->List of rejected messages
*/

function _browserPush(browserArrayObj, pushData, isChromeBrowser, GCMAPIKey){

    var defer = global.q.defer();	 

    try{

    	var respObj={};
		respObj.category="Browser Push Notifications";

		//Set GCMApi Key for chrome notifications
		if(isChromeBrowser && GCMAPIKey){
			webPush.setGCMAPIKey(GCMAPIKey); 
		}
			 
    	var promises=[];    	    	

    	for(var i=0;i<browserArrayObj.length;++i){  
    		  		    					
    		promises.push(webPush.sendNotification(browserArrayObj[i].deviceToken, {
		        TTL: 200,
		        payload: JSON.stringify(pushData),
		        userPublicKey: browserArrayObj[i].metadata.browserKey,
		        userAuth: browserArrayObj[i].metadata.authKey		        
		    })); 
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