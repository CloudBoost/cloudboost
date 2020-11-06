import CB from './CB'
/*CloudBoost Push Notifications*/

CB.CloudPush={};

CB.CloudPush.send = function(data,query,callback) {
    
    var tableName="Device"; 

    if (!CB.appId) {
        throw "CB.appId is null.";
    }    
    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    if(!data){
        throw "data object is null.";
    }
    if(data && (!data.message)){
        throw "message is not set.";
    }

    //Query Set
    if(query && Object.prototype.toString.call(query)=="[object Object]" && typeof query.success !== 'function'){
        var pushQuery=query;
    }
    //Channels List
    if(query && Object.prototype.toString.call(query)=="[object Array]" && typeof query.success !== 'function'){
        var pushQuery = new CB.CloudQuery(tableName);
        pushQuery.containedIn('channels', query);       
    }
    //Single Channel    
    if(query && Object.prototype.toString.call(query)=="[object String]" && typeof query.success !== 'function'){
        var pushQuery = new CB.CloudQuery(tableName);
        pushQuery.containedIn('channels', [query]);     
    }
    //when query param is callback
    if(query && Object.prototype.toString.call(query)=="[object Object]" && typeof query.success === 'function'){
        callback=query;
        var pushQuery = new CB.CloudQuery(tableName);
    } 
    //No query param
    if(!query){
        var pushQuery = new CB.CloudQuery(tableName);
    }

    var params=JSON.stringify({
        query      : pushQuery.query,        
        sort       : pushQuery.sort,
        limit      : pushQuery.limit,
        skip       : pushQuery.skip,
        key        : CB.appKey,        
        data       : data
    });  

    var url = CB.apiUrl + "/push/" + CB.appId + '/send';

    CB._request('POST',url,params).then(function(response){
        var object=response;
        if(CB._isJsonString(response)){
            object = JSON.parse(response);
        }
        
        if (callback) {
            callback.success(object);
        } else {
            def.resolve(object);
        }
    },function(err){

        if(CB._isJsonString(err)){
            err = JSON.parse(err);
        }    
        
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def.promise;
    }
};    



CB.CloudPush.enableWebNotifications = function(callback) {

    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    //Check document
    if(typeof(document) !== 'undefined'){

        CB.CloudPush._requestBrowserNotifications().then(function(response){

            if('serviceWorker' in navigator) {
                return navigator.serviceWorker.register('serviceWorker.js',{scope: './'});
            }else { 
                var noServerDef = new CB.Promise(); 
                noServerDef.reject('Service workers aren\'t supported in this browser.');  
                return noServerDef;
            }

        }).then(function(registration){

            if (!(registration.showNotification)) { 
                var noServerDef = new CB.Promise(); 
                noServerDef.reject('Notifications aren\'t supported on service workers.');  
                return noServerDef;                   
            }else{
                return CB.CloudPush._subscribe();
            }

        }).then(function(subscription){

            //PublicKey for secure connection with server
            var browserKey = subscription.getKey ? subscription.getKey('p256dh') : '';
            browserKey=browserKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(browserKey))) : '';  

            //AuthKey for secure connection with server
            var authKey = subscription.getKey ? subscription.getKey('auth') : '';
            authKey=authKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(authKey))) : '';
                     

            CB.CloudPush._addDevice(CB._getThisBrowserName(), subscription.endpoint, browserKey, authKey, {
                success : function(obj){
                    if (callback) {
                        callback.success();
                    } else {
                        def.resolve();
                    }
                },error : function(error){
                    if(callback){
                        callback.error(error);
                    }else {
                        def.reject(error);
                    }
                }
            });        

        },function(error){
            if(callback){
                callback.error(error);
            }else {
                def.reject(error);
            }
        });

    }else{
        if(callback){
            callback.error("Browser document not found");
        }else {
            def.reject("Browser document not found");
        }
    } 

    if (!callback) {
        return def.promise;
    }   
};


