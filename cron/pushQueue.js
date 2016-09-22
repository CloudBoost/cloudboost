
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var CronJob = require('cron').CronJob;
var request = require('request');

var apps = [];

var job = new CronJob('* * * * * *', function () {
   
   try{
        //get all the apps.
        var collectionName = "projects";        
        var collection = global.mongoClient.db(global.keys.globalDb).collection(collectionName);
        query = {};
        
        collection.find(query).toArray().then(function (list) {
            if (list.length > 0) {
                for (var i = 0; i < list.length; i++) { 
                    _getPushQueues(list[i].appId);
                }
            }
        },function(err) {
        });

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }

});
    

//STEP #1. 
function _getPushQueues(appId) {
    //get all the push queues.
   
    try{
        if (appId) { 
            global.mongoService.document.find(appId, "_Queue", { queueType : "push" }, null, null, 9999999, 0, {}, true).then(function (result) {
                if (result.length === 0) {
                //do nothing, there are no push queues in the app.
                } else {
                    for (var i = 0; i < result.length; i++) {
                        //getAllMessages
                        if (result[i].subscribers && result[i].subscribers.length > 0) {
                            _getQueueMessages(appId, result[i]);
                        }
                    }
                }
            });
        }

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }
}

//STEP #2
function _getQueueMessages(appId, queue) {
    
    try{
        var aggregate = [];
        aggregate.push({ "$match" : {_queueName : queue.name} });
        aggregate.push({ "$match": { $or : [{ "availableBy" : { $lte: new Date() } }, { "availableBy": null }] } });
        aggregate.push({ "$project" : { delayedTo: { $add: ["$createdAt", "$delay"] }, _type : 1, expires : 1, ACL: 1, timeout: 1, availableBy: 1, delay : 1, message: 1, _tableName : 1, _queueName : 1, createdAt: 1, updatedAt: 1 } });
        aggregate.push({ "$match" : { $or : [{ "delayedTo" : { $lte: new Date() } }, { "delayedTo": null }] } });
        aggregate.push({ $sort: { "createdAt": 1 } });
        
        global.mongoService.document.aggregate(appId, "_QueueMessage", aggregate, 999999, 0, {}, true).then(function (result) {
            if (result.length === 0) {
                //do nothing.
            } else {
                //got the message. Ping subscribers. 
                for (var i = 0; i < result.length; i++) { 
                    _pingSubscriber(appId,queue, result[i]);
                } 
            }
        }, function (error) {
            deferred.reject(error);
        });

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }

}

//STEP #3
function _pingSubscriber(appId,queue, message) {

    try{
        for (var i = 0; i < queue.subscribers.length; i++) { 
            _postMessage(appId,queue.subscribers[i], message, queue.retry)
        }
    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }
}

//STEP #4 : Post
function _postMessage(appId,subscriber, message, retry) {
    try{
        var post_data = message.message;
        request.post({
            headers: {
                'content-type' : 'text/plain', 
                'content-length' : post_data.length
            },
            url: subscriber,
            body: post_data
        }, function (error, response, body) {
            if (error) {
                if (retry > 0) {
                    _postMessage(appId,subscriber, message, --retry);
                } else { 
                    _deleteMessage(appId,message);
                }
            } else { 
                _deleteMessage(appId, message);
            }
        });

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }    
}

//STEP #6 : DELETE MESSAGE AND YOU'RE DONE!
function _deleteMessage(appId, message) { 
    try{
        global.queueService.deleteMessage(appId, message._queueName, message.id, {}, true);
    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});               
    }
}

job.start();