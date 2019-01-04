const q = require('q');
const winston = require('winston');
const config = require('../config/config');
const tablesData = require('../helpers/cloudTable');
const appService = require('./app');


module.exports = {
  getSchema(appId, collectionName) {
    const deferred = q.defer();

    try {
      config.redisClient.get(`${config.cacheSchemaPrefix}-${appId}:${collectionName}`, (err, res) => {
        if (res) {
          deferred.resolve(JSON.parse(res));
        } else {
          const collection = config.mongoClient.db(appId).collection('_Schema');
          const findQuery = collection.find({ name: collectionName });
          findQuery.toArray((err, tables) => {
            const res = tables[0];
            if (err) {
              winston.log('error', err);
              deferred.reject(err);
            } else if (!res) {
              // No table found. Create new table
              const defaultSchema = tablesData.Custom;
              appService.upsertTable(appId, collectionName, defaultSchema).then((table) => {
                config.redisClient.setex(`${config.cacheSchemaPrefix}-${appId}:${collectionName}`, config.schemaExpirationTimeFromCache, JSON.stringify(table._doc));
                deferred.resolve(table);
              }, (err) => {
                deferred.reject(err);
              });
            } else {
              config.redisClient.setex(`${config.cacheSchemaPrefix}-${appId}:${collectionName}`, config.schemaExpirationTimeFromCache, JSON.stringify(res._doc));
              deferred.resolve(res);
            }
          });
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
