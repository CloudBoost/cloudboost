const winston = require('winston');
const q = require('q');
const mongodb = require('mongodb');
const keys = require('./keys.js');

module.exports = {

  dbConnect(appId) {
    try {
      return keys.mongoClient.db(appId);
    } catch (err) {
      return winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  },

  connect() {
    const deferred = q.defer();
    try {
      const { MongoClient } = mongodb;
      MongoClient.connect(keys.mongoConnectionString, {
        poolSize: 200,
        // Parses the ConnectionString according to Connection String standards of MongoDB v3
        useNewUrlParser: true,
      }, (err, db) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(db);
        }
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },
};
