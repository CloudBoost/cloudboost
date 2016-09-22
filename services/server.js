
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var Q = require('q');
var request = require('request');

module.exports = function() {
  return {
    registerServer: function (secureKey) {

      var _self = this;

      var deferred = Q.defer();

      try{

        _registerServerAnalytics(secureKey).then(function(result) {
            deferred.resolve(result);
        },function(error){
            deferred.reject(error);
        }); 

      } catch(err){           
          global.winston.log('error',{"error":String(err),"stack": new Error().stack});
          deferred.reject(err);
      }          

      return deferred.promise;
    },
    getDBStatuses: function () {

      var _self = this;

      var deferred = Q.defer();

      try{

        var promises=[];      

        promises.push(_mongoDbStatus());
        promises.push(_redisDbStatus());        

        Q.all(promises).then(function(resultList){
            if(resultList && resultList[0] && resultList[1]){
              deferred.resolve("All are running..");                
            }
        },function(error){  
            deferred.reject(error.error);          
        }); 

      } catch(err){           
          global.winston.log('error',{"error":String(err),"stack": new Error().stack});
          deferred.reject(err);
      }          

      return deferred.promise;
    }
  }  
};

function _registerServerAnalytics(secureKey){
  var deferred = Q.defer();
 
  try{
    var post_data = {};
    post_data.secureKey = secureKey; 
    post_data = JSON.stringify(post_data);

    var url = global.keys.analyticsUrl +'/server/register';  
    request.post(url,{
        headers: {
            'content-type': 'application/json',
            'content-length': post_data.length
        },
        body: post_data
    },function(err,response,body){
        if(err || response.statusCode === 500 || body === 'Error'){       
          deferred.reject(err);
        }else {  

          try{
            var respBody=JSON.parse(body);
            deferred.resolve(respBody);
          }catch(e){
            deferred.reject(e);
          }  
          
        }
    });

  } catch(err){           
    global.winston.log('error',{"error":String(err),"stack": new Error().stack});
    deferred.reject(err);
  }

  return deferred.promise;
}


function _mongoDbStatus(){

    console.log("MongoDB Status Function...");

    var deferred = Q.defer();

    try{

        var responseJson={};
        responseJson.serviceName="mongodb";
        responseJson.success=null;
        responseJson.error=null;

        global.mongoClient.command({ serverStatus: 1},function(err, status){
          if(err) { 
            console.log(err);
            responseJson.error="Unable to know CBEngine Mongodb status";
            deferred.reject(responseJson);                                    
          }

          console.log("MongoDB Status:"+status.ok);
          if(status && status.ok===1){ 
            responseJson.success="CBEngine Mongodb status is okay";          
            deferred.resolve(responseJson);                                               
          }else{        
            responseJson.error="CBEngine Mongodb status is failed";
            deferred.reject(responseJson);
          }
        });

    }catch(err){
      global.winston.log('error',{"error":String(err),"stack": new Error().stack});
      deferred.reject(err);
    }

    return deferred.promise;
}

function _redisDbStatus(){

    console.log("RedisDB Status Function...");

    var deferred = Q.defer();

    try{
        
        var responseJson={};
        responseJson.serviceName="redisdb";
        responseJson.success=null;
        responseJson.error=null;

        //Simple ping/pong with callback
        global.redisClient.call('PING', function (error, result) {                
            if(error){
                console.log(error);
                responseJson.error="Unable to know CBEngine Redisdb status";
                deferred.reject(responseJson);
            }
            console.log("RedisDB Status:"+result);
            if(result==="PONG"){
              responseJson.success="CBEngine Redisdb PING is successfull";
              deferred.resolve(responseJson); 
            }else{
              responseJson.error="CBEngine Redisdb PING is failed";
              deferred.reject(responseJson)
            }
        });        

    }catch(err){
      global.winston.log('error',{"error":String(err),"stack": new Error().stack});
      deferred.reject(err);
    }

    return deferred.promise;
}
