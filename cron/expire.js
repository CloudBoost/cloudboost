var CronJob = require('cron').CronJob;
var job= new CronJob('00 00 22 * * *', function(){
    
    try{
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
                var appId = res[i].appId;
                var collectionName = res[i].name;
                if (global.database && global.esClient) {
                    if(collectionName !== "File") {
                        elasticSearch(appId, collectionName, curr);
                        mongodb(appId, collectionName, curr);
                    }else{
                        removeFiles(appId, curr);
                    }
                }
            }
        },function(err) {
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


function elasticSearch(appId,collectionName,curr) {
    try{
        var query = {};
        query.query = {};
        query.from = 0;
        query.size = 999;
        query.query.filtered = {};
        query.query.filtered.filter = {
                    "bool": {
                        "must":
                        [
                            { "range": { "expires": { "lt": curr } } },
                            {
                                "exists" : {
                                    "field" : "expires"
                                }
                            }
                        ]
                    }
        };
        global.esClient.search({
            index: appId.toLowerCase(),
            type: collectionName.toLowerCase(),
            body: query
        }, function (error, response) {
            if (error) {
                console.log('++++++ Search Index Error +++++++++');
            } else {
                console.log('++++++ Search Index Success +++++++++');
                var hits = response.hits.hits.length;
                for (var i = 0; i < hits; i++) {
                    if (response.hits.hits[i] !== undefined) {
                        global.esClient.delete({
                            index: appId.toLowerCase(),
                            type: collectionName.toLowerCase(),
                            id: response.hits.hits[i]._id,
                            ignore: [404]
                        }, function (error, r) {
                            if (error) {
                                console.log("error");
                            } else {
                                console.log("success");
                            }
                        });
                    }
                }
            }
        });

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }
}
job.start();