
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require('q');

var CronJob = require('cron').CronJob;
var job= new CronJob('00 00 22 * * *', function(){
    
    try{             

        _getDatabases().then(function(databaseNameList){

            if(databaseNameList && databaseNameList.length>0){
                for(var j=0;j<databaseNameList.length;++j){

                    var appId = databaseNameList[j];

                    var curr = new Date();
                    var count = 0;

                    var collectionName = "_Schema";        
                    var collection = global.mongoClient.db(appId).collection(collectionName);
                    query = {};
                    
                    collection.find(query).toArray().then(function (res) {
                        console.log(res);
                        resp = res.length;
                        console.log(resp);
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
                        console.log(error);
                    });
                }
            }            

        },function(error){
            console.log(error);
        });        

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }
},

    null, false, "America/Los_Angeles");


function removeFiles(appId,curr) {
    try{
        var collectionName = "File";
        var collectionId = global.mongoUtil.collection.getId(appId, collectionName);
        var collection = global.mongoClient.db(appId).collection(collectionId);
        query = {"expires": {"$lt": curr, "$exists": true, "$ne": null}};
        var promises = [];
        collection.find(query).toArray().then(function (res) {
            for(var i=0;i<res.length;i++) {
                promises.push(global.fileService.delete(appId, res[i], null, true));
            }
            global.q.all(promises).then(function(res){
                console.log(res);
            },function(err){
                console.log(err);
            });
        }, function () {

        });
    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }
}

function mongodb(appId,collectionName,curr){
    try{
        var collectionId = global.mongoUtil.collection.getId(appId, collectionName);
        var collection = global.mongoClient.db(appId).collection(collectionId);
        que = {"expires": {"$lt": curr,"$exists":true,"$ne":null}};
        collection.remove(que, function (err, number) {
            console.log("removed =" + number);
        });
    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }
}


function _getDatabases(){
    var deferred = q.defer();

    try{
        global.mongoClient.command({listDatabases: 1},function(err, databaseStatList){
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
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }

    return deferred.promise;
}

job.start();