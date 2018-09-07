/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require('q');
var mongoUtil = require('../services/mongo');
var config = require('../config/config');
var CronJob = require('cron').CronJob;
var job = new CronJob('15 * * * * *', function () {
        getMessages();
    },
    null, false, "America/Los_Angeles");

job.start();
var winston = require('winston');

function getMessages() {
    try {

        if (config.mongoDisconnected)
            return "";
        global.queue.getMessages(config.deleteQueue, function (error, message) {
            if (!error) {
                if (message.length > 0) {
                    _delete(message[0].messagetext).then(function () {
                        deleteFromQueue(message);
                        getMessages();
                    }, function (err) {
                        deleteFromQueue(message);
                        winston.log("error", {
                            "error": String(err),
                            "stack": new Error().stack
                        });
                    });
                } else {
                    return '';
                }
            }
        });

    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}

function deleteFromQueue(message) {
    try {
        global.queue.deleteMessage(config.deleteQueue, message[0].messageid, message[0].popreceipt, function () {});
    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}

function _delete(message) {
    var deferred = q.defer();
    try {
        var promise = null;
        if (message) {
            message = JSON.parse(message);
            if (message.operation === 'tableDelete')
                promise = _tableDelete(message.appId, message.tableName, message.db);
            else if (message.operation === 'appDelete')
                promise = _appDelete(message.appId, message.db);
            else
                promise = _columnDelete(message.appId, message.tableName, message.columnName, message.db);
        }
        promise.then(function () {
            deferred.resolve();
        }, function (err) {
            deferred.reject(err);
        });

    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
        deferred.reject(err);
    }
    return deferred.promise;
}

function _appDelete(appId, db) {
    var deferred = q.defer();
    try {
        var promises = [];
        if (db.length > 0) {
            if (db.indexOf('mongo') >= 0)
                promises.push(mongoUtil.app.drop(appId));
        }
        if (promises.length > 0) {
            q.all(promises).then(function () {
                deferred.resolve();
            }, function () {
                deferred.reject();
            });
        } else
            deferred.resolve();

    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
        deferred.reject(err);
    }
    return deferred.promise;
}

function _tableDelete(appId, tableName, db) {
    var deferred = q.defer();

    try {
        var promises = [];
        if (db.length > 0) {
            if (db.indexOf('mongo') >= 0)
                promises.push(mongoUtil.collection.dropCollection(appId, tableName));
        }
        if (promises.length > 0) {
            q.all(promises).then(function () {
                deferred.resolve();
            }, function () {
                deferred.reject();
            });
        } else
            deferred.resolve();

    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
        deferred.reject(err);
    }
    return deferred.promise;
}

function _columnDelete(appId, tableName, columnName, db) {
    var deferred = q.defer();
    try {
        var promises = [];
        if (db.length > 0) {
            if (db.indexOf('mongo') >= 0)
                promises.push(mongoUtil.collection.dropColumn(appId, tableName, columnName));
        }
        if (promises.length > 0) {
            q.all(promises).then(function () {
                deferred.resolve();
            }, function () {
                deferred.reject();
            });
        } else
            deferred.resolve();

    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
        deferred.reject(err);
    }
    return deferred.promise;

}