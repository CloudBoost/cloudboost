var util = require('../../helpers/util.js');
var request = require('request');
var q = require('q');

module.exports = function() {

    //Description : Used to change server URL form localhost to any DNS. 
    //Params : secureKey : Used to validate the request. 
    //         url : New Server URL. 
    //Returns : 200 - success
    //          400 - Invalid URL, 401 - Unauthoroized, 500 - Internal Server Error.     
    global.app.post('/server/url', function(req, res) {
        try {
            console.log("++++ Change Server URL ++++++");
            console.log("New URL : "+req.body.url);
            if (!util.isUrlValid(req.body.url)) {
                return res.status(400).send("Invalid URL");
            }

            if (global.keys.secureKey === req.body.secureKey) {
                console.log("Secure Key Valid. Creating app...");
                global.keyService.changeUrl(req.body.url).then(function (url) {
                    console.log("URL Updated to "+url);
                    res.status(200).send({status : "success", message : "Cluster URL Updated to "+url});
                }, function (err) {
                    console.log("Error : Cannot change the URL");
                    console.log(err);
                    res.status(500).send("Error, Cannot change the cluster URL at this time.");
                });
            } else {
                console.log("Unauthorized: Invalid Secure Key ");
                res.status(401).send("Unauthorized");
            }
        }catch(e){
            console.log(e);
            res.send(500, "Internal Server Error");
        }
    });


    global.app.get('/status', function(req,res,next) {

        console.log("MongoDB,RedisDB & Elastic Search Statuses...");

        var promises=[];      

        promises.push(_mongoDbStatus());
        promises.push(_redisDbStatus());
        promises.push(_elasticSearchbStatus());

        q.all(promises).then(function(resultList){
            if(resultList && resultList[0] && resultList[1] && resultList[2]){
                return res.status(200).json({status:200, message : "Service Status : OK"});
            }else{
                return res.status(500).send("Something went wrong!");
            }
        },function(error){
            return res.status(500).send("Something went wrong!");
        });
                  
    });
};

function _mongoDbStatus(){

    console.log("MongoDB Status Function...");

    var deferred = q.defer();

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

    var deferred = q.defer();

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

    var deferred = q.defer();

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
