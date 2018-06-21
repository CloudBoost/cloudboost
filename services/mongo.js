/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require("q");
var config = require('../config/config');
var winston = require('winston');

var mongoService = {};

mongoService.app = {

    drop: function(appId) {

        // This is app delete function,
        //it deletes the app database
        var deferred = q.defer();

        try {
            var _self = mongoService;

            if (config.mongoDisconnected) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            _self.database.dropDatabase(appId).then(function() {
                deferred.resolve();
            }, function(err) {
                deferred.resolve(err);
            });

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            deferred.reject(err);
        }

        return deferred.promise;
    },

    create: function(appId) {

        var deferred = q.defer();

        try {
            if (config.mongoDisconnected) {
                deferred.reject("Error : Storage is not connected.");
                return deferred.promise;
            }

            var Db = require('mongodb').Db;
            var replSet = require('../database-connect/mongoConnect.js').replSet();

            var db = new Db(appId, replSet, {w: 1});

            if (db) {

                deferred.resolve(db);
            } else {

                winston.log("Error : Creating an app in the Storage Backend ");
                deferred.reject("Error : Creating an app in the Storage Backend ");
            }
        } catch (e) {


            winston.log('error', {
                "error": String(e),
                "stack": new Error().stack
            });
            deferred.reject(e);
        }

        return deferred.promise;
    }
};

