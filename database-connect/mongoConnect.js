
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require("q");
var config = require('../config/config');
var winston = require('winston');

module.exports = {

    dbConnect: function (appId) {
        try {
            return config.mongoClient.db(appId);
        } catch (e) {
            winston.log('error', { "error": String(e), "stack": new Error().stack });
        }

    },

    replSet: function () {

        try {

            var ReplSet = require('mongodb').ReplSet,
                Server = require('mongodb').Server;

            var servers = [];
            if(config.loadedConfig && config.loadedConfig.mongo) {
                if (config.loadedConfig.mongo.length === 0) {
                    return null;
                }
    
                if (config.loadedConfig.mongo.length === 1) {
                    return new Server(config.loadedConfig.mongo[0].host, config.loadedConfig.mongo[0].port);
                }
    
                for (var i = 0; i < config.loadedConfig.mongo.length; i++) {
                    servers.push(new Server(config.loadedConfig.mongo[i].host, parseInt(config.loadedConfig.mongo[i].port)));
                }
            } else {
                return null;
            }

            var replSet = new ReplSet(servers);

            return replSet;
        } catch (e) {
            winston.log('error', { "error": String(e), "stack": new Error().stack });
            return null;
        }
    },

    connect: function () {

        var deferred = q.defer();
        try {
            var mongoClient = require('mongodb').MongoClient;
            mongoClient.connect(config.mongoConnectionString, {
                poolSize: 200
              }, function (err, db) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(db);
                }
            });

        } catch (e) {
            winston.log('error', { "error": String(e), "stack": new Error().stack });
            deferred.reject(e);
        }
        return deferred.promise;
    }
};
