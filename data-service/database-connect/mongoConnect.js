
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const winston = require('winston');
const { ReplSet, Server, MongoClient } = require('mongodb');
const config = require('../config/config');
const { getNestedValue: gnv } = require('../helpers/util');

module.exports = {

  dbConnect(appId) {
    try {
      return config.mongoClient.db(appId);
    } catch (e) {
      winston.log('error', { error: String(e), stack: new Error().stack });
      throw e;
    }
  },

  replSet() {
    try {
      const servers = [];
      const mongoConfig = gnv('loadedConfig.mongo', config);
      if (mongoConfig) {
        if (mongoConfig.length === 0) {
          return null;
        }

        if (mongoConfig.length === 1) {
          return new Server(mongoConfig[0].host, mongoConfig[0].port);
        }

        for (let i = 0; i < mongoConfig.length; i++) {
          servers.push(new Server(mongoConfig[i].host, parseInt(mongoConfig[i].port, 10)));
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

  async connect() {
    const deferred = q.defer();
    try {
      const db = await MongoClient.connect(config.mongoConnectionString, {
        poolSize: 200,
        // Parses the ConnectionString according to Connection String standards of MongoDB v3
        useNewUrlParser: true,
      });
      deferred.resolve(db);
    } catch (e) {
      winston.log('error', { error: String(e), stack: new Error().stack });
      deferred.reject(e);
    }
    return deferred.promise;
  },
};