mongoService.document = {

    getSearchableDocuments: function(appId, collectionName) {

        var _self = mongoService;
        var deferred = q.defer();

        try {
            if (config.mongoDisconnected || !global.database) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            var collection = config.mongoClient.db(appId).collection(_self.collection.getId(appId, collectionName));
            var findQuery = collection.find();

            findQuery.toArray(function(err, docs) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(docs);
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

//Database related processings

mongoService.database = {

    dropDatabase: function(appId) {

        var deferred = q.defer();

        try {
            if (config.mongoDisconnected) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            var database = config.mongoClient.db(appId);

            database.dropDatabase(function(err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve();
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

//Collection related processings:
mongoService.collection = {

    addColumn: function(appId, collectionName, column) {
        var deferred = q.defer();

        try {
            if (config.mongoDisconnected) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            if (column.dataType === 'GeoPoint' || column.dataType === 'Text') {
                mongoService.collection.createIndex(appId, collectionName, column.name, column.dataType).then(function() {
                    deferred.resolve("Index Created");
                }, function(err) {
                    winston.log('error', err);
                    deferred.reject("Unable to create Index in Mongo");
                });
            } else {
                deferred.resolve();
            }

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            deferred.reject(err);
        }
        return deferred.promise;
    },

    create: function(appId, collectionName, schema) {
        var deferred = q.defer();

        try {
            if (config.mongoDisconnected) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            var promises = [];
            for (var i = 0; i < schema.length; i++) {
                if (schema[i].dataType === 'GeoPoint') {
                    promises.push(mongoService.collection.createIndex(appId, collectionName, schema[i].name, schema[i].dataType));
                }
            }
            if (promises.length > 0) {
                q.all(promises).then(function() {
                    deferred.resolve("Index Created");
                }, function(err) {
                    winston.log('error', err);
                    deferred.reject("Unable to create Index in Mongo");
                });
            } else {
                deferred.resolve("Created Table in Mongo");
            }

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            deferred.reject(err);
        }
        return deferred.promise;
    },

    createIndex: function(appId, collectionName, columnName, columnType) {
        var deferred = q.defer();

        try {
            if (config.mongoDisconnected) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }
            /**
                Creating a wild card index , instaed of creating individual $text index on each column seperately
            **/
            var obj = {};

            if(columnType === 'Text'){
                obj["$**"] = "text";
            }
            if (columnType === 'GeoPoint') {
                obj[columnName] = "2dsphere";
            }

            if(Object.keys(obj).length > 0){
                var collection = config.mongoClient.db(appId).collection(mongoService.collection.getId(appId, collectionName));
                collection.createIndex(obj, function(err, res) {
                    if (err) {

                        deferred.reject(err);
                    } else {

                        deferred.resolve(res);
                    }

                });
            } else {
                deferred.resolve('NO index');
            }

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            deferred.reject(err);
        }
        return deferred.promise;
    },

    deleteAndCreateTextIndexes: function(appId, collectionName) {
        var deferred = q.defer();

        try {
            if (config.mongoDisconnected) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }
            /**
                Creating a wild card index , instaed of creating individual $text index on each column seperately
            **/
            var collection = config.mongoClient.db(appId).collection(mongoService.collection.getId(appId, collectionName));
            collection.createIndex({
                "$**": "text"
            }, function(err, res) {
                if (err) {
                    winston.log('error', err);

                    deferred.reject(err);
                } else {

                    deferred.resolve(res);
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
    },

    getIndexes: function(appId, collectionName) {
        var deferred = q.defer();

        try {
            if (config.mongoDisconnected) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            var collection = config.mongoClient.db(appId).collection(mongoService.collection.getId(appId, collectionName));
            collection.indexInformation(function(err, res) {
                if (err) {

                    deferred.resolve(null);
                } else {

                    deferred.resolve(res);
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
    },
    renameColumn: function(appId, collectionName, oldColumnName, newColumnName) {

        var deferred = q.defer();

        try {
            var _self = mongoService;

            var collection = config.mongoClient.db(appId).collection(_self.collection.getId(appId, collectionName));

            var query = {};

            query[oldColumnName] = newColumnName;

            collection.update({}, {
                $rename: query
            }, {
                multi: true
            }, function(err, result) {
                if (err) {
                    winston.log('error', err);


                    deferred.reject(err);
                } else {

                    deferred.resolve(result);
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
    },

    dropColumn: function(appId, collectionName, columnName, columnType) {

        var deferred = q.defer();

        try {

            if (config.mongoDisconnected) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            var query = {};

            query[columnName] = 1;

            var indexName = null;
            if (columnType === 'GeoPoint') {
                indexName = columnName + "_2dsphere";
            }

            var promises = [];
            promises.push(_dropIndex(appId, collectionName, indexName));
            promises.push(_unsetColumn(appId, collectionName, query));

            //Promise List
            if (promises && promises.length > 0) {

                q.allSettled(promises).then(function(resultList) {

                    var resFulfilled = [];
                    var resRejected = [];
                    resultList.forEach(function(eachResult) {
                        if (eachResult.state === "fulfilled") {
                            resFulfilled.push(eachResult.value);
                        } else {
                            resRejected.push(eachResult.reason);
                        }
                    });

                    //Check atleast one is fulfilled
                    if (resFulfilled && resFulfilled.length > 0) {
                        deferred.resolve();
                    } else {
                        deferred.reject("Unable to drop column and index");
                    }

                });

            } else {
                deferred.reslove();
            }

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            deferred.reject(err);
        }

        return deferred.promise;
    },

    dropCollection: function(appId, collectionName) {

        var deferred = q.defer();

        try {



            if (config.mongoDisconnected) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }
            var _self = mongoService;

            var collection = config.mongoClient.db(appId).collection(_self.collection.getId(appId, collectionName));

            collection.drop(function(err, reply) {
                if (err) {
                    if (err.message === 'ns not found') {

                        deferred.resolve();
                    } else {
                        winston.log('error', err);

                        deferred.reject(err);
                    }
                } else {

                    deferred.resolve(reply);
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

    },

    renameCollection: function(appId, oldCollectionName, newCollectionName) {

        var deferred = q.defer();

        try {

            var _self = mongoService;

            var collection = config.mongoClient.db(appId).collection(_self.collection.getId(appId, oldCollectionName));

            collection.rename(_self.collection.getId(appId, newCollectionName), function(err, _collection) {
                if (err) {
                    if (err.message === 'source namespace does not exist') {
                         //if oldCollectionName is not found.
                        deferred.resolve();
                    } else {

                        winston.log('error', err);
                        deferred.reject(err);
                    }

                } else {

                    deferred.resolve(_collection);
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
    },

    getId: function(appId, collectionName) { //for a given appId and collectionName it gives a unique collection name
        try {
            return collectionName;
        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }
    },

    list: function(appId) {

        var deferred = q.defer();

        try {
            var collection = config.mongoClient.db(appId).collection("_Schema");
            var findQuery = collection.find({});
            findQuery.toArray(function(err, res) {
                if (err) {
                    winston.log('error', err);
                    deferred.reject(err);
                } else {
                    deferred.resolve(res);
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

module.exports = mongoService;

//Private Functions
function _dropIndex(appId, collectionName, indexString) {

    var deferred = q.defer();

    try {

        if (indexString && indexString != "") {
            var collection = config.mongoClient.db(appId).collection(collectionName);
            collection.dropIndex(indexString, function(err, result) {
                if (err && err.message && err.message != 'ns not found') {
                    winston.log('error', err);


                    deferred.reject(err);
                } else {
                    deferred.resolve(result);
                }
            });
        } else {
            deferred.resolve("Nothing to drop");
        }

    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
        deferred.reject(err);
    }
    return deferred.promise;
}

function _unsetColumn(appId, collectionName, query) {

    var deferred = q.defer();

    try {

        if (query && Object.keys(query).length > 0) {
            var collection = config.mongoClient.db(appId).collection(collectionName);
            collection.update({}, {
                $unset: query
            }, {
                multi: true
            }, function(err, result) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(result);
                }
            });
        } else {
            deferred.resolve("Nothing to unset");
        }

    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
        deferred.reject(err);
    }
    return deferred.promise;
}
