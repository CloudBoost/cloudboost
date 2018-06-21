var q = require('q');
var config = require('../config/config');
var tablesData = require('../helpers/cloudTable');
const appService = require('./app');
var winston = require('winston');


module.exports = {
    getSchema: function(appId, collectionName) {
        var deferred = q.defer();

        try {
            config.redisClient.get(config.cacheSchemaPrefix + '-' + appId + ':' + collectionName, function(err, res) {
                if (res) {
                    deferred.resolve(JSON.parse(res));
                } else {
                    var collection = config.mongoClient.db(appId).collection("_Schema");
                    var findQuery = collection.find({name: collectionName});
                    findQuery.toArray(function(err, tables) {
                        var res = tables[0];
                        if (err) {
                            winston.log('error', err);
                            deferred.reject(err);
                        } else if (!res) {

                            // No table found. Create new table
                            var defaultSchema = tablesData.Custom;
                            appService.upsertTable(appId, collectionName, defaultSchema).then(function(table) {
                                    config.redisClient.setex(config.cacheSchemaPrefix + '-' + appId + ':' + collectionName, config.schemaExpirationTimeFromCache, JSON.stringify(table._doc));
                                    deferred.resolve(table);
                                },function(err){
                                    deferred.reject(err);
                                }
                            );

                        } else {
                            config.redisClient.setex(config.cacheSchemaPrefix + '-' + appId + ':' + collectionName, config.schemaExpirationTimeFromCache, JSON.stringify(res._doc));
                            deferred.resolve(res);
                        }

                    });
                }
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
};