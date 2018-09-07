/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require('q');
var crypto = require("crypto");
var uuid = require('uuid');
var _ = require('underscore');
var util = require('../helpers/util.js');

var tablesData = require('../helpers/cloudTable');
var config = require('../config/config');
var winston = require('winston');

var mongoUtil = require('./mongo');
var mongoService = require('../databases/mongo');

module.exports = {
    /*Desc   : Update Settings
      Params : appId,categoryName,SettingsObject
      Returns: Promise
               Resolve->saved Settings Object
               Reject->Error on findOne() or failed to update
    */
    updateSettings: function (appId, category, settings) {
        var deferred = q.defer();

        try {

            mongoService.document.findOne(appId, config.globalSettings, {
                category: category
            }, null, null, 0, null, true).then(function (document) {
                if (!document) {
                    document = {};
                    document._id = util.getId();
                    document.category = category;
                }
                document.settings = settings;
                document._tableName = config.globalSettings;

                mongoService.document.save(appId, [
                    {
                        document: document
                    }
                ]).then(function (documents) {
                    deferred.resolve(documents[0].value);
                }, function (error) {
                    deferred.reject(error);
                });
            }, function (error) {
                deferred.reject(error);
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

    /*Desc   : get Settings
      Params : appId
      Returns: Promise
               Resolve->Array of Setting JSON Objects
               Reject->Error on find
    */
    getAllSettings: function (appId) {
        var deferred = q.defer();

        try {
            //check redis cache first.
            mongoService.document.find(appId, config.globalSettings, {}, null, null, 9999, 0, null, true).then(function (documents) {
                deferred.resolve(documents);
            }, function (error) {
                deferred.reject(error);
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

    getApp: function (appId) {
        var deferred = q.defer();

        try {
            //check redis cache first.

            config.redisClient.get(config.cacheAppPrefix + ':' + appId, function (err, res) {

                if (res) {
                    res = JSON.parse(res);


                    deferred.resolve(res);
                } else {

                    //if not found in cache then hit the Db.

                    var collection = config.mongoClient.db(config.globalDb).collection("projects");
                    var findQuery = collection.find({ appId: appId });
                    findQuery.toArray(function (err, docs) {
                        if (err) {
                            winston.log('error', err);
                            deferred.reject(err);
                        } else if (!docs || docs.length == 0) {
                            deferred.reject("App Not found");
                        } else if (docs.length > 0) {

                            config.redisClient.setex(config.cacheAppPrefix + ':' + appId, config.appExpirationTimeFromCache, JSON.stringify(docs[0]));
                            deferred.resolve(docs[0]);
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
    },

    getAppList: function () {

        var deferred = q.defer();

        try {

            var collection = config.mongoClient.db(config.globalDb).collection("projects");
            var findQuery = collection.find({});
            findQuery.toArray(function (err, docs) {
                if (err) {
                    winston.log('error', err);
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
    },

    createApp: function (appId) {
        var deferred = q.defer();
        try {
            var promises = [];
            var collection = config.mongoClient.db(config.globalDb).collection("projects");
            var findQuery = collection.find({ appId: appId });
            findQuery.toArray(function (err, projects) {
                if (err) {
                    winston.log('error', err);
                    deferred.reject(err);
                }
                if (projects.length > 0) {
                    deferred.reject('AppID already exists');
                } else {

                    var document = {};
                    document.appId = appId;
                    document.keys = {};
                    document.keys.js = _generateKey();
                    document.keys.master = _generateKey();

                    getKeyAndIV(function (data) { //using 64 byte key
                        document.keys.encryption_key = data;

                        var collection = config.mongoClient.db(config.globalDb).collection("projects");

                        collection.save(document, function (err, project) {
                            if (err) {

                                deferred.reject("Cannot create a new app now.");

                            } else if (project) {
                                //create a mongodb app.
                                promises.push(mongoUtil.app.create(appId));
                                q.all(promises).then(function () {
                                    deferred.resolve(document);
                                }, function (err) {
                                    deferred.reject(err);
                                });
                            }

                        });
                    });
                }
            });

        } catch (e) {
            winston.log('error', {
                "error": String(e),
                "stack": new Error().stack
            });

            deferred.reject("Cannot create an app right now.");
        }

        return deferred.promise;
    },

    deleteApp: function (appId, deleteReason) {

        var deferred = q.defer();
        if (!deleteReason)
            deleteReason = 'userInitiatedDeleteFromDashboard';
        try {
            var promises = [];

            var collection = config.mongoClient.db(config.globalDb).collection("projects");
            collection.findOneAndUpdate({
                appId: appId
            }, {
                    $set: {
                        deleted: true,
                        deleteReason: deleteReason
                    }
                }, {
                    new: true
                }, function (err) {
                    if (err) {
                        winston.log('error', err);
                        deferred.reject(err);
                    } else {
                        config.redisClient.del(config.cacheAppPrefix + ':' + appId); //delete the app from redis.

                        //delete  the app databases.
                        promises.push(mongoUtil.app.drop(appId)); //delete all mongo app data.

                        q.allSettled(promises).then(function (res) {
                            if (res[0].state === 'fulfilled') {
                                deferred.resolve();
                            } else {
                                //TODO : Something wrong happened. Roll back.
                                deferred.resolve();
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

        //delete app from cache
        return deferred.promise;
    },

    getTable: function (appId, tableName) {

        var deferred = q.defer();

        try {
            var collection = config.mongoClient.db(appId).collection("_Schema");
            var findQuery = collection.find({ name: tableName });
            findQuery.toArray(function (err, tables) {
                if (err) {
                    deferred.reject("Error : Failed to retrieve the table.");


                }
                if (tables && tables.length > 0) {
                    deferred.resolve(tables[0]);
                } else {
                    deferred.resolve(null);
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

    getAllTables: function (appId) {



        var deferred = q.defer();

        try {

            var collection = config.mongoClient.db(appId).collection("_Schema");
            var findQuery = collection.find({});
            findQuery.toArray(function (err, tables) {
                if (err) {
                    deferred.reject("Error : Failed to retrieve the table.");


                }
                if (tables.length > 0) {
                    // filtering out private '_Tables'
                    tables = tables.filter(function (table) {
                        return table.name[0] !== '_';
                    });

                    deferred.resolve(tables);
                } else {

                    deferred.resolve([]);
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

    deleteTable: function (appId, tableName) {

        var deferred = q.defer();

        try {
            var collection = config.mongoClient.db(appId).collection("_Schema");

            collection.deleteOne({
                name: tableName
            }, {
                    w: 1 //returns the number of documents removed
                }, function (err, doc) {
                    if (err || doc.result.n === 0) {
                        if (doc.result.n === 0) {
                            err = {
                                "code": 401,
                                "message": "You do not have permission to delete"
                            };
                            winston.log('error', err);
                            deferred.reject(err);
                        }
                    }
                    if (err) {
                        winston.log('error', err);
                        deferred.reject(err);
                    } else if (doc.result.n !== 0) {
                        //send a post request to DataServices.


                        //delete table from cache.
                        config.redisClient.del(config.cacheSchemaPrefix + '-' + appId + ':' + tableName);

                        //delete this from all the databases as well.
                        //call
                        var promises = [];

                        promises.push(mongoUtil.collection.dropCollection(appId, tableName)); //delete all mongo app data.
                        q.allSettled(promises).then(function (res) {
                            if (res[0].state === 'fulfilled')
                                deferred.resolve(doc);
                            else {
                                //TODO : Something went wrong. Roll back code required.
                                deferred.resolve(doc);
                            }
                        });
                    } else {
                        deferred.reject({ "code": 500, "message": "Server Error" });
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

    deleteColumn: function (appId, collectionName, columnName, columnType) {

        var deferred = q.defer();

        try {
            var promises = [];

            promises.push(mongoUtil.collection.dropColumn(appId, collectionName, columnName, columnType));
            q.allSettled(promises).then(function (res) {
                if (res[0].state === 'fulfilled')
                    deferred.resolve("Success");
                else {
                    //TODO : Soemthing went wrong. Rollback immediately.
                    deferred.resolve("Success");
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

    isMasterKey: function (appId, key) {
        var deferred = q.defer();

        try {
            var _self = this;

            _self.getApp(appId).then(function (project) {
                if (project.keys.master === key) {
                    deferred.resolve(true);
                } else {
                    if (project.keys.js === key) {
                        deferred.resolve(false);
                    } else {
                        deferred.resolve(false);
                    }
                }
            }, function () { });

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            deferred.reject(err);
        }

        return deferred.promise;
    },

    isKeyValid: function (appId, key) {
        var deferred = q.defer();

        try {
            var _self = this;

            _self.getApp(appId).then(function (project) {
                if (project.keys.master === key || project.keys.js === key) {
                    deferred.resolve(true);
                } else {
                    deferred.resolve(false);
                }
            }, function () {
                deferred.reject("Error in getting key");
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

    isClientAuthorized: function (appId, appKey, level, table) {
        var deferred = q.defer();
        var self = this;
        self.isKeyValid(appId, appKey).then(function (isValidKey) {
            if (isValidKey) {
                self.isMasterKey(appId, appKey).then(function (isMasterKey) {
                    // resolve if masterKey
                    if (isMasterKey) {
                        deferred.resolve(true);
                    } else {
                        // else check with client keys acc to auth level
                        // levels = table level or app level
                        // for app level check in app settings , for table level check in table schema
                        if (level === 'table') {
                            if (table) {
                                deferred.resolve(!!table.isEditableByClientKey);
                            } else
                                deferred.resolve(false);
                        }
                        else {
                            self.getAllSettings(appId).then(function (settings) {
                                if (settings) {
                                    // check for clientkey flag in genral settings
                                    var generalSetting = settings.filter((function (x) {
                                        return x.category === 'general';
                                    }));
                                    if (generalSetting[0]) {
                                        deferred.resolve(!!generalSetting[0].settings.isTableEditableByClientKey);
                                    } else
                                        deferred.resolve(false);
                                }
                                else
                                    deferred.resolve(false);

                            }
                                , function (error) {
                                    deferred.reject(error);
                                });
                        }
                    }
                }, function (error) {
                    deferred.reject(error);
                });
            } else {
                deferred.reject('Unauthorized');
            }
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    },

    upsertTable: function (appId, tableName, schema, tableProps) {
        var deferred = q.defer();
        tableProps = tableProps || {
            isEditableByClientKey: false
        };
        var updateColumnNameOfOldRecordsPromises = [];

        try {

            var self = this;
            var isNewTable = false;
            var tableType = null;

            if (!tableName) {
                deferred.reject("Table name is empty");
                return deferred.promise;
            }

            if (typeof (tableName) !== "string") {
                deferred.reject("Table name is not a string.");
                return deferred.promise;
            }

            //get the type of a table.
            if (tableName === "User") {
                tableType = "user";
            } else if (tableName === "Role") {
                tableType = "role";
            } else if (tableName === "Device") {
                tableType = "device";
            } else if (tableName === "_File") {
                tableType = "file";
            } else if (tableName === "_Event") {
                tableType = "event";
            } else if (tableName === "_Funnel") {
                tableType = "funnel";
            } else {
                tableType = "custom";
            }

            //How many tables of this type can be in an app
            var maxCount = null; //eslint-disable-line no-unused-vars
            if (tableType === 'user' || tableType === 'role' || tableType === 'device' || tableType === 'file' || tableType === 'event' || tableType === 'funnel') {
                maxCount = 1;
            } else {
                maxCount = 99999;
            }

            //duplicate column value verification
            var errorDetails = _checkDuplicateColumns(schema);
            if (errorDetails) {
                deferred.reject(errorDetails);
                return deferred.promise;
            }

            //dataType check.
            var defaultDataType = _getDefaultColumnWithDataType(tableType);
            var valid = _checkValidDataType(schema, defaultDataType, tableType);
            if (!valid) {
                deferred.reject("Error : Invalid DataType Found.");
                return deferred.promise;
            }

            var collection = config.mongoClient.db(appId).collection("_Schema");
            var findQuery = collection.find({ name: tableName });
            findQuery.toArray(function (err, tables) {
                var oldColumns = null;
                var table = tables[0];
                if (err) {
                    deferred.reject(err);
                } else if (table) {
                    oldColumns = table.columns;
                    //check duplicate columns, Pluck all name property of every columns.
                    var tableColumns = _.filter(_.pluck(table.columns, 'name'), function (value) {
                        return value.toLowerCase();
                    });

                    var defaultColumns = _getDefaultColumnList(tableType);

                    try {
                        for (var i = 0; i < schema.length; i++) {
                            var index = tableColumns.indexOf(schema[i].name.toLowerCase());
                            if (index >= 0) {
                                //column with the same name found in the table. Checking type...
                                if (schema[i].dataType !== table.columns[index].dataType || schema[i].relatedTo != table.columns[index].relatedTo || schema[i].relationType != table.columns[index].relationType || schema[i].isDeletable != table.columns[index].isDeletable || schema[i].isEditable != table.columns[index].isEditable || schema[i].isRenamable != table.columns[index].isRenamable || schema[i].editableByMasterKey != table.columns[index].editableByMasterKey || schema[i].isSearchable != table.columns[index].isSearchable) {
                                    deferred.reject("Cannot Change Column's Property. Only Required and Unique Field can be changed.");
                                    return deferred.promise;
                                }

                                if (schema[i].required !== table.columns[index].required && defaultColumns.indexOf(schema[i].name.toLowerCase()) >= 0) {
                                    deferred.reject("Error : Cannot change the required field of a default column.");
                                    return deferred.promise;
                                }

                                if (schema[i].unique !== table.columns[index].unique && defaultColumns.indexOf(schema[i].name.toLowerCase()) >= 0) {
                                    deferred.reject("Error : Cannot change the unique field of a default column.");
                                    return deferred.promise;
                                }
                            }
                        }
                    } catch (e) {


                        winston.log('error', {
                            "error": String(e),
                            "stack": new Error().stack
                        });
                    }

                    table.columns = schema;
                    // update table props
                    table.isEditableByClientKey = !!tableProps.isEditableByClientKey;

                } else {

                    isNewTable = true;

                    table = {};
                    table.id = util.getId();
                    table.columns = schema;

                    table.name = tableName;
                    table.type = tableType;
                    table._type = "table";
                    table.isEditableByClientKey = !!tableProps.isEditableByClientKey;
                }

                var collection = config.mongoClient.db(appId).collection("_Schema");

                //get previous schema object of current table if old table
                var renameColumnObject = {};
                if (!isNewTable)
                    collection.findOne({ name: tableName }, function (err, doc) {
                        if (err)
                            deferred.reject("Error : Failed to get the table. ");
                        else if (!doc)
                            deferred.reject("Error : Failed to get the table. ");
                        else {

                            doc.columns.forEach(function (oldColumnObj) {
                                //check column id
                                schema.forEach(function (newColumnObj) {
                                    //match column id of each columns
                                    if (newColumnObj._id === oldColumnObj._id) {
                                        if (newColumnObj.name != oldColumnObj.name) {
                                            //column name is updated update previous records.
                                            renameColumnObject[oldColumnObj.name] = newColumnObj.name;
                                        }
                                    }
                                });
                            });
                            updateColumnNameOfOldRecordsPromises.push(_updateColumnNameOfOldRecords(tableName, appId, renameColumnObject));

                        }
                    });

                collection.findOneAndUpdate({
                    name: tableName
                }, {
                        $set: table
                    }, {
                        upsert: true,
                        returnOriginal: false
                    }, function (err, response) {

                        var table = null;

                        if (response && response.value)
                            table = response.value;

                        if (err) {
                            deferred.reject("Error : Failed to save the table. ");
                        } else if (table) {
                            //clear the cache.
                            config.redisClient.del(config.cacheSchemaPrefix + '-' + appId + ':' + tableName);

                            var cloneOldColumns = [].concat(oldColumns || []);

                            if (isNewTable) {
                                var mongoPromise = mongoUtil.collection.create(appId, tableName, schema);
                                //Index all text fields
                                var mongoIndexTextPromise = mongoUtil.collection.deleteAndCreateTextIndexes(appId, tableName, cloneOldColumns, schema);

                                q.allSettled([mongoPromise, mongoIndexTextPromise]).then(function (res) {
                                    if (res[0].state === 'fulfilled' && res[1].state === 'fulfilled') {
                                        deferred.resolve(table);
                                    } else {
                                        //TODO : Rollback.
                                        deferred.resolve(table);
                                    }
                                }, function () {
                                    //TODO : Rollback.
                                    deferred.resolve(table);
                                });

                            } else {
                                //check if any column is deleted, if yes.. then delete it from everywhere.
                                if (oldColumns) {

                                    var promises = [];

                                    var columnsToDelete = _getColumnsToDelete(oldColumns, schema);

                                    for (var i = 0; i < columnsToDelete.length; i++) {
                                        promises.push(self.deleteColumn(appId, tableName, columnsToDelete[i].name, columnsToDelete[i].dataType));
                                    }

                                    var columnsToAdd = _getColumnsToAdd(oldColumns, schema);

                                    for (let i = 0; i < columnsToAdd.length; i++) {
                                        promises.push(self.createColumn(appId, tableName, columnsToAdd[i]));
                                    }

                                    //Index all text fields
                                    promises.push(mongoUtil.collection.deleteAndCreateTextIndexes(appId, tableName, cloneOldColumns, schema));
                                    //updateColumnNameOfOldRecordsPromises stores the promises for updating previous records.
                                    q.all(promises.concat(updateColumnNameOfOldRecordsPromises)).then(function () {
                                        //confirm all colums are updated
                                        q.all(updateColumnNameOfOldRecordsPromises).then(function () {
                                            deferred.resolve(table);
                                        }, function () {
                                            //TODO : Rollback.
                                            deferred.resolve(table);
                                        });
                                    }, function () {
                                        //TODO : Rollback.
                                        deferred.resolve(table);
                                    });

                                }
                            }
                        }

                    });

            });

        } catch (e) {
            winston.log('error', {
                "error": String(e),
                "stack": new Error().stack
            });


            deferred.reject(e);
        }

        return deferred.promise;
    },

    createColumn: function (appId, collectionName, column) {

        var deferred = q.defer();

        try {
            var mongoPromise = mongoUtil.collection.addColumn(appId, collectionName, column);
            q.allSettled([mongoPromise]).then(function (res) {
                if (res[0].state === 'fulfilled') {
                    deferred.resolve("Success");
                } else {
                    //TODO : Rollback.
                    deferred.reject("Unable to create column");
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

    createDefaultTables: function (appId) {
        var appService = this;
        return q.all([
            appService.upsertTable(appId, 'Role', tablesData.Role),
            appService.upsertTable(appId, 'Device', tablesData.Device),
            appService.upsertTable(appId, 'User', tablesData.User),
            appService.upsertTable(appId, '_File', tablesData._File),
            appService.upsertTable(appId, '_Event', tablesData._Event),
            appService.upsertTable(appId, '_Funnel', tablesData._Funnel)
        ]);
    },

    getSchema: function(appId, collectionName) {
        var deferred = q.defer();
        const appService = this;

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
    },

    changeAppClientKey: function (appId, value) {

        var deferred = q.defer();

        try {

            var query = {
                appId: appId
            };

            // var newClientkey = crypto.pbkdf2Sync(Math.random().toString(36).substr(2, 5), config.secureKey, 100, 16).toString("base64");
            var newClientkey = _generateKey();
            if (value) {
                newClientkey = value;
            }

            var setJSON = {
                "keys.js": newClientkey
            };

            var collection = config.mongoClient.db(config.globalDb).collection("projects");
            collection.findOneAndUpdate(query, {
                $set: setJSON
            }, {
                    returnOriginal: false
                }, function (err, newDoc) {
                    if (err) {
                        winston.log('error', err);
                        deferred.reject(err);
                    }
                    if (newDoc) {

                        //delete project/app from redis so further request will make a new entry with new keys
                        deleteAppFromRedis(appId);
                        deferred.resolve(newDoc.value);
                    } else {

                        deferred.resolve(null);
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

    changeAppMasterKey: function (appId, value) {

        var deferred = q.defer();

        try {

            var query = {
                appId: appId
            };

            //var newMasterkey = crypto.pbkdf2Sync(Math.random().toString(36).substr(2, 5), config.secureKey, 100, 16).toString("base64");
            var newMasterkey = _generateKey();
            if (value) {
                newMasterkey = value;
            }

            var setJSON = {
                "keys.master": newMasterkey
            };

            var collection = config.mongoClient.db(config.globalDb).collection("projects");
            collection.findOneAndUpdate(query, {
                $set: setJSON
            }, {
                    returnOriginal: false
                }, function (err, newDoc) {
                    if (err) {
                        winston.log('error', err);
                        deferred.reject(err);
                    }
                    if (newDoc) {

                        //delete project/app from redis so further request will make a new entry with new keys
                        deleteAppFromRedis(appId);
                        deferred.resolve(newDoc.value);
                    } else {

                        deferred.resolve(null);
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

    exportDatabase: function (appId) {
        var deferred = q.defer();
        var promises = [];
        config.mongoClient.db(appId).listCollections().toArray(function (err, collections) {
            if (err) {
                winston.log('error', err);
                deferred.reject(err);
            }
            for (var k in collections) {
                (function (k) {
                    var promise = new Promise(function (resolve, reject) {
                        collections[k].documents = [];
                        var data = config.mongoClient.db(appId).collection(collections[k].name).find();
                        data.toArray(function (err, data) {
                            if (err) {
                                winston.log('error', err);
                                reject(err);
                            }
                            collections[k].documents.push(data);
                            resolve();
                        });
                    });
                    promises.push(promise);
                })(k);
            }
            Promise.all(promises).then(function () {
                deferred.resolve(collections);
            }, function (err) {
                deferred.reject(err);
            });
        });
        return deferred.promise;
    },

    importDatabase: function (appId, file) {
        var fileData;
        var deferred = q.defer();
        var collectionRemovePromises = [];
        var validated = false;

        try {
            fileData = JSON.parse(file.toString());
            for (var k in fileData) {
                if (fileData[k].name == '_Schema') {
                    validated = true;
                }
            }
            if (!validated) {
                deferred.reject('Invalid CloudBoost Database file');
            }
        } catch (e) {
            deferred.reject('Invalid CloudBoost Database file');
        }

        config.mongoClient.db(appId).listCollections().toArray(function (err, Collections) {
            if (err) {
                winston.log('error', err);
                deferred.reject(err);
            }
            for (var k in Collections) {
                (function (k) {
                    if (Collections[k].name.split('.')[0] != 'system') { // skipping delete for system namespaces
                        collectionRemovePromises.push(new Promise(function (resolve, reject) {
                            config.mongoClient.db(appId).collection(Collections[k].name).remove({}, function (err) {
                                if (err) {
                                    reject(err);
                                }
                                resolve(true);
                            });
                        }));
                    }
                })(k);
            }
            Promise.all(collectionRemovePromises).then(function () {
                for (var i in fileData) {
                    (function (i) {
                        config.mongoClient.db(appId).createCollection(fileData[i].name, function (err) {
                            if (err)
                                deferred.reject('Error creating Collections/Tables');
                            config.mongoClient.db(appId).collection(fileData[i].name, function (err, col) {
                                if (err)
                                    deferred.reject('Error getting Collections/Tables');
                                for (var j in fileData[i].documents[0]) {
                                    (function (j) {
                                        col.insert(fileData[i].documents[0][j], function () {
                                            if (i == (fileData.length - 1) && j == (fileData[i].documents[0].length - 1)) {
                                                deferred.resolve(true);
                                            }
                                        });
                                    })(j);
                                }
                            });
                        });
                    })(i);
                }
            }, function (err) {
                deferred.reject(err);
            });
        });
        return deferred.promise;
    },

    createDatabaseUser: function (appId) {
        var deferred = q.defer();

        var username = util.getId();
        var password = util.getId();

        config.mongoClient.db(appId).addUser(username, password, {
            roles: [
                {
                    role: "readWrite",
                    db: appId
                }
            ]
        }, function (err) {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve({ username: username, password: password });
        }
        );
        return deferred.promise;
    }
};

function _updateColumnNameOfOldRecords(tableName, appId, renameColumnObject) {

    var deferred = q.defer();

    var collection = config.mongoClient.db(appId).collection(tableName);
    collection.updateMany({}, { $rename: renameColumnObject }, function (err) {
        if (err)
            deferred.reject();
        else
            deferred.resolve();
    });

    return deferred.promise;

}

function _generateKey() {
    try {
        return uuid.v4();
    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
        return null;
    }
}

//check for duplicate column
function _checkDuplicateColumns(columns) {
    try {
        var length = columns.length;
        columns = _.pluck(columns, 'name');

        //check for null names.
        for(var i=0;i<columns.length;i++){

            if(columns[i].indexOf(' ')>-1){
                return "Column "+columns[i]+" cannot contain any spaces.";
            }

            if(columns[i].length === 0){
                return "Column in the table has an empty name.";
            }
        }

        columns = _.filter(columns, Boolean);
        columns = _.filter(columns, function (value) {
            return value.toLowerCase();
        });
        columns = _.uniq(columns);

        if (length != columns.length)
            return "Column with the same name found in the table";

        return null;

    } catch (e) {
        winston.log('error', {
            "error": String(e),
            "stack": new Error().stack
        });
        return "Error";
    }
}

function _getDefaultColumnList(type) {
    try {
        var defaultColumn = ['id', 'expires', 'createdAt', 'updatedAt', 'ACL'];

        if (type == 'user') {
            defaultColumn.concat(['username', 'email', 'password', 'roles']);
        } else if (type == 'role') {
            defaultColumn.push('name');
        } else if (type == 'device') {
            defaultColumn.concat(['channels', 'deviceToken', 'deviceOS', 'timezone', 'metadata']);
        } else if (type == 'file') {
            defaultColumn.concat(['name', 'contentType', 'path', 'url', 'size']);
        } else if (type == 'event') {
            defaultColumn.concat(['user', 'type', 'name', 'data']);
        } else if (type == 'funnel') {
            defaultColumn.concat(['name', 'data']);
        }
        return defaultColumn;

    } catch (e) {
        winston.log('error', {
            "error": String(e),
            "stack": new Error().stack
        });
        return null;
    }
}

function _checkValidDataType(columns, deafultDataType, tableType) {

    try {
        var index;
        var defaultColumns = [];
        if (columns.length <= 0) {
            return false;
        }

        var coloumnDataType = _.pluck(columns, 'dataType');
        coloumnDataType = _.filter(coloumnDataType, Boolean);
        for (var key in deafultDataType) {
            index = coloumnDataType.indexOf(deafultDataType[key]);
            if (index < 0)
                return false;

            for (var l = 0; l < columns.length; l++) {
                if (columns[l].name == key) {
                    index = l;
                    l = columns.length;
                }
            }

            if (key === 'id') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != true || columns[index].dataType != 'Id')
                    return false;
            }

            //createdAt for every table
            if (key === 'createdAt') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != false || columns[index].dataType != 'DateTime')
                    return false;
            }

            //updatedAt for every table
            if (key === 'updatedAt') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != false || columns[index].dataType != 'DateTime')
                    return false;
            }

            //ACL for every table
            if (key === 'ACL') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != false || columns[index].dataType != 'ACL')
                    return false;
            }

            //username for user table
            if (key === 'username') {
                if (columns[index].relationType != null || columns[index].required != false || columns[index].unique != true || columns[index].dataType != 'Text')
                    return false;
            }

            //email for user table
            if (key === 'email') {
                if (columns[index].relationType != null || columns[index].required != false || columns[index].unique != true || columns[index].dataType != 'Email')
                    return false;
            }

            //password for user table
            if (key === 'password') {
                if (columns[index].relationType != null || columns[index].required != false || columns[index].unique != false || columns[index].dataType != 'EncryptedText')
                    return false;
            }

            //roles property for user table
            if (key === 'roles') {
                if (columns[index].relationType != 'table' || columns[index].required != false || columns[index].unique != false || columns[index].dataType != 'List' || columns[index].relatedTo !== 'Role')
                    return false;
            }

            //socialAuth property for user table
            if (key === 'socialAuth') {
                if (columns[index].required != false || columns[index].unique != false || columns[index].dataType != 'List' || columns[index].relatedTo !== 'Object')
                    return false;
            }

            //verified for user table
            if (key === 'verified') {
                if (columns[index].relationType != null || columns[index].required != false || columns[index].unique != false || columns[index].dataType != 'Boolean')
                    return false;
            }

            //name for role table
            if (key === 'name' && tableType === 'role') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != true || columns[index].dataType != 'Text')
                    return false;
            }

            //name for file table
            if (key === 'name' && tableType === 'file') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != false || columns[index].dataType != 'Text')
                    return false;
            }
            //name for event table
            if (key === 'name' && (tableType === 'event' || tableType === 'funnel')) {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != false || columns[index].dataType != 'Text')
                    return false;
            }

            //channels for device table
            if (key === 'channels') {
                if (columns[index].relationType != null || columns[index].required != false || columns[index].unique != false || columns[index].dataType != 'List')
                    return false;
            }
            //deviceToken for device table
            if (key === 'deviceToken') {
                if (columns[index].relationType != null || columns[index].required != false || columns[index].unique != true || columns[index].dataType != 'Text')
                    return false;
            }
            //deviceOS for device table
            if (key === 'deviceOS') {
                if (columns[index].relationType != null || columns[index].required != false || columns[index].unique != false || columns[index].dataType != 'Text')
                    return false;
            }
            //timezone for device table
            if (key === 'timezone') {
                if (columns[index].relationType != null || columns[index].required != false || columns[index].unique != false || columns[index].dataType != 'Text')
                    return false;
            }
            //metadata for device table
            if (key === 'metadata') {
                if (columns[index].relationType != null || columns[index].required != false || columns[index].unique != false || columns[index].dataType != 'Object')
                    return false;
            }

            if (key === 'size') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != false || columns[index].dataType != 'Number')
                    return false;
            }
            //url for file table
            if (key === 'url') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != true || columns[index].dataType != 'URL')
                    return false;
            }
            //path for file table
            if (key === 'path') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != false || columns[index].dataType != 'Text')
                    return false;
            }
            //contentType for file table
            if (key === 'contentType') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != false || columns[index].dataType != 'Text')
                    return false;
            }

            //user for event table
            if (key === 'user') {
                if (columns[index].relationType != null || columns[index].required != false || columns[index].unique != false || columns[index].dataType != 'Relation')
                    return false;
            }

            //type for event table
            if (key === 'type') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != false || columns[index].dataType != 'Text')
                    return false;
            }

            //type for event table
            if (key === 'type') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != false || columns[index].dataType != 'Text')
                    return false;
            }

            //data for event table
            if (key === 'data') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != false || columns[index].dataType != 'Object')
                    return false;
            }

            if (columns[index].isRenamable !== false || columns[index].isEditable !== false || columns[index].isDeletable !== false) {
                return false;
            }

            defaultColumns.push(key);

        } //end of for-loop

        //check for userdefined column & its properties
        var validDataTypeForUser = [
            'Text',
            'Email',
            'URL',
            'Number',
            'Boolean',
            'EncryptedText',
            'DateTime',
            'GeoPoint',
            'File',
            'List',
            'Relation',
            'Object'
        ];

        for (var i = 0; i < columns.length; i++) {
            if (defaultColumns.indexOf(columns[i].name) < 0) {

                index = validDataTypeForUser.indexOf(columns[i].dataType);

                if (index < 0)
                    return false;

                if (columns[i].dataType === 'List' || columns[i].dataType === 'Relation') {
                    if (!columns[i].relatedTo)
                        return false;
                }

                if (typeof columns[i].defaultValue === 'string') {
                    if (columns[i].dataType === 'URL') {
                        if (columns[i].defaultValue.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i)[0] !== columns[i].defaultValue) {
                            return false;
                        }
                    } else if (columns[i].dataType === 'Email') {
                        if (columns[i].defaultValue.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i)[0] !== columns[i].defaultValue) {
                            return false; // if the set dataType is not other string Datatypes (Text, EncryptedText, DateTime) available in cloudboost;
                        }
                    } else if (['Text', 'EncryptedText', 'DateTime'].indexOf(columns[i].dataType) === -1) {
                        return false;
                    }
                } else if (columns[i].defaultValue === null) {
                    // Do nothing
                } else if (['number', 'boolean', 'object'].indexOf(typeof columns[i].defaultValue) > -1) {
                    //TODO : Doing a quick fix for undefined default Value -> should be fixed later.
                    if (columns[i].dataType.toUpperCase() !== (typeof columns[i].defaultValue).toUpperCase()) {
                        return false;
                    }
                }
            }
        }

        return true;

    } catch (e) {
        winston.log('error', {
            "error": String(e),
            "stack": new Error().stack
        });
        return null;
    }
}

function _getColumnsToDelete(oldColumns, newColumns) {
    try {
        var originalColumns = oldColumns;

        for (var i = 0; i < newColumns.length; i++) {
            var column = _.first(_.where(originalColumns, { name: newColumns[i].name }));
            originalColumns.splice(originalColumns.indexOf(column), 1);
        }

        return originalColumns;
    } catch (e) {
        winston.log('error', {
            "error": String(e),
            "stack": new Error().stack
        });
        return null;
    }

}

function _getColumnsToAdd(oldColumns, newColumns) {

    try {
        var originalColumns = oldColumns;

        var addedColumns = [];

        for (var i = 0; i < newColumns.length; i++) {
            var column = _.first(_.where(originalColumns, { name: newColumns[i].name }));
            if (!column) {
                addedColumns.push(newColumns[i]);
            }
        }
        return addedColumns;
    } catch (e) {
        winston.log('error', {
            "error": String(e),
            "stack": new Error().stack
        });
        return null;
    }
}

function _getDefaultColumnWithDataType(type) {

    try {
        var defaultColumn = new Object();
        defaultColumn['id'] = 'Id';
        defaultColumn['createdAt'] = 'DateTime';
        defaultColumn['updatedAt'] = 'DateTime';
        defaultColumn['ACL'] = 'ACL';
        defaultColumn['expires'] = 'DateTime';

        if (type == 'user') {
            defaultColumn['username'] = 'Text';
            defaultColumn['email'] = 'Email';
            defaultColumn['password'] = 'EncryptedText';
            defaultColumn['roles'] = 'List';
        } else if (type == 'role') {
            defaultColumn['name'] = 'Text';

        } else if (type == 'device') {
            defaultColumn['channels'] = 'List';
            defaultColumn['deviceToken'] = 'Text';
            defaultColumn['deviceOS'] = 'Text';
            defaultColumn['timezone'] = 'Text';
            defaultColumn['metadata'] = 'Object';
        } else if (type == 'file') {
            defaultColumn['name'] = 'Text';
            defaultColumn['size'] = 'Number';
            defaultColumn['url'] = 'URL';
            defaultColumn['path'] = 'Text';
            defaultColumn['contentType'] = 'Text';
        } else if (type == 'event') {
            defaultColumn['user'] = 'Relation';
            defaultColumn['type'] = 'Text';
            defaultColumn['name'] = 'Text';
            defaultColumn['data'] = 'Object';
        } else if (type == 'funnel') {
            defaultColumn['name'] = 'Text';
            defaultColumn['data'] = 'Object';
        }
        return defaultColumn;

    } catch (e) {
        winston.log('error', {
            "error": String(e),
            "stack": new Error().stack
        });
        return null;
    }
}

function deleteAppFromRedis(appId) {
    var deferred = q.defer();

    try {
        //check redis cache first.
        config.redisClient.del(config.cacheAppPrefix + ':' + appId, function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve("Success");
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

function getKeyAndIV(callback) {

    var key = makeid(48);

    crypto.pseudoRandomBytes(16, function (err, ivBuffer) {

        var keyBuffer  = (key instanceof Buffer) ? key : new Buffer(key) ;

        callback({
            iv: ivBuffer,
            key: keyBuffer
        });
    });
}

function makeid(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
