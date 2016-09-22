
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var q = require("q");

module.exports = function () {
    
    var obj = {

        dbConnect: function(appId){
            try{
                return global.mongoClient.db(appId);
            }catch(e){                    
                global.winston.log('error',{"error":String(e),"stack": new Error().stack});              
            }

        },

        replSet : function(){

            try{

                var ReplSet = require('mongodb').ReplSet,
                    Server = require('mongodb').Server;                  

                var servers = [];

                if(global.config.mongo.length===0){
                    return null;
                }

                if(global.config.mongo.length===1){
                    return new Server(global.config.mongo[0].host, global.config.mongo[0].port);
                }

                for(var i=0;i<global.config.mongo.length; i++){                   
                    servers.push(new Server(global.config.mongo[i].host,parseInt(global.config.mongo[i].port)));
                }

                var replSet = new ReplSet(servers);

                return replSet;

            }catch(e){                    
                global.winston.log('error',{"error":String(e),"stack": new Error().stack});  
                return [];            
            }
        },

        connect: function() {
            
            var _self = obj;
            var deferred = q.defer();
            try{
                var mongoClient = require('mongodb').MongoClient;
                mongoClient.connect(global.keys.mongoConnectionString,function (err, db) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(db);
                    }
                });

            }catch(e){                    
                global.winston.log('error',{"error":String(e),"stack": new Error().stack}); 
                deferred.reject(e);             
            }
            return deferred.promise;
        }
    };

    return obj;
};
