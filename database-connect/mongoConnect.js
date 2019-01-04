
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const winston = require('winston');
const config = require('../config/config');

module.exports = {

  dbConnect(appId) {
    try {
      return config.mongoClient.db(appId);
    } catch (e) {
      winston.log('error', { error: String(e), stack: new Error().stack });
    }
  },

  replSet() {
    try {
      const ReplSet = require('mongodb').ReplSet;


      const Server = require('mongodb').Server;

      const servers = [];
      if (config.loadedConfig && config.loadedConfig.mongo) {
        if (config.loadedConfig.mongo.length === 0) {
          return null;
        }

        if (config.loadedConfig.mongo.length === 1) {
          return new Server(config.loadedConfig.mongo[0].host, config.loadedConfig.mongo[0].port);
        }

        for (let i = 0; i < config.loadedConfig.mongo.length; i++) {
          servers.push(new Server(config.loadedConfig.mongo[i].host, parseInt(config.loadedConfig.mongo[i].port)));
        }
      } else {
        return null;
      }

      const replSet = new ReplSet(servers);

      return replSet;
    } catch (e) {
      winston.log('error', { error: String(e), stack: new Error().stack });
      return null;
    }
  },

  connect() {
    const deferred = q.defer();
    try {
      const mongoClient = require('mongodb').MongoClient;
      mongoClient.connect(config.mongoConnectionString, {
        poolSize: 200,
      }, (err, db) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(db);
        }
      });
    } catch (e) {
      winston.log('error', { error: String(e), stack: new Error().stack });
      deferred.reject(e);
    }
    return deferred.promise;
  },
};
