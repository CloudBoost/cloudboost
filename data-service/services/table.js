const q = require('q');
const winston = require('winston');
const config = require('../config/config');
const tablesData = require('../helpers/cloudTable');
const appService = require('./app');


module.exports = {
  async getSchema(appId, collectionName) {
    const deferred = q.defer();

    try {
      const res = await config.redisClient.get(`${config.cacheSchemaPrefix}-${appId}:${collectionName}`);
      if (res) {
        deferred.resolve(JSON.parse(res));
      } else {
        const collection = config.mongoClient.db(appId).collection('_Schema');
        const table = await collection.findOne({ name: collectionName });
        if (!table) {
          // No table found. Create new table
          const defaultSchema = tablesData.Custom;
          const newTable = await appService.upsertTable(appId, collectionName, defaultSchema);
          config.redisClient.setex(
            `${config.cacheSchemaPrefix}-${appId}:${collectionName}`,
            config.schemaExpirationTimeFromCache,
            JSON.stringify(newTable._doc),
          );
          deferred.resolve(newTable);
        } else {
          config.redisClient.setex(
            `${config.cacheSchemaPrefix}-${appId}:${collectionName}`,
            config.schemaExpirationTimeFromCache, JSON.stringify(table._doc),
          );
          deferred.resolve(table);
        }
      }
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
