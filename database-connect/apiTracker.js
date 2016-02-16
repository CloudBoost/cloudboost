var querystring = require("querystring");
var q = require('q');

module.exports = function (){
    var obj={};
    obj.log = function(appId, actionName, url,sdk, checkReleaseRequest){     
        var url = null;
        if(checkReleaseRequest){
            url: global.keys.analyticsUrl+"/app/isReleased"
        }else{
            url= global.keys.analyticsUrl+"/api/store";
        } 
        var post_data = JSON.stringify({
            host : global.keys.secureKey,
            appId : appId, 
            category : actionName.split('/')[0] || null,
            subCategory : actionName.split('/')[1] || null,
            sdk : sdk || "REST"
        });
        
        global.request.post({
            url: url, 
            headers: {
                'content-type': 'application/json',
                'content-length': post_data.length
            },
            body: post_data
        }, function (err,response,body){
            if(!err){
                try{
                    var body = JSON.parse(body);
                    if(body.limitExceeded){
                        obj.blockApp(body.appId).then(function(){
                            console.log("App blocked because it exceededthe current plan. ");
                        }, function(error){
                            console.log("App Block Error");
                            console.log(error);
                        });
                    }else{
                        obj.releaseApp(body.appId).then(function(){
                            console.log("App released.");
                        }, function(error){
                            console.log("App Release Error");
                            console.log(error);
                        });
                    }
                }catch(e){
                    obj.releaseApp(body.appId).then(function(){
                        console.log("App released.");
                    }, function(error){
                        console.log("App Release Error");
                        console.log(error);
                    });
                }
                
            }
        });
    };
    
    //Description : Checks weather the current app is in the Plan Limit. 
    // Params : appId - ID of the App. 
    //Returns : Promise - True for yes, It is in the plan limit. False if it exceeded.
    obj.isInPlanLimit = function(appId){
        var deferred = q.defer();
         
        global.redisClient.hget("_CB_API_PLAN", appId, function (err,res) {
               if (err)
                   deferred.reject(err);
               else{
                   if(res === null || res === 'undefined'){
                       deferred.resolve(true);
                   }else{
                       if(res === "true"){
                            deferred.resolve(true);
                       }else{
                            deferred.resolve(false);
                       }
                   }
               } 
         });
           
         return deferred.promise;
    };
    
    //Description : Blocks the app
    // Params : appId - ID of the App. 
    //Returns : Promise (void)
    obj.blockApp = function(appId){
         var deferred = q.defer();
         
         global.redisClient.hset("_CB_API_PLAN", appId, false, function (err) {
                if (err)
                    deferred.reject(err);
                deferred.resolve();
           });
           
         return deferred.promise;
    };
    
    //Description : Releases the App.
    // Params : appId - ID of the App. 
    //Returns : Promise (void)
    obj.releaseApp = function(appId){
        var deferred = q.defer();
         
        global.redisClient.hset("_CB_API_PLAN", appId, true, function (err) {
               if (err)
                   deferred.reject(err);
               deferred.resolve();
         });
           
         return deferred.promise;
    };
    
    return obj;
};
