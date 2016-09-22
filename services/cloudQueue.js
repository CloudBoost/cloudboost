

/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require("q");
var util = require("../helpers/util.js");
var _ = require('underscore');
var crypto = require('crypto');
var customHelper = require('../helpers/custom.js');

var databaseDriver = global.mongoService.document;

module.exports = function () {
    
    return {
        
        pushOrUpdate: function (appId, document, accessList, isMasterKey) {
            
            var collectionName = "_Queue";
            var deferred = global.q.defer();

            try{
                var promises = [];
                
                //pluck messages out of queue object.
                var messages = document.messages;
                
                if (messages.constructor !== Array) {
                    messages = [messages];
                }
                
                delete document.messages;
                
                //find the queue in the queue collection. 
                _getOrCreateQueue(appId, document, accessList, isMasterKey).then(function (queue) {
                    for (var i = 0; i < messages.length; i++) {
                        if (!messages[i]._id)
                            messages[i]._id = util.getId();
                        messages[i]._tableName = "_QueueMessage";
                        messages[i]._queueName = queue.name;
                        
                        if (!messages[i].createdAt) {
                            messages[i].createdAt = new Date();
                        }
                        
                        if (messages[i].expires && typeof new Date() !== typeof messages[i].expires) {
                            messages[i].expires = new Date(messages[i].expires);
                        }
                        
                        messages[i].updatedAt = new Date();
                        
                        messages[i] = { document : messages[i] };
                    }
                    
                    //save these messages. 
                    global.mongoService.document.save(appId, messages).then(function (result) {
                        console.log('Message Pushed');
                        
                        var value = [];
                        
                        for (var i = 0; i < result.length; i++) {
                            value.push(result[i].value);
                        }
                        
                        if (value.length === 1) {
                            deferred.resolve(value[0]);
                        } else {
                            deferred.resolve(value);
                        }
                        
                        //update total no of messages in the queue. 
                        if (!queue.totalMessages)
                            queue.totalMessages = 0;
                        queue.totalMessages += result.length;
                        queue.updatedAt = new Date();
                        
                        global.mongoService.document.save(appId, [{ document: queue }]).then(function (result) {
                            console.log('Queue updated.');
                        }, function (error) {
                            console.log('Queue Failed to update');
                        });

                    }, function (error) {
                        deferred.reject("Error pushing queue messages.");
                    });

                }, function (error) {
                    deferred.reject(erorr);
                });
            
            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            return deferred.promise;
        },
        
        createQueue : function(appId, document, accessList, isMasterKey){
            
            var deferred = global.q.defer();
            
            try{
                _getOrCreateQueue(appId, document, accessList,isMasterKey).then(
                    function(queue){
                        deferred.resolve(queue);
                    }, function(error){
                        deferred.reject(error);
                    }
                ); 

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            } 
            
            return deferred.promise;
        },
        
        updateQueue: function (appId, document, accessList, isMasterKey) {
            
            var deferred = global.q.defer();

            try{

                var thisObj = this;
                var collectionName = "_Queue";            
                var promises = [];
                
                //pluck messages out of queue object.
                var messages = document.messages;

                if (messages && messages.constructor !== Array) {
                    messages = [messages];
                }
                
                delete document.messages;
                
                //find the queue in the queue collection. 
                
                var isValid = true;

                global.mongoService.document.find(appId, "_Queue", { name : document.name }, null, null, 1, 0, accessList, true).then(function (result) {
                    if (result.length === 0) {
                        isValid = false;
                        deferred.reject("Queue does not exists.");
                    } else {
                        //got the queue. 
                        if (customHelper.checkWriteAcl(appId, result[0], accessList, isMasterKey)) { 
                            //merge this queue with new details. 
                            if (document._modifiedColumns.indexOf('queueType') > -1) {
                                if (document.queueType === "push" || document.queueType === "pull") { 
                                    result[0].queueType = document.queueType;
                                } else { 
                                    isValid = false;
                                    deferred.reject("Invalid Queue Type. It should be push or pull");
                                }
                            }

                            if (document._modifiedColumns.indexOf('retry') > -1) {
                                if (document.retry === parseInt(data, 10)) {
                                    if (document.retry > 50) {
                                        isValid = false;
                                        deferred.reject("Retry cannot be more then 50");
                                    } else {
                                        result[0].retry = document.retry;
                                    }
                                }
                                else { 
                                    isValid = false;
                                    deferred.reject("Retry is not a number.");
                                }
                            }

                            if (document._modifiedColumns.indexOf('expires') > -1) {
                                if (document.expires instanceof Date)
                                    result[0].expires = document.expires;
                                else {
                                    isValid = false;
                                    deferred.reject("Error : Expires is not a Date Time.");
                                }
                            }

                            if (document._modifiedColumns.indexOf('ACL') > -1) {
                                result[0].ACL = document.ACL;
                            }

                            //now save this object. 
                            global.mongoService.document.save(appId, [{ document: result[0] }]).then(function (res) {
                                deferred.resolve(result[0]);
                            }, function (error) {
                                console.log('Queue Failed to update');
                                deferred.reject("Queue failed to update");
                            });
                        }
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }                 
            return deferred.promise;
        },
        
        _sendPushQueueMessages : function(queue) { 

            try{
                //get all messages from the db, 
                console.log("sending push messages to the queue.");

                //ping the server in a queue like fashion. 

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});                
            } 
            
        },
        
        pull: function (appId, query, count, accessList, isMasterKey, isPeek) {
            
            var deferred = global.q.defer();
            
            try{
                //first get the queue. 
                global.mongoService.document.find(appId, "_Queue", { name : query._queueName }, null, null, 1, 0, accessList, isMasterKey).then(function (result) {
                    if (result.length === 0) {
                        deferred.reject("Queue does not exists or you're not authorized to read.");
                    } else {
                        //add query for delay. 
                        var aggregate = [];
                        aggregate.push({ "$match" : query });
                        aggregate.push({ "$match": { $or : [{ "availableBy" : { $lte: new Date() } }, { "availableBy": null }] } });
                        aggregate.push({ "$project" : { delayedTo: { $add: ["$createdAt", "$delay"] }, _type : 1, expires : 1, ACL: 1, timeout: 1, availableBy: 1, delay : 1, message: 1, _tableName : 1, _queueName : 1, createdAt: 1, updatedAt: 1 } });
                        aggregate.push({ "$match" : { $or : [{ "delayedTo" : { $lte: new Date() } }, { "delayedTo": null }] } });
                        aggregate.push({ "$match" : { $or : [{ "expires" : { $gte: new Date() } }, { "expires": null }] } });
                        aggregate.push({ $sort: { "createdAt": 1 } });
               
                        global.mongoService.document.aggregate(appId, "_QueueMessage", aggregate, count, 0, accessList, isMasterKey).then(function (result) {
                            if (result.length === 0) {
                                deferred.resolve(null);
                            } else {
                                //update message
                                if (!result[0].timeout)
                                    result[0].timeout = 1800; //30 mins. 
                                
                                if (result[0].delayedTo)
                                    delete result[0].delayedTo;
                                
                                var t = new Date();
                                t.setSeconds(result[0].timeout);
                                result[0].availableBy = t;
                                
                                var saveArray = [];
                                
                                for (var i = 0; i < result.length; i++) {
                                    var document = { document : result[i] };
                                    saveArray.push(document);
                                }
                                
                                if (!isPeek) {
                                    //re-save this object. 
                                    global.mongoService.document.save(appId, saveArray).then(function (res) {
                                        console.log("QUEUE MESSAGE UPDATE SUCCESS");
                                        if (count === 1)
                                            deferred.resolve(result[0]);
                                        else {
                                            deferred.resolve(result);
                                        }
                                    }, function (error) {
                                        console.log("QUEUE MESSAGE UPDATE FAILED");
                                        console.log(error);
                                    });
                                } else { 
                                    if (count === 1)
                                        deferred.resolve(result[0]);
                                    else {
                                        deferred.resolve(result);
                                    }
                                }
                            }
                        }, function (error) {
                            deferred.reject(error);
                        });

                    }
                }, function (error) {
                    deferred.reject(error);
                });
            
            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            } 
            
            return deferred.promise;
        },
        
        getQueue: function (appId, queueName, accessList, isMasterKey) {
            
            var deferred = global.q.defer();
            
            try{
                //first get the queue. 
                global.mongoService.document.find(appId, "_Queue", { name : queueName }, null, null, 1, 0, accessList, isMasterKey).then(function (result) {
                    if (result.length === 0) {
                        deferred.reject("Queue doesnot exist or your dont have read access to this queue.");
                    } else {
                        deferred.resolve(result[0]);
                    }
                }, function (error) {
                    deferred.reject(error);
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            
            return deferred.promise;
        },
        
        getAllQueues: function (appId, accessList, isMasterKey) {
            
            var deferred = global.q.defer();
            
            try{
                //first get the queue. 
                global.mongoService.document.find(appId, "_Queue", { }, null, null, 9999999, 0, accessList, isMasterKey).then(function (result) {
                    if (result.length === 0) {
                        deferred.resolve(null);
                    } else {
                        var promises = [];
                        
                        for(var i=0; i<result.length;i++){
                            promises.push(global.mongoService.document.count(appId, "_QueueMessage", {_queueName:result[i].name, $or : [{ "expires" : { $gte: new Date() } }, { "expires": null }] },9999999, 0, accessList, isMasterKey));
                        }
                        
                        q.all(promises).then(function(messageCounts){
                            
                            for(var i=0;i<messageCounts.length;i++){
                                result[i].size = messageCounts[i];
                            }
                            
                            deferred.resolve(result);
                            
                        }, function(error){
                            deferred.reject("Failed to retrieve queues.");
                        });
                        
                       
                    }
                }, function (error) {
                    deferred.reject(error);
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            
            return deferred.promise;
        },
        
        
        getMessage: function (appId, query, accessList, isMasterKey) {
            
            var deferred = global.q.defer();
            
            try{
                global.mongoService.document.find(appId, "_QueueMessage", query, null, null, 1, 0, accessList, isMasterKey).then(function (result) {
                    if (result.length === 0) {
                        deferred.resolve(null);
                    } else {
                        deferred.resolve(result[0]);
                    }
                }, function (error) {
                    deferred.reject(error);
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            
            return deferred.promise;
        },

        getAllMessages: function (appId, query, accessList, isMasterKey) {
            var deferred = global.q.defer();
            
            try{
                //first get the queue. 
                global.mongoService.document.find(appId, "_Queue", { name : query._queueName }, null, null, 1, 0, accessList, isMasterKey).then(function (result) {
                    if (result.length === 0) {
                        deferred.reject("Queue does not exists or you're not authorized to read.");
                    } else {
                        //add query for delay. 
                        var aggregate = [];
                        aggregate.push({ "$match" : query });
                        aggregate.push({ $sort: { "createdAt": 1 } });
               
                        global.mongoService.document.aggregate(appId, "_QueueMessage", aggregate, 999999, 0, accessList, isMasterKey).then(function (result) {
                            if (result.length === 0) {
                                deferred.resolve(null);
                            } else {
                                //update message
                                deferred.resolve(result);    
                            }
                        }, function (error) {
                            deferred.reject(error);
                        });

                    }
                }, function (error) {
                    deferred.reject(error);
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            
            return deferred.promise;    
        },
        
        deleteMessage: function (appId, queueName, id, accessList, isMasterKey) {
            
            var deferred = global.q.defer();
            
            try{
                global.mongoService.document.find(appId, "_Queue", { name : queueName }, null, null, 1, 0, accessList, true).then(function (result) {
                    if (result.length === 0) {
                        deferred.reject("Queue does not exists.");
                    } else {
                        if (customHelper.checkWriteAcl(appId, result[0], accessList, isMasterKey)) {
                            
                            global.mongoService.document.find(appId, "_QueueMessage", { _id : id }, null, null, 1, 0, accessList, true).then(function (result) {
                                if (result.length === 0) {
                                    deferred.reject("Queue message doesnot exists");
                                } else {
                                    if (customHelper.checkWriteAcl(appId, result[0], accessList, isMasterKey)) {
                                        global.mongoService.document.deleteByQuery(appId, "_QueueMessage", {_id : id}).then(function (deleteResult) {
                                            if (deleteResult.n === 0) {
                                                deferred.resolve(null);
                                            } else {
                                                deferred.resolve(result[0]);
                                            }
                                        }, function (error) {
                                            deferred.reject(error);
                                        });
                                    } else { 
                                        deferred.reject("You dont have write access on queue message.");
                                    }
                                }
                            });
                           
                        } else { 
                            deferred.reject("You dont have write access on this queue.");
                        }
                    }
                }, function (error) { 
                    deferred.reject("Failed to retrieve the queue.");
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },
        
        refreshMessageTimeout: function (appId, queueName, id, timeout, accessList, isMasterKey) {
            
            var deferred = global.q.defer();
            
            try{
                global.mongoService.document.find(appId, "_Queue", { name : queueName }, null, null, 1, 0, accessList, true).then(function (result) {
                    if (result.length === 0) {
                        deferred.reject("Queue does not exists.");
                    } else {
                        if (customHelper.checkWriteAcl(appId, result[0], accessList, isMasterKey)) {
                            
                            global.mongoService.document.find(appId, "_QueueMessage", { _id : id }, null, null, 1, 0, accessList, true).then(function (result) {
                                if (result.length === 0) {
                                    deferred.reject("Queue message doesnot exists");
                                } else {
                                    if (customHelper.checkWriteAcl(appId, result[0], accessList, isMasterKey)) {
                                        
                                        //CHECK EVERYTHING  
                                        
                                        if (result[0].availableBy && result[0].availableBy > new Date()) { 
                                            //continue
                                            deferred.reject("Queue message does not exist");
                                        } else {
                                            if (timeout && (!isNaN(parseFloat(timeout)) && isFinite(timeout)))
                                                result[0].timeout = timeout;
                                            
                                            var t = new Date();
                                            t.setSeconds(result[0].timeout);
                                            result[0].availableBy = t;
                                            
                                            //save these messages. 
                                            global.mongoService.document.save(appId, [{ document: result[0] }]).then(function (result) {
                                                console.log('Message Updated');
                                                
                                                var value = [];
                                                
                                                for (var i = 0; i < result.length; i++) {
                                                    value.push(result[i].value);
                                                }
                                                
                                                if (value.length === 1) {
                                                    deferred.resolve(value[0]);
                                                } else {
                                                    deferred.resolve(value);
                                                }
                                            }, function (error) {
                                                deferred.reject("Error pushing queue messages.");
                                            });
                                        }
                                    } else {
                                        deferred.reject("You dont have write access on queue message.");
                                    }
                                }
                            });
                        } else {
                            deferred.reject("You dont have write access on this queue.");
                        }
                    }
                }, function (error) {
                    deferred.reject("Failed to retrieve the queue.");
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            
            return deferred.promise;
        },

        clearQueue: function (appId, document, accessList, isMasterKey) {
            
            var deferred = global.q.defer();
            
            try{
                global.mongoService.document.find(appId, "_Queue", { name : document.name }, null, null, 1, 0, accessList, true).then(function (result) {
                    if (result.length === 0) {
                        deferred.resolve(document);
                    } else {
                        if (customHelper.checkWriteAcl(appId, result[0], accessList, isMasterKey)) {
                            global.mongoService.document.deleteByQuery(appId, "_QueueMessage", { _queueName : document.name }).then(function (deleteResult) {
                                if (deleteResult.n === 0) {
                                    deferred.resolve(document);
                                } else {
                                    deferred.resolve(document);
                                }
                            }, function (error) {
                                deferred.reject(error);
                            });
                        } else {
                            deferred.reject("You dont have write access on this queue.");
                        }
                    }
                }, function (error) {
                    deferred.reject("Failed to retrieve the queue.");
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            
            return deferred.promise;
        },
        
        deleteQueue: function (appId, document, accessList, isMasterKey) {
            
            var deferred = global.q.defer();
            
            try{
                this.clearQueue(appId, document,accessList, isMasterKey).then(function (result) {
                    if (!result) {
                        deferred.reject("Queue does not exists.");
                    } else {
                        global.mongoService.document.deleteByQuery(appId, "_Queue", {name: document.name }).then(function (deleteResult) {
                            if (deleteResult.n === 0) {
                                deferred.resolve(null);
                            } else {
                                deferred.resolve(document);
                            }
                        }, function (error) {
                            deferred.reject(error);
                        }); 
                    }
                }, function (error) {
                    deferred.reject("Failed to retrieve the queue.");
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            
            return deferred.promise;
        },

        addSubscriber: function (appId, document, accessList, isMasterKey) {
            
            var deferred = global.q.defer();
            
            try{
                var subscribers = document.subscribers;
                document.subscribers = [];
                
                var isValid = true;

                for (var i = 0; i < subscribers.length; i++) { 
                    if (!util.isUrlValid(subscribers[i])) {
                        deferred.reject("URL " + subscribers[i] + " is invalid");
                        isValid = false;
                    } 
                }
                
                if (isValid) {
                    _getOrCreateQueue(appId, document, accessList, true).then(function (result) {
                        if (!result) {
                            deferred.reject("Failed to retrieve the queue.");
                        } else {
                            if (customHelper.checkWriteAcl(appId, result, accessList, isMasterKey)) {
                                
                                if (!result.subscribers)
                                    result.subscribers = [];
                                
                                if (subscribers.length) {
                                    for (var i = 0; i < subscribers.length; i++) {
                                        if (result.subscribers.indexOf(subscribers[i]) < 0) {
                                            result.subscribers.push(subscribers[i]);
                                        }
                                    }
                                } else {
                                    if (result.subscribers.indexOf(subscribers) < 0) {
                                        result.subscribers.push(subscribers);
                                    }
                                }
                                
                                global.mongoService.document.save(appId, [{ document : result }]).then(function (result) {
                                    if (result.length>0) {
                                        deferred.resolve(result[0].value);
                                    } else {
                                        deferred.reject(null);
                                    }
                                }, function (error) {
                                    deferred.reject("Failed to update the queue");
                                });
                           
                            } else {
                                deferred.reject("You dont have write access on this queue.");
                            }
                        }
                    }, function (error) {
                        deferred.reject("Failed to retrieve the queue.");
                    });
                }
                
                } catch(err){           
                    global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                    deferred.reject(err);
                }
            return deferred.promise;
        },

        removeSubscriber: function (appId, document, accessList, isMasterKey) {
            
            var deferred = global.q.defer();
            
            try{
                var subscribers = document.subscribers;
                document.subscribers = [];
                
                var isValid = true;
                
                for (var i = 0; i < subscribers.length; i++) {
                    if (!util.isUrlValid(subscribers[i])) {
                        deferred.reject("URL " + subscribers[i] + " is invalid");
                        isValid = false;
                    }
                }
                
                if (isValid) {
                    _getOrCreateQueue(appId, document, accessList, true).then(function (result) {
                        if (!result) {
                            deferred.reject("Failed to retrieve the queue.");
                        } else {
                            if (customHelper.checkWriteAcl(appId, result, accessList, isMasterKey)) {
                                
                                if (!result.subscribers)
                                    result.subscribers = [];
                                
                                if (subscribers.length) {
                                    for (var i = 0; i < subscribers.length; i++) {
                                        if (result.subscribers.indexOf(subscribers[i]) > -1) {
                                            result.subscribers.splice(result.subscribers.indexOf(subscribers[i]),1);
                                        }
                                    }
                                } else {
                                    if (result.subscribers.indexOf(subscribers) > -1) {
                                        result.subscribers.splice(result.subscribers.indexOf(subscribers), 1);
                                    }
                                }
                                
                                global.mongoService.document.save(appId, [{ document : result }]).then(function (result) {
                                    if (result.length > 0) {
                                        deferred.resolve(result[0].value);
                                    } else {
                                        deferred.reject(null);
                                    }
                                }, function (error) {
                                    deferred.reject("Failed to update the queue");
                                });
                           
                            } else {
                                deferred.reject("You dont have write access on this queue.");
                            }
                        }
                    }, function (error) {
                        deferred.reject("Failed to retrieve the queue.");
                    });
                }

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            
            return deferred.promise;
        }
    };
    
    function _getOrCreateQueue(appId, document, accessList, isMasterKey) {
        
        var deferred = global.q.defer();
        
        try{
            global.mongoService.document.find(appId, "_Queue", { name : document.name }, null, null, 1, 0, accessList, true).then(function (result) {
                
                if (result.length === 0) {
                    //the queue doesnot exist in the database, so let's create one.
                    document._tableName = "_Queue";
                    
                    if (!document._id){
                        document._id = util.getId();
                        document.createdAt = new Date();
                        document.updatedAt = new Date();
                    }
                    
                    delete document.size;
                        
                    global.mongoService.document.save(appId, [{ document: document }]).then(function (result) {
                        if (result.length > 0) {
                            //find it again with the ACL's if present return 
                            global.mongoService.document.find(appId, "_Queue", { name : document.name }, null, null, 1, 0, accessList, isMasterKey).then(function (result) {
                                if (result.length > 0) {
                                    deferred.resolve(result[0]);
                                } else { 
                                    deferred.reject("Failed to retrieve the queue or you dont have read privilages.");
                                }
                            }, function (error) {
                                deferred.reject("Unable to retrieve the queue OR you dont have read privilages.");
                            });
                        } else {
                            deferred.reject("Unable to save the queue");
                        }
                    }, function (error) {
                        if (error) {
                            deferred.reject("Error in creating the queue.");
                        }
                    });
                } else {
                    //find it again with the ACL's if present return 
                    global.mongoService.document.find(appId, "_Queue", { name : document.name }, null, null, 1, 0, accessList, isMasterKey).then(function (result) {
                        if (result.length > 0) {
                            deferred.resolve(result[0]);
                        }
                    }, function (error) {
                        deferred.reject("Unable to retrieve the queue OR you dont have read privilages.");
                    });
                }
            }, function (err) {
                deferred.reject(err);
            });

        } catch(err){           
            global.winston.log('error',{"error":String(err),"stack": new Error().stack});
            deferred.reject(err);
        }
        return deferred.promise;
    }
};

//Cron Job : Cron job at /cron/pushQueue.js