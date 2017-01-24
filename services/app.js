
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var Collections = require('../database-connect/collections.js');
var q = require('q');
var crypto = require("crypto");
var uuid = require('uuid');
var _ = require('underscore');
var util = require('../helpers/util.js');
var tablesData = require('./tablesData.js')

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

            try {
                
                global.mongoService.document.findOne(appId, "_Settings", {category:category}, null, null, 0, null, true).then(function(document){
                    if(!document) {
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
    				} else {
    					console.log('App not found in Redis. Retrieving from Storage.');
    					//if not found in cache then hit the Db.

                        var collection =  global.mongoClient.db(global.keys.globalDb).collection("projects");
                        var findQuery = collection.find({appId: appId});
                        findQuery.toArray(function(err, docs) {
                            if (err) {
                                global.winston.log('error',err);
                                deferred.reject(err);
                            }else if(!docs || docs.length==0){
                                deferred.reject("App Not found");
                            }else if(docs.length>0){
                                console.log('Redis App SET');
                                global.redisClient.setex(global.keys.cacheAppPrefix+':'+appId, global.keys.appExpirationTimeFromCache, JSON.stringify(docs[0]) );
                                deferred.resolve(docs[0]);
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

                var collection =  global.mongoClient.db(global.keys.globalDb).collection("projects");
                var findQuery = collection.find({});
                findQuery.toArray(function(err, docs) {
                    if (err) {
                        global.winston.log('error',err);
                        deferred.reject(err);
                    }else {
                        deferred.resolve(docs);
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

                console.log("Find AppID already exists or not...");
                var collection =  global.mongoClient.db(global.keys.globalDb).collection("projects");
                var findQuery = collection.find({appId:appId});
                findQuery.toArray(function(err, projects) {
                    if (err) {
                        global.winston.log('error',err);
                        deferred.reject(err);
                    }
                    if(projects.length>0) {
                        deferred.reject('AppID already exists');
                    }else {

                        console.log("Setting params to save new app.");

                        var document = {};
                        document.appId = appId;
                        document.keys = {};
                        document.keys.js = _generateKey();
                        document.keys.master = _generateKey();

                        var collection =  global.mongoClient.db(global.keys.globalDb).collection("projects");
                
                        console.log('Collection Object Created.');

                        collection.save(document,function(err,project){
                            if(err) {
                                console.log("Error : Cannot create project.");
                                console.log(error);
                                deferred.reject("Cannot create a new app now.");

                            }else if(project) {
                                console.log("new app got saved...");
                                //create a mongodb app.
                                promises.push(global.mongoUtil.app.create(appId));
                                global.q.all(promises).then(function (res) {                                    
                                    deferred.resolve(document);
                                }, function (err) {
                                    deferred.reject(err);
                                });
                            }

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

                var collection =  global.mongoClient.db(global.keys.globalDb).collection("projects");                

                collection.remove({appId:appId}, {
                    w: 1 //returns the number of documents removed
                }, function(err, doc) {
                    if (err || doc.result.n === 0) {
                        if (doc.result.n === 0) {
                            err = {
                                "code": 401,
                                "message": "You do not have permission to delete"
                            };
                            global.winston.log('error',err);
                            deferred.reject(err);
                        }
                    }
                    if (err) {
                        global.winston.log('error',err);
                        deferred.reject(err);
                    } else if (doc.result.n !== 0) {
                            global.redisClient.del(global.keys.cacheAppPrefix+':'+appId); //delete the app from redis.

                            //delete all the databases.
                            promises.push(global.mongoUtil.app.drop(appId)); //delete all mongo app data.                            

                            q.allSettled(promises).then(function(res){
                                if(res[0].state === 'fulfilled'){
                                    deferred.resolve();
                                }else {
                                   //TODO : Something wrong happened. Roll back.
                                    deferred.resolve();
                                }
                            });
                    } else {
                        deferred.reject({
                            "code": 500,
                            "message": "Server Error"
                        })
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

                var collection =  global.mongoClient.db(appId).collection("_Schema");
                var findQuery = collection.find({name: tableName});
                findQuery.toArray(function(err, tables) {
                    if(err){
                        deferred.reject("Error : Failed to retrieve the table.");
                        console.log("Error : Failed to retrieve the table.")
                        console.log(err);
                    }
                    if (tables && tables.length>0) {
                        deferred.resolve(tables[0]);
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

                var collection =  global.mongoClient.db(appId).collection("_Schema");
                var findQuery = collection.find({});
                findQuery.toArray(function(err, tables) {
                    if(err){
                        deferred.reject("Error : Failed to retrieve the table.");
                        console.log("Error : Failed to retrieve the table.")
                        console.log(err);
                    }
                    if (tables.length>0) {
                        console.log("Tables found...");
                        deferred.resolve(tables);
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

                var collection =  global.mongoClient.db(appId).collection("_Schema");                

                collection.deleteOne({name: tableName}, {
                    w: 1 //returns the number of documents removed
                }, function(err, doc) {
                    if (err || doc.result.n === 0) {
                        if (doc.result.n === 0) {
                            err = {
                                "code": 401,
                                "message": "You do not have permission to delete"
                            };
                            global.winston.log('error',err);
                            deferred.reject(err);
                        }
                    }
                    if (err) {
                        global.winston.log('error',err);
                        deferred.reject(err);
                    } else if (doc.result.n !== 0) {
                            //send a post request to DataServices.
                            console.log("Success : Table "+tableName+ " deleted.");

                            //delete table from cache.
                            global.redisClient.del(global.keys.cacheSchemaPrefix + '-' + appId + ':' + tableName);

                            //delete this from all the databases as well.
                            //call
                            var promises = [];

                            promises.push(global.mongoUtil.collection.dropCollection(appId, tableName)); //delete all mongo app data.
                            q.allSettled(promises).then(function (res){
                                if(res[0].state === 'fulfilled')
                                    deferred.resolve(doc);
                                else {
                                    //TODO : Something went wrong. Roll back code required.
                                    deferred.resolve(doc);
                                }
                            });
                    } else {
                        deferred.reject({
                            "code": 500,
                            "message": "Server Error"
                        })
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },

		deleteColumn: function(appId, collectionName, columnName, columnType) {
			
			var deferred = q.defer();

            try{
                var promises = [];

                promises.push(global.mongoUtil.collection.dropColumn(appId, collectionName, columnName,columnType));                
                q.allSettled(promises).then(function (res) {
                    if (res[0].state === 'fulfilled')
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
    			}, 
                function(){
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
                var valid = _checkValidDataType(schema, defaultDataType);
                if (!valid) {
                    deferred.reject("Error : Invalid DataType Found.");
                    return deferred.promise;
                }

                var collection = global.mongoClient.db(appId).collection("_Schema");
                var findQuery = collection.find({name: tableName});
                findQuery.toArray(function(err, tables) {
                    var oldColumns = null;
                    var table= tables[0];
                    if(err){
                        deferred.reject(err);                      
                    }else if (table) {
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
                                    if (schema[i].dataType !== table.columns[index].dataType
                                        || schema[i].relatedTo != table.columns[index].relatedTo
                                        || schema[i].relationType != table.columns[index].relationType
                                        || schema[i].isDeletable != table.columns[index].isDeletable
                                        || schema[i].isEditable != table.columns[index].isEditable
                                        || schema[i].isRenamable != table.columns[index].isRenamable
                                        || schema[i].editableByMasterKey != table.columns[index].editableByMasterKey
                                        || schema[i].isSearchable != table.columns[index].isSearchable) {
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
                        }catch(e){
                            console.log("Error");
                            console.log(e);
                            global.winston.log('error',{"error":String(e),"stack": new Error().stack});
                        }

                        table.columns = schema;
                    } else {

                        isNewTable = true;

                        table = {}
                        table.id = util.getId();
                        table.columns = schema;
                    
                        table.name = tableName;
                        table.type = tableType;
                        table._type = "table";
                    }

                    var collection =  global.mongoClient.db(appId).collection("_Schema");
                
                    console.log('Collection Object Created.');

                    collection.findOneAndUpdate({name:tableName},{$set:table},{upsert:true,returnOriginal: false},function(err,response){
                        var table=response.value || null;
                        if(err) {
                            deferred.reject("Error : Failed to save the table. ");
                        }else if(table) {
                          //clear the cache.
                            global.redisClient.del(global.keys.cacheSchemaPrefix + '-' + appId + ':' + tableName);

                            var cloneOldColumns=[].concat(oldColumns || []);

                            if (isNewTable) {
                                var mongoPromise = global.mongoUtil.collection.create(appId, tableName, schema);                               
                                //Index all text fields
                                var mongoIndexTextPromise = global.mongoUtil.collection.deleteAndCreateTextIndexes(appId, tableName, cloneOldColumns, schema);                              
                                
                                q.allSettled([mongoPromise,mongoIndexTextPromise]).then(function (res) {
                                    if (res[0].state === 'fulfilled' && res[1].state === 'fulfilled') {                                        
                                        deferred.resolve(table);                                        
                                    } else {
                                        //TODO : Rollback.
                                        deferred.resolve(table);
                                    }
                                }, function (error) {
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

                                    for (var i = 0; i < columnsToAdd.length; i++) {
                                        promises.push(self.createColumn(appId, tableName, columnsToAdd[i]));
                                    }

                                    //Index all text fields
                                    promises.push(global.mongoUtil.collection.deleteAndCreateTextIndexes(appId, tableName, cloneOldColumns, schema));                              
                                
                                    q.all(promises).then(function (res) {                                         
                                        deferred.resolve(table);
                                    }, function (error) {
                                        //TODO : Rollback.
                                        deferred.resolve(table);
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
        
            try {
                var mongoPromise = global.mongoUtil.collection.addColumn(appId, collectionName, column);               
                q.allSettled([mongoPromise]).then(function (res) {
                    if(res[0].state === 'fulfilled') {
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

        createDefaultTables: function (appId){
            return q.all([
                        global.appService.upsertTable(appId,'Role',tablesData.Role),
                        global.appService.upsertTable(appId,'Device',tablesData.Device),
                        global.appService.upsertTable(appId,'User',tablesData.User)
                    ])
        },

        changeAppClientKey: function(appId,value) {

            var deferred = q.defer();

            try{                

                var query={
                  appId:appId                
                };



                var newClientkey = crypto.pbkdf2Sync(Math.random().toString(36).substr(2, 5), global.keys.secureKey, 100, 16).toString("base64");

                if(value){
                    newClientkey = value;
                }

                var setJSON={
                    "keys.js":newClientkey 
                };

                var collection =  global.mongoClient.db(global.keys.globalDb).collection("projects");
                collection.findOneAndUpdate(query,{$set:setJSON},{returnOriginal: false},function(err,newDoc){                
                    if (err) {
                        global.winston.log('error',err);
                        deferred.reject(err);
                    }
                    if(newDoc){
                        console.log("Successfull on Change client key in app...");
                        //delete project/app from redis so further request will make a new entry with new keys
                        deleteAppFromRedis(appId);
                        deferred.resolve(newDoc.value);
                    }else{
                        console.log("App not found for Change client key in app...");
                        deferred.resolve(null);
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },

        changeAppMasterKey: function(appId,value) {

            var deferred = q.defer();

            try{                

                var query={
                  appId:appId                
                };

                var newMasterkey = crypto.pbkdf2Sync(Math.random().toString(36).substr(2, 5), global.keys.secureKey, 100, 16).toString("base64");

                if(value){
                    newMasterkey = value;
                }

                var setJSON={
                    "keys.master":newMasterkey 
                };

                var collection =  global.mongoClient.db(global.keys.globalDb).collection("projects");
                collection.findOneAndUpdate(query,{$set:setJSON},{returnOriginal: false},function(err,newDoc){                
                    if (err) {
                        global.winston.log('error',err);
                        deferred.reject(err);
                    }
                    if(newDoc){
                        console.log("Successfull on Change client key in app...");
                        //delete project/app from redis so further request will make a new entry with new keys
                        deleteAppFromRedis(appId);
                        deferred.resolve(newDoc.value);
                    }else{
                        console.log("App not found for Change client key in app...");
                        deferred.resolve(null);
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },

        exportDatabase : function(appId){
            var deferred = q.defer();
            var promises = []
            global.mongoClient.db(appId).listCollections().toArray(function(err, collections) {
                if (err) {
                    global.winston.log('error',err);
                    deferred.reject(err);
                }
                for(var k in collections){
                    (function(k){
                        var promise = new Promise(function(resolve,reject){
                           collections[k].documents = []
                            data = global.mongoClient.db(appId).collection(collections[k].name).find()
                            data.toArray(function(err,data){
                                if (err) {
                                    global.winston.log('error',err);
                                    reject(err);
                                }
                                collections[k].documents.push(data)
                                resolve()
                            }) 
                        })
                        promises.push(promise)
                    })(k)
                }
                Promise.all(promises).then(function(data){
                    deferred.resolve(collections)
                },function(err){
                    deferred.reject(err);
                })
            }); 
            return deferred.promise; 
        },

        importDatabase : function(appId,file){
            var fileData
            var deferred = q.defer();
            var collectionRemovePromises = []
            var collectionCreatePromises = []
            var validated = false

            try {
                fileData = JSON.parse(file.toString())
                for(var k in fileData){
                    if(fileData[k].name == '_Schema'){
                        validated = true
                    }
                }
                if(!validated){
                    deferred.reject('Invalid CloudBoost Database file');
                }
            } catch (e) {
                deferred.reject('Invalid CloudBoost Database file');
            }
            
            global.mongoClient.db(appId).listCollections().toArray(function(err, Collections) {
                if (err) {
                    global.winston.log('error',err);
                    deferred.reject(err);
                }
                for(var k in Collections){
                    (function(k){
                        if(Collections[k].name.split('.')[0] != 'system'){ // skipping delete for system namespaces
                            collectionRemovePromises.push(new Promise(function(resolve,reject){
                                global.mongoClient.db(appId).collection(Collections[k].name).remove({},function(err, removed){
                                    if(err){
                                        reject(err)
                                    }
                                    resolve(true)                                
                                });
                            }))
                        }
                    })(k)
                }
                Promise.all(collectionRemovePromises).then(function(data){
                    for(var i in fileData){
                        (function(i){
                            global.mongoClient.db(appId).createCollection(fileData[i].name, function(err, col) {
                                 global.mongoClient.db(appId).collection(fileData[i].name, function(err, col) {
                                     for (var j in fileData[i].documents) {
                                        (function(j){
                                            col.insert(fileData[i].documents[j], function(err) {
                                                if(i == (fileData.length-1) && j == (fileData[i].documents.length-1)){
                                                    deferred.resolve(true);
                                                }
                                            });
                                        })(j)
                                     }
                                 });
                            });
                        })(i)
                    }
                },function(err){
                    deferred.reject(err);
                })
            });
            return deferred.promise; 
        },

        createDatabaseUser: function(appId){
            var deferred = q.defer();

            var username = util.getId()
            var password = util.getId()

            global.mongoClient.db(appId).addUser(username, password, { roles: [{role:"readWrite",db:appId}]},function(err, result) {
                if(err) deferred.reject(err)
                    else deferred.resolve({username:username,password:password})
            });
            return deferred.promise;
        }
      
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

                if(typeof columns[i].defaultValue === 'string') {
                    if(columns[i].dataType === 'URL') {
                        if (columns[i].defaultValue.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i)[0] !== columns[i].defaultValue){
                            return false;
                        }
                    }     
                    else if(columns[i].dataType === 'Email'){
                        if (columns[i].defaultValue.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i)[0] !== columns[i].defaultValue){
                            return false;
                        }
                    }
                    // if the set dataType is not other string Datatypes (Text, EncryptedText, DateTime) available in cloudboost
                    else if (['Text', 'EncryptedText', 'DateTime'].indexOf(columns[i].dataType) === -1){
                        return false;
                    }
                }
                else if(columns[i].defaultValue === null) {
                        // Do nothing
                }
                else if(['number', 'boolean', 'object', 'undefined'].indexOf(typeof columns[i].defaultValue) > -1) {
                    if(columns[i].dataType.toUpperCase() !== (typeof columns[i].defaultValue).toUpperCase()){
                        return false;
                    }
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

function deleteAppFromRedis(appId){
  var deferred = q.defer();

  try{
      //check redis cache first.       
    global.redisClient.del(global.keys.cacheAppPrefix+':'+appId, function (err, caches) {
      if (err){
        deferred.reject(err);
      }else{
        deferred.resolve("Success");
      }          
    });      

  } catch(err){           
      global.winston.log('error',{"error":String(err),"stack": new Error().stack});
      deferred.reject(err);
  } 

  return deferred.promise;
}