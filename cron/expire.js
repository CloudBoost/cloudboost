
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require('q');
var mongoUtil = require('../services/mongo');
var fileService = require('../services/cloudFiles');
var config = require('../config/config');
var winston = require('winston');

var CronJob = require('cron').CronJob;
var job= new CronJob('00 00 22 * * *', function(){
    
    try{             

        _getDatabases().then(function(databaseNameList){

            if(databaseNameList && databaseNameList.length>0){
                for(var j=0;j<databaseNameList.length;++j){

                    var appId = databaseNameList[j];

                    var curr = new Date();

                    var collectionName = "_Schema";        
                    var collection = config.mongoClient.db(appId).collection(collectionName);
                    
                    collection.find({}).toArray().then(function (res) {
                        
                       let resp = res.length;
                        
                        for (var i = 0; i < resp; i++) {                            
                            var collectionName = res[i].name;
                            if(global.database && global.esClient) {
                                if(collectionName !== "File") {                                   
                                    mongodb(appId, collectionName, curr);
                                }else{
                                    removeFiles(appId, curr);
                                }
                            }
                        }
                    },function(error) {
                        winston.error({
                            error
                        });
                    });
                }
            }            

        },function(error){
            winston.error({
                error
            });
        });        

    } catch(err){           
        winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }
},

    null, false, "America/Los_Angeles");


function removeFiles(appId,curr) {
    try{
        var collectionName = "File";
        var collectionId = mongoUtil.collection.getId(appId, collectionName);
        var collection = config.mongoClient.db(appId).collection(collectionId);
        var query = {"expires": {"$lt": curr, "$exists": true, "$ne": null}};
        var promises = [];
        collection.find(query).toArray().then(function (res) {
            for(var i=0;i<res.length;i++) {
                promises.push(fileService.delete(appId, res[i], null, true));
            }
            q.all(promises).then(function(){},function(){});
        }, function () {});
    } catch(err){           
        winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }
}

function mongodb(appId,collectionName,curr){
    try{
        var collectionId = mongoUtil.collection.getId(appId, collectionName);
        var collection = config.mongoClient.db(appId).collection(collectionId);
        var que = {"expires": {"$lt": curr,"$exists":true,"$ne":null}};
        collection.remove(que);
    } catch(err){           
        winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }
}


function _getDatabases(){
    var deferred = q.defer();

    try{
        config.mongoClient.command({listDatabases: 1},function(err, databaseStatList){
            if(err) {            
                deferred.reject(err);            
            }else if(databaseStatList){  
                //Exclude Databases                 
                var excludeDBList=["_Analytics","_GLOBAL","local"];                
                var databaseNameList=[];
                for(var i=0;i<databaseStatList.databases.length;++i){
                    if(excludeDBList.indexOf(databaseStatList.databases[i].name)<0){
                        databaseNameList.push(databaseStatList.databases[i].name);
                    }
                }

                deferred.resolve(databaseNameList);                                                                                         
            }
        });

    } catch(err){           
        winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }

    return deferred.promise;
}

job.start();