CB.CloudPush.disableWebNotifications = function(callback) {

    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    //Check document
    if(typeof(document) !== 'undefined'){

        CB.CloudPush._getSubscription().then(function(subscription){   

            //No subscription 
            if(!subscription){
                if (callback) {
                    callback.success();
                } else {
                    def.resolve();
                } 
            }

            if(subscription){
                var promises=[];

                //We have a subcription, so call unsubscribe on it
                promises.push(subscription.unsubscribe());
                //Remove Device Objects
                promises.push(CB.CloudPush._deleteDevice(CB._getThisBrowserName(), subscription.endpoint));        

                CB.Promise.all(promises).then(function(successful) {
                    if (callback) {
                        callback.success();
                    } else {
                        def.resolve();
                    }
                },function(error) {                     
                    if (callback) {
                        callback.error(error);
                    } else {
                        def.reject(error);
                    }                  
                });
            }

        },function(error){
            if(callback){
                callback.error(error);
            }else {
                def.reject(error);
            }
        });

    }else{
        if(callback){
            callback.error("Browser document not found");
        }else {
            def.reject("Browser document not found");
        }
    } 

    if (!callback) {
        return def.promise;
    }   
};


CB.CloudPush._subscribe = function (){

    var def = new CB.Promise();

    // Check if push messaging is supported  
    if (!('PushManager' in window)) {  
        return def.reject('Push messaging isn\'t supported.');         
    }

    navigator.serviceWorker.ready.then(function(reg) {

        reg.pushManager.getSubscription().then(function(subscription) { 

            if (!subscription) {  
                reg.pushManager.subscribe({userVisibleOnly: true}).then(function(subscription) {                
                    def.resolve(subscription);
                }).catch(function(err) {                                
                    def.reject(err);               
                });
            }else{
                def.resolve(subscription);
            }     
      
        }).catch(function(err) {  
            def.reject(err);  
        });   

    },function(error){
        def.reject(error);
    });

    return def.promise;
};


CB.CloudPush._getSubscription = function(){

    var def = new CB.Promise();
    
    navigator.serviceWorker.ready.then(function(reg) {

        reg.pushManager.getSubscription().then(function(subscription) { 

            if (!subscription) {  
                def.resolve(null);
            }else{
                def.resolve(subscription);
            }     
      
        }).catch(function(err) {  
            def.reject(err);  
        });   

    },function(error){
        def.reject(error);
    });

    return def.promise;
};
 

CB.CloudPush._requestBrowserNotifications = function() {

    var def = new CB.Promise();

    if (!("Notification" in window)) {        
        def.reject("This browser does not support system notifications");
    }else if (Notification.permission === "granted") {  

        def.resolve("Permission granted");

    }else if (Notification.permission !== 'denied') { 

        Notification.requestPermission(function (permission) {   

          if(permission === "granted") {  
            def.resolve("Permission granted");      
          }

          if(permission === "denied"){
            def.reject("Permission denied");
          }

        });
    }

    return def.promise;
};

//save the device document to the db
CB.CloudPush._addDevice = function(deviceOS, endPoint, browserKey, authKey, callback) { 
    
    var def;
    CB._validate();

    //Set Fields
    var thisObj = new CB.CloudObject('Device');
    thisObj.set('deviceOS', deviceOS);
    thisObj.set('deviceToken', endPoint);
    thisObj.set('metadata', {browserKey:browserKey,authKey:authKey});
    
    if (!callback) {
        def = new CB.Promise();
    }    
   
    var params=JSON.stringify({
        document: CB.toJSON(thisObj),
        key: CB.appKey
    });

    var url = CB.apiUrl + "/push/" + CB.appId;
    CB._request('PUT',url,params).then(function(response){
        thisObj = CB.fromJSON(JSON.parse(response),thisObj);
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
  
    if (!callback) {
        return def.promise;
    }
};


CB.CloudPush._deleteDevice = function(deviceOS, endPoint, callback) { //delete an object matching the objectId
    if (!CB.appId) {
        throw "CB.appId is null.";
    }     
   
    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    var data={
        deviceOS:deviceOS,
        deviceToken:endPoint
    };

    var params=JSON.stringify({
        key: CB.appKey,
        document: data,
        method:"DELETE"
    });
    
    var url = CB.apiUrl + "/push/" + CB.appId;

    CB._request('PUT',url,params).then(function(response){
        if (callback) {
            callback.success(response);
        } else {
            def.resolve(response);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def.promise;
    }
};




export default CB.CloudPush