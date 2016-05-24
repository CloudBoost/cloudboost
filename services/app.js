var Collections = require('../database-connect/collections.js');
var q = require('q');
var crypto = require("crypto");
var uuid = require('uuid');
var _ = require('underscore');
var util = require('../helpers/util.js');

module.exports = function() {

	return {
        /*Desc   : Update Settings
          Params : appId,categoryName,SettingsObject
          Returns: Promise
                   Resolve->saved Settings Object
                   Reject->Error on findOne() or failed to update
        */
        updateSettings : function(appId, category, settings){
            var deferred = q.defer();

            try{
                global.mongoService.document.findOne(appId, "_Settings", {category:category}, null, null, 0, null, true).then(function(document){
                    if(!document){
                        document = {};
                        document._id = util.getId();
                        document.category = category;
                    }
                    document.settings = settings;
                    document._tableName = "_Settings";

                    global.mongoService.document.save(appId, [{document: document}]).then(function(documents){
                        deferred.resolve(documents[0].value);
                    }, function(error){
                        deferred.reject(error);
                    });
                }, function(error){
                    deferred.reject(error);
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
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
        getAllSettings : function(appId){
            var deferred = q.defer();

            try{
                //check redis cache first. 
                global.mongoService.document.find(appId, "_Settings", {}, null, null, 9999, 0, null, true).then(function(documents){
                    deferred.resolve(documents);
                }, function(error){
                    deferred.reject(error);
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },
        
		getApp: function(appId) {
			var deferred = q.defer();

            try{
    			//check redis cache first. 
    			console.log('+++++ Redis Get App +++++++');
    			global.redisClient.get(global.keys.cacheAppPrefix+':'+appId, function (err, res){
    				
    				if(res) {
    					res = JSON.parse(res);
    					console.log('App found in Redis :');
    					console.log(res);
    					deferred.resolve(res);
    				}else{
    					console.log('App not found in Redis. Retrieving from Storage.');
    					//if not found in cache then hit the Db. 
    					global.model.Project.findOne({appId: appId}, function(err, project){
    						if(err)
    							deferred.reject(err);
    						else{
                                if(!project)
                                    deferred.reject("App Not found");
    							else if(project._doc){
    								console.log('Redis App SET');
    								global.redisClient.setex(global.keys.cacheAppPrefix+':'+appId, global.keys.appExpirationTimeFromCache, JSON.stringify(project._doc) );
    								deferred.resolve(project._doc);
    							}else{
    								deferred.reject('App not found.');
    							}
    						}
    					});
    				}

    			});

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            } 

			return deferred.promise;
        },

        getAppList: function() {

            var deferred = q.defer();

            try{
                global.model.Project.find({}, function(err, projects){
                    if(err)
                        deferred.reject(err);
                    else{
                       deferred.resolve(_.pluck(projects,"_doc"));
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },

        createApp: function (appId, userId, appName){

            console.log("Create App function...");

            var deferred = q.defer();
            try {                

                var promises = [];

                global.model.Project.findOne({appId: appId}, function (err, project) {
                    console.log("Find AppID already exists or not...");
                    if (project) {
                        deferred.reject('AppID already exists');
                    } else {

                            console.log("Setting params to save new app.");

                            var project = new global.model.Project();
                            project.appId = appId;
                            project.keys = {};
                            project.keys.js = _generateKey();
                            project.keys.master = _generateKey();

                            project.save().then(function (project) {
                                console.log("new app got saved...");
                                //create a mongodb app.
                                promises.push(global.mongoUtil.app.create(appId));
                                promises.push(global.elasticSearchUtil.app.create(appId));

                                global.q.all(promises).then(function (res) {                                    
                                    deferred.resolve(project._doc);
                                }, function (err) {
                                    deferred.reject(err);
                                });

                            }, function (error) {
                                console.log("Error : Cannot create project.");
                                console.log(error);
                                deferred.reject("Cannot create a new app now.");
                            });
                    }
                });
            }catch(e){
                global.winston.log('error',{"error":String(e),"stack": new Error().stack});
                console.log("FATAL : Cannot create app.");
                console.log(e);
                deferred.reject("Cannot create an app right now.");
            }

            return deferred.promise;
        },

		deleteApp: function(appId) {
			
			var deferred = q.defer();

            try{
    			var promises = [];

                global.model.Project.remove({appId:appId}, function (err) {
                    if(err){
                        console.log('++++++++ App Cannot be deleted from Storage. ++++++++++');
                        console.log(err);
                        deferred.reject(err);
                    }else{
                        global.redisClient.del(global.keys.cacheAppPrefix+':'+appId); //delete the app from redis.

                        //delete all the databases.
                        promises.push(global.mongoUtil.app.drop(appId)); //delete all mongo app data.
                        promises.push(global.elasticSearchUtil.app.drop(appId)); //delete all elastic app data.

                        q.allSettled(promises).then(function(res){
                            if(res[0].state === 'fulfilled' && res[1].state === 'fulfilled'){
                                deferred.resolve();
                            }else {
                               //TODO : Something wrong happened. Roll back.
                                deferred.resolve();
                            }
                        });
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            //delete app from cache
			return deferred.promise;
		},

        getTable: function(appId, tableName) {

            var deferred = q.defer();

            try{
                var self = this;

                global.model.Table.findOne({appId: appId, name: tableName}, function (err, table) {

                    if (err)
                    {
                        deferred.reject("Error : Failed to retrieve the table.");
                        console.log("Error : Failed to retrieve the table.")
                        console.log(err);
                    }

                    if (table) {
                        deferred.resolve(table._doc);
                    }else{
                        deferred.resolve(null);
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },

        getAllTables: function(appId) {

            console.log("Get all Tables...");

            var deferred = q.defer();

            try{
                var self = this;

                global.model.Table.find({appId: appId}, function (err, tables) {

                    if (err)
                    {
                        deferred.reject("Error : Failed to retrieve the table.");
                        console.log("Error : Failed to retrieve the table.")
                        console.log(err);
                    }

                    if (tables.length>0) {
                        console.log("Tabless found...");
                        deferred.resolve(_.pluck(tables,"_doc"));
                    }else{
                        console.log("No Tables found");
                        deferred.resolve([]);
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },

		deleteTable: function(appId, tableName) {

            var deferred = q.defer();

            try{
                var self = this;

                global.model.Table.findOne({appId: appId, name: tableName}, function (err, table) {

                    if (err)
                    {
                        deferred.reject("Error : Failed to retrieve the table.");
                        console.log("Error : Failed to retrieve the table.")
                        console.log(err);
                    }

                    if (table) {
                        table.remove(function (err,res) {
                            if (err){
                                deferred.reject("Error : Failed to delete the table.");
                                console.log("Error : Failed to delete the table.")
                                console.log(err);
                            }

                            //send a post request to DataServices.
                            console.log("Success : Table "+tableName+ " deleted.");

                            //delete table from cache.
                            global.redisClient.del(global.keys.cacheSchemaPrefix + '-' + appId + ':' + tableName);

                            //delete this from all the databases as well.
                            //call
                            var promises = [];

                            promises.push(global.mongoUtil.collection.dropCollection(appId, tableName)); //delete all mongo app data.
                            promises.push(global.elasticSearchUtil.collection.drop(appId, tableName)); //delete all elastic app data.

                            q.allSettled(promises).then(function (res){
                                if(res[0].state === 'fulfilled' && res[1].state === 'fulfilled')
                                    deferred.resolve(table);
                                else {
                                    //TODO : Something went wrong. Roll back code required.
                                    deferred.resolve(table);
                                }
                            });

                        });
                    }else{
                        deferred.reject("Error : Table not found.");
                        console.log("Error : Table not found.");
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },

		deleteColumn: function(appId, collectionName, columnName) {
			
			var deferred = q.defer();

            try{
                var promises = [];

                promises.push(global.mongoUtil.collection.dropColumn(appId, collectionName, columnName));
                promises.push(global.elasticSearchUtil.column.drop(appId, collectionName, columnName));
                
                q.allSettled(promises).then(function (res) {
                    if (res[0].state === 'fulfilled' && res[1].state === 'fulfilled')
                        deferred.resolve("Success");
                    else {
                        //TODO : Soemthing went wrong. Rollback immediately.
                        deferred.resolve("Success");
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

			return deferred.promise;
		},

		isMasterKey: function(appId, key) {
			var deferred = q.defer();

            try{
    			var _self = this;

    			_self.getApp(appId).then(function(project){
    				if(project.keys.master === key){
    					deferred.resolve(true);
    				}else{
    					deferred.resolve(false);
    				}
    			}, function(){});

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

			return deferred.promise;
		},

		isKeyValid: function(appId, key) {
			var deferred = q.defer();

            try{
    			var _self = this;

    			_self.getApp(appId).then(function(project){
    				if(project.keys.master === key || project.keys.js === key){
    					deferred.resolve(true);
    				}else{
    					deferred.resolve(false);
    				}
    			}, function(){
    				deferred.reject("Error in getting key");
    			});

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

			return deferred.promise;
		},

        upsertTable: function(appId,tableName,schema){

            var deferred = global.q.defer();

            try {

                var self = this;
                var isNewTable = false;
                var tableType = null;
                var maxCount = null; //How many tables of this type can be in an app.
                var originalTable = null;

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
                }
                else if (tableName === "Role") {
                    tableType = "role";
                }
                else if (tableName === "Device") {
                    tableType = "device";
                }
                else {
                    tableType = "custom";
                }

                if (tableType === 'user' || tableType === 'role' || tableType === 'device') {
                    maxCount = 1;
                } else {
                    maxCount = 99999;
                }

                //duplicate column value verification
                if (!_checkDuplicateColumns(schema)) {
                    deferred.reject("Error : Duplicate Column or Invalid Column Found.");
                    return deferred.promise;
                }

                //dataType check.
                var defaultDataType = _getDefaultColumnWithDataType(tableType);
                if (!_checkValidDataType(schema, defaultDataType)) {
                    deferred.reject("Error : Invalid DataType Found.");
                    return deferred.promise;
                }

                global.model.Table.findOne({appId: appId, name: tableName}, function (err, table) {
                    var oldColumns = null;

                    if (err) {
                        deferred.reject("Failed to retrieve the table.");
                        console.log("Failed to retrieve the table.");
                        console.log(err);
                    }

                    if (table) {
                        oldColumns = table.columns;
                        //check duplicate columns, Pluck all name property of every columns.
                        var tableColumns = _.filter(_.pluck(table._doc.columns, 'name'), function (value) {
                            return value.toLowerCase();
                        });


                        var defaultColumns = _getDefaultColumnList(tableType);

                        try {
                            for (var i = 0; i < schema.length; i++) {
                                var index = tableColumns.indexOf(schema[i].name.toLowerCase());
                                if (index >= 0) {
                                    //column with the same name found in the table. Checking type...
                                    if (schema[i].dataType !== table._doc.columns[index].dataType
                                        || schema[i].relatedTo != table._doc.columns[index].relatedTo
                                        || schema[i].relationType != table._doc.columns[index].relationType
                                        || schema[i].isDeletable != table._doc.columns[index].isDeletable
                                        || schema[i].isEditable != table._doc.columns[index].isEditable
                                        || schema[i].isRenamable != table._doc.columns[index].isRenamable
                                        || schema[i].editableByMasterKey != table._doc.columns[index].editableByMasterKey) {
                                        deferred.reject("Cannot Change Column's Property. Only Required and Unique Field can be changed.");
                                        return deferred.promise;
                                    }

                                    if (schema[i].required !== table._doc.columns[index].required && defaultColumns.indexOf(schema[i].name.toLowerCase()) >= 0) {
                                        deferred.reject("Error : Cannot change the required field of a default column.");
                                        return deferred.promise;
                                    }

                                    if (schema[i].unique !== table._doc.columns[index].unique && defaultColumns.indexOf(schema[i].name.toLowerCase()) >= 0) {
                                        deferred.reject("Error : Cannot change the unique field of a default column.");
                                        return deferred.promise;
                                    }

                                }
                            }
                        }catch(e){
                            console.log("Error");
                            console.log(e);
                            global.winston.log('error',{"error":String(e),"stack": new Error().stack});
                        }

                        table.columns = schema;
                    } else {

                        isNewTable = true;

                        table = new global.model.Table();
                        table.id = util.getId();
                        table.columns = schema;
                        table.appId = appId;
                        table.name = tableName;
                        table.type = tableType;
                        table._type = "table";

                    }

                    //save the table.
                    table.save(function (err, table) {

                        if (err) {
                            deferred.reject("Error : Failed to save the table. ");
                        } else {
                            //clear the cache.
                            global.redisClient.del(global.keys.cacheSchemaPrefix + '-' + appId + ':' + tableName);

                            if (isNewTable) {
                                var mongoPromise = global.mongoUtil.collection.create(appId, tableName, schema);
                                var elasticSearchPromise = global.elasticSearchUtil.collection.add(appId, tableName, schema);

                                q.allSettled([mongoPromise, elasticSearchPromise]).then(function (res) {
                                    if (res[0].state === 'fulfilled' && res[1].state === 'fulfilled') {
                                        deferred.resolve(table._doc);
                                    } else {
                                        //TODO : Rollback.
                                        deferred.resolve(table._doc);
                                    }
                                }, function (error) {
                                    //TODO : Rollback.
                                    deferred.resolve(table._doc);
                                });

                            } else {
                                //check if any column is deleted, if yes.. then delete it from everywhere.
                                if (oldColumns) {
                                    var promises = [];

                                    var columnsToDelete = _getColumnsToDelete(oldColumns, schema);

                                    for (var i = 0; i < columnsToDelete.length; i++) {
                                        promises.push(self.deleteColumn(appId, tableName, columnsToDelete[i].name));
                                    }

                                    var columnsToAdd = _getColumnsToAdd(oldColumns, schema);

                                    for (var i = 0; i < columnsToAdd.length; i++) {
                                        promises.push(self.createColumn(appId, tableName, columnsToAdd[i]));
                                    }

                                    q.all(promises).then(function (res) {
                                        deferred.resolve(table._doc);
                                    }, function (error) {
                                        //TODO : Rollback.
                                        deferred.resolve(table._doc);
                                    });

                                }
                            }
                        }

                    });
                });
            }catch(e){
                global.winston.log('error',{"error":String(e),"stack": new Error().stack});
                console.log("FATAL : Error updating a table");
                console.log(e);
                deferred.reject("Error saving a table.");
            }

            return deferred.promise;
        },

        createColumn: function (appId, collectionName, column){

            var deferred = global.q.defer();

            try{
                var mongoPromise = global.mongoUtil.collection.addColumn(appId, collectionName, column);
                var elasticSearchPromise = global.elasticSearchUtil.column.add(appId, collectionName, column);
                
                q.allSettled([mongoPromise , elasticSearchPromise]).then(function (res) {
                    if(res[0].state === 'fulfilled' && res[1].state === 'fulfilled') {
                        deferred.resolve("Success");
                    } else {
                        //TODO : Rollback.
                        deferred.reject("Unable to create column");
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
        	
        	return deferred.promise;
        },

        changeAppMasterKey: function (appId) {

            var deferred = q.defer();

            try{
                var self = this;

                var newKey = _generateKey();

                Project.findOneAndUpdate({appId:appId},{$set: {"keys.master":newKey }},{'new': true}, function (err, project) {
                    if (err) deferred.reject(err);
                    if(newProject){
                        deferred.resolve(project);
                    }else{
                        deferred.resolve("Invalid App ID.");
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;

        },

        changeAppClientKey: function (currentUserId,appId) {

            var deferred = q.defer();

            try{
                var self = this;

                var newKey = _generateKey();

                Project.findOneAndUpdate({appId:appId},{$set: {"keys.js":newKey }},{'new': true}, function (err, project) {
                    if (err) deferred.reject(err);
                    if(newProject){
                        deferred.resolve(project);
                    }else{
                        deferred.resolve("Invalid App ID.");
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;

        },
	};

};



function _isBasicDataType(dataType){
    try{
        var types = global.cloudBoostHelper.getBasicDataTypes();

        if(types.indexOf(dataType)>-1){
            return true;
        }
        return false;

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        return false;
    }
}


function _generateKey(){
    try{
        return uuid.v4();
    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        return null;
    }
}

//check for duplicate column
function _checkDuplicateColumns(columns) {
    try{
        var length = columns.length;
        columns = _.pluck(columns, 'name');
        columns = _.filter(columns, Boolean);
        columns = _.filter(columns, function (value) {
            return value.toLowerCase();
        });
        columns = _.uniq(columns);
        if (length != columns.length)
            return false;

        return true;

    }catch(e){
        global.winston.log('error',{"error":String(e),"stack": new Error().stack});
        return null;
    }
}

function _getDefaultColumnList(type) {
    try{
        var defaultColumn = ['id', 'expires' ,'createdAt', 'updatedAt', 'ACL'];
        var index;

        if (type == 'user') {
            defaultColumn.concat(['username', 'email', 'password', 'roles']);
        } else if (type == 'role') {
            defaultColumn.push('name');

        }else if (type == 'device') {
            defaultColumn.concat(['channels', 'deviceToken', 'deviceOS', 'timezone','metadata']);
        }
        return defaultColumn;

    }catch(e){
        global.winston.log('error',{"error":String(e),"stack": new Error().stack});
        return null;
    }
}

function _checkValidDataType(columns, deafultDataType) {

    try{
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

            for(var l=0;l<columns.length;l++){
                if(columns[l].name == key){
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
            if (key === 'name') {
                if (columns[index].relationType != null || columns[index].required != true || columns[index].unique != true || columns[index].dataType != 'Text')
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

            if (columns[index].isRenamable !== false || columns[index].isEditable !== false || columns[index].isDeletable !== false) {
                return false;
            }
            defaultColumns.push(key);

        }//end of for-loop

        //check for userdefined column & its properties
        var validDataTypeForUser = ['Text', 'Email', 'URL', 'Number', 'Boolean','EncryptedText', 'DateTime', 'GeoPoint', 'File', 'List', 'Relation', 'Object'];

        for (var i = 0; i < columns.length; i++) {
            if (defaultColumns.indexOf(columns[i].name) < 0) {

                var index = validDataTypeForUser.indexOf(columns[i].dataType);

                if (index < 0)
                    return false;

                if (columns[i].dataType === 'List' || columns[i].dataType === 'Relation') {
                    if (!columns[i].relatedTo)
                        return false;
                }

            }
        }

        return true;

    }catch(e){
        global.winston.log('error',{"error":String(e),"stack": new Error().stack});
        return null;
    }
}

function _getColumnsToDelete(oldColumns, newColumns){
    var deferred = q.defer()
    try{
        var originalColumns = oldColumns;

        for (var i = 0; i < newColumns.length; i++) {
            var column = _.first(_.where(originalColumns, {name: newColumns[i].name}));
            originalColumns.splice(originalColumns.indexOf(column), 1);
        }

        return originalColumns;
    }catch(e){
        global.winston.log('error',{"error":String(e),"stack": new Error().stack});
        return null;
    }
    
}

function _getColumnsToAdd(oldColumns, newColumns){

    var deferred = q.defer();

    try{
        var originalColumns = oldColumns;

        var addedColumns = [];

        for (var i = 0; i < newColumns.length; i++) {
            var column = _.first(_.where(originalColumns, {name: newColumns[i].name}));
            if (!column) {
                addedColumns.push(newColumns[i]);
            }
        }
        return addedColumns;
    }catch(e){
        global.winston.log('error',{"error":String(e),"stack": new Error().stack});
        return null;
    }
    
}

function _getDefaultColumnWithDataType(type) {

    try{
        var defaultColumn = new Object();
        defaultColumn['id'] = 'Id';
        defaultColumn['createdAt'] = 'DateTime';
        defaultColumn['updatedAt'] = 'DateTime';
        defaultColumn['ACL'] = 'ACL';
        defaultColumn['expires'] = 'DateTime';
        var index;

        if (type == 'user') {
            defaultColumn['username'] = 'Text';
            defaultColumn['email'] = 'Email';
            defaultColumn['password'] = 'EncryptedText'
            defaultColumn['roles'] = 'List';
        }else if (type == 'role') {        
            defaultColumn['name'] = 'Text';

        }else if (type == 'device') {
            defaultColumn['channels'] = 'List';
            defaultColumn['deviceToken'] = 'Text';
            defaultColumn['deviceOS'] = 'Text';
            defaultColumn['timezone'] = 'Text';
            defaultColumn['metadata'] = 'Object';
        }
        return defaultColumn;

    }catch(e){
        global.winston.log('error',{"error":String(e),"stack": new Error().stack});
        return null;
    }
}