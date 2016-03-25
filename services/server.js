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
        promises.push(_elasticSearchbStatus());

        Q.all(promises).then(function(resultList){
            if(resultList && resultList[0] && resultList[1] && resultList[2]){
              deferred.resolve("All are running..");                
            }else{
              deferred.reject("Something went wrong..");
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
          var respBody=JSON.parse(body);
          deferred.resolve(respBody);
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

        global.mongoClient.command({ serverStatus: 1},function(err, status){
          if(err) { 
            console.log(err);
            deferred.reject(err);                                    
          }

          console.log("MongoDB Status:"+status.ok);
          if(status && status.ok===1){         
            deferred.resolve("Ok");                                              
          }else{        
            deferred.reject("Failed");
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
        
        //Simple ping/pong with callback
        global.redisClient.call('PING', function (error, result) {                
            if(error){
                console.log(error);
                deferred.reject("Failed"); 
            }
            console.log("RedisDB Status:"+result);
            if(result==="PONG"){
                deferred.resolve("Ok"); 
            }else{
                deferred.reject("Failed");
            }
        });        

    }catch(err){
      global.winston.log('error',{"error":String(err),"stack": new Error().stack});
      deferred.reject(err);
    }

    return deferred.promise;
}


function _elasticSearchbStatus(){

    console.log("Elastic SearchDB Status Function...");

    var deferred = Q.defer();

    try{
        
        global.esClient.ping({
          // ping usually has a 3000ms timeout 
          requestTimeout: Infinity,         
          // undocumented params are appended to the query string 
          hello: "elasticsearch!"
        }, function (error) {
          if (error) {
            console.trace('elasticsearch cluster is down!');
            deferred.reject(error);
          } else {
            console.log("Elastic SearchDB Status: All is well!");
            deferred.resolve('All is well');
          }
        });   

    }catch(err){
      global.winston.log('error',{"error":String(err),"stack": new Error().stack});
      deferred.reject(err);
    }

    return deferred.promise;
}
