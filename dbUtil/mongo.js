
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var q = require("q");

module.exports = function () {
    
    var obj = {};
    
    obj.app = {};
    
    obj.collection = {};
    
    obj.app = {
    
        drop: function (appId){
    
        // This is app delete function, 
        //it just drops all the collections in mongodb which belong to one app
            var deferred = q.defer();

            try{
                var _self = obj;

                if(global.mongoDisconnected ) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                _self.collection.list(appId).then(function(collections){
                    if(collections.length === 0 )
                        deferred.resolve();
        
                    var promises = []; 
        
                    for(var i=0;i<collections.length; i++){
                        promises.push(_self.collection.dropCollection(appId, collections[i].name));
                    }
        
                    q.all(promises).then(function(res){
                        deferred.reject(res);
                        }, function(err){
                        global.winston.log('error',err);
                        deferred.resolve(err);
                    });
                });

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }
    
            return deferred.promise;
        },

        create: function (appId){

            console.log("Create app from mongo");

            var deferred = q.defer();

            try{
                if(global.mongoDisconnected ) {
                    deferred.reject("Error : Storage is not connected.");
                    return deferred.promise;
                }

                var Db = require('mongodb').Db;
                var replSet = require('../database-connect/mongoConnect.js')().replSet();

                var db = new Db(appId, replSet, { w: 1 });

                if (db) {
                    console.log("Success : App created in Storage backend.");                    
                    deferred.resolve(db);
                } else {
                    console.log("Error : Creating an app in the Storage Backend ");
                    global.winston.log("Error : Creating an app in the Storage Backend ");
                    deferred.reject("Error : Creating an app in the Storage Backend ");
                }
            }catch(e){
                console.log("Error : Creating an app in Storage Backend.");
                console.log(e);
                global.winston.log('error',{"error":String(e),"stack": new Error().stack});  
                deferred.reject(e); 
            }

            return deferred.promise;
        }
}

	obj.document = {

		getSearchableDocuments : function(appId, collectionName){

			var _self = obj;
			var deferred = q.defer();

            try{
                if(global.mongoDisconnected || !global.database) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

               // var collection = global.database.collection(_self.collection.getId(appId, collectionName));
                var collection = global.mongoClient.db(appId).collection(_self.collection.getId(appId, collectionName));
    			var findQuery = collection.find();

    			findQuery.toArray(function(err, docs) {
    				if (err) {
    					deferred.reject(err);
    				} else {
    					deferred.resolve(docs);
    				}
    			});

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }

			return deferred.promise;
		}

	};

	//Collection related processings:
    obj.collection = {
        
        addColumn: function (appId, collectionName, column) {
            var deferred = global.q.defer();

            try{
                if(global.mongoDisconnected) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                if (column.dataType === 'GeoPoint' || column.dataType === 'Text') {
                        obj.collection.createIndex(appId, collectionName, column.name, column.dataType).then(function () {
                        deferred.resolve("Index Created");
                    }, function (err) {
                        global.winston.log('error',err);
                        deferred.reject("Unable to create Index in Mongo");
                    });
                } else {
                    deferred.resolve();
                }

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }
            return deferred.promise;
        },
        
        
        create: function (appId, collectionName, schema){
            var deferred = global.q.defer();

            try{
                if(global.mongoDisconnected ) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                var promises = [];
                for (var i = 0; i < schema.length; i++) {
                    if (schema[i].dataType === 'GeoPoint') {
                        promises.push(obj.collection.createIndex(appId, collectionName,schema[i].name, schema[i].dataType))
                    }
                }
                if (promises.length > 0) {
                    global.q.all(promises).then(function () {
                        deferred.resolve("Index Created");
                    }, function (err) {
                        global.winston.log('error',err);
                        deferred.reject("Unable to create Index in Mongo");
                    });
                } else {
                    deferred.resolve("Created Table in Mongo");
                }

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }
            return deferred.promise;
        },
        
        createIndex: function (appId, collectionName, columnName, columnType) {
            var deferred = global.q.defer();

            try{
                if(global.mongoDisconnected ) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }
                /**
                    Creating a wild card index , instaed of creating individual $text index on each column seperately
                **/
                var obj = {}
                if(columnType ==='GeoPoint'){
                    obj[columnName] = "2dsphere";
                }
                var collection =  global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName));
                collection.createIndex({ "$**": "text" }, function (err, res) {
                    if (err) {
                        global.winston.log('error',err);
                        console.log("Could not create index");
                        deferred.reject(err);
                    }else {
                        // create geopoint indexing explicitly
                        collection.createIndex(obj)
                        console.log(res);
                        deferred.resolve(res);
                    }

                }); 
                

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }
            return deferred.promise;
        },

        deleteAndCreateTextIndexes: function (appId, collectionName, oldColumns, schema) {
            var deferred = global.q.defer();

            try{
                if(global.mongoDisconnected ) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                } 
                /**
                    Creating a wild card index , instaed of creating individual $text index on each column seperately
                **/
                var collection =  global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName));
                collection.createIndex({ "$**": "text" }, function (err, res) {
                    if (err) {
                        global.winston.log('error',err);
                        console.log("Could not create index");
                        deferred.reject(err);
                    }else {
                        console.log(res);
                        deferred.resolve(res);
                    }

                });                                            

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }
            return deferred.promise;
        },

        getIndexes: function (appId, collectionName) {
            var deferred = global.q.defer();

            try{
                if(global.mongoDisconnected ) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }               
               
                var collection =  global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName));
                collection.indexInformation(function (err, res) {
                    if (err) {
                        console.log("oops");
                        deferred.resolve(null);
                    }
                    else {
                        console.log(res);
                        deferred.resolve(res);
                    }
                });

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }
            return deferred.promise;
        },
		renameColumn : function(appId, collectionName, oldColumnName, newColumnName){

            var deferred = q.defer();

            try{
    			console.log('++++ Mongo : Renaming Column ++++++');
    			console.log('Collection Name : '+ collectionName);
    			console.log('Old Column Name : '+oldColumnName);
    			console.log('New Column Name : '+newColumnName);			

    			var _self = obj;

    			var collection =  global.mongoClient.db(appId).collection(_self.collection.getId(appId, collectionName));

    			var query = {};

    			query[oldColumnName] = newColumnName;

    			collection.update({},{$rename: query},{multi : true}, function(err, result){
    				if(err){
                        global.winston.log('error',err);
    					console.log('Column Rename Error');
    					console.log(err);
    					deferred.reject(err);
    				}else{
    					console.log('Column Renamed');
    					deferred.resolve();
    				}
    			});

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }

			return deferred.promise;
		},

		dropColumn : function(appId, collectionName, columnName, columnType){

            var deferred = q.defer();

            try{
    			console.log('++++ Mongo : Dropping Column ++++++');
    			console.log('Collection Name : '+ collectionName);
    			console.log('Column Name : '+columnName);			

                var _self = obj;

                if(global.mongoDisconnected) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }                

    			var query = {};

    			query[columnName] = 1;
                
                var indexName=null;
                if(columnType==='GeoPoint'){
                    indexName = columnName+"_2dsphere";
                }               

                var promises=[];
                promises.push(_dropIndex(appId,collectionName,indexName));
                promises.push(_unsetColumn(appId,collectionName,query));         
               
                //Promise List
                if(promises && promises.length>0){

                    q.allSettled(promises).then(function(resultList){

                        var resFulfilled=[];
                        var resRejected=[];
                        resultList.forEach(function (eachResult) {
                            if (eachResult.state === "fulfilled") {
                                resFulfilled.push(eachResult.value);
                            } else {
                                resRejected.push(eachResult.reason);
                            }
                        });
                        
                        //Check atleast one is fulfilled                        
                        if(resFulfilled && resFulfilled.length>0){
                            deferred.resolve();
                        }else{
                            deferred.reject("Unable to drop column and index");
                        }
                        
                    });

                }else{                          
                    deferred.reslove();
                }
                

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }

			return deferred.promise;
		},

		dropCollection : function(appId, collectionName){

            var deferred = q.defer();

            try{
    			console.log('++++ Mongo : Dropping Collection ++++++');
    			console.log('Collection Name : '+ collectionName);    			

                if(global.mongoDisconnected) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }
                var _self = obj;

    			var collection =  global.mongoClient.db(appId).collection(_self.collection.getId(appId, collectionName));
    			
    			collection.drop(function(err, reply) {
    				if(err){
    					if(err.message === 'ns not found'){
    						console.log('Collection Drop Success');
    						deferred.resolve();
    					} else {
                            global.winston.log('error',err);
    						console.log('Collection Drop Error');
    						deferred.reject(err);
    					}
    				}else{
    					console.log('Collection Dropped');
    					deferred.resolve();
    				}
    			});

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }

			return deferred.promise;

		},

		renameCollection : function(appId, oldCollectionName, newCollectionName){

            var deferred = q.defer();

            try{
    			console.log('++++ Mongo : Renaming Collection ++++++');
    			console.log('Collection Name : '+ oldCollectionName);   			

    			var _self = obj;

    			var collection =  global.mongoClient.db(appId).collection(_self.collection.getId(appId, oldCollectionName));
    			
    			collection.rename(_self.collection.getId(appId, newCollectionName), function(err, collection) {
    				if(err){
    					
    					console.log(err);

    					if(err.message === 'source namespace does not exist'){ 
    						console.log('Collection Renamed');//if oldCollectionName is not found.
    						deferred.resolve();
    					}else{
    						console.log('Collection Rename Error');
                            global.winston.log('error',err);
    						deferred.reject(err);
    					}

    					
    				}else{
    					console.log('Collection Renamed');
    					deferred.resolve();
    				}
    			});

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }
			return deferred.promise;
		},

		getId: function(appId, collectionName) { //for a given appId and collectionName it gives a unique collection name
            try{
                return collectionName;
            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});                                                     
            }
		},

		getSchema: function(appId, collectionName) {
			var deferred = q.defer();

            try{
    			global.redisClient.get(global.keys.cacheSchemaPrefix+'-'+appId+':'+collectionName, function(err, res){
    				if(res){
    					deferred.resolve(JSON.parse(res).columns);
    				}else{
                        var collection =  global.mongoClient.db(appId).collection("_Schema");
                        var findQuery = collection.find({name : collectionName});
                        findQuery.toArray(function(err, tables) {
                            var res=tables[0];
                            if (err) {
                                global.winston.log('error',err);
                                deferred.reject(err);
                            }else if(!res){
                                deferred.reject('No Table found.');
                            } else {
                                global.redisClient.setex(global.keys.cacheSchemaPrefix+'-'+appId+':'+collectionName, global.keys.schemaExpirationTimeFromCache, JSON.stringify(res._doc));
                                deferred.resolve(res.columns);
                            }

                        });
    				}					
    			});	

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }

			return deferred.promise;
		},

		list: function(appId) {

			var deferred = q.defer();

            try{    		
                var collection =  global.mongoClient.db(appId).collection("_Schema");
                var findQuery = collection.find({});
                findQuery.toArray(function(err, res) {
                    if (err) {
                        global.winston.log('error',err);
                        deferred.reject(err);
                    } else {
                        deferred.resolve(res);
                    }

                });

            }catch(err){                    
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
                deferred.reject(err);                                     
            }

			return deferred.promise;
		}


	};

	return obj;	
};

//Private Functions
function _dropIndex(appId, collectionName, indexString){

    var deferred = q.defer();

    try{   


        if(indexString && indexString!=""){
            var collection =  global.mongoClient.db(appId).collection(collectionName);
            collection.dropIndex(indexString,function(err,result){
                if(err && err.message && err.message!= 'ns not found') {                
                    global.winston.log('error', err);
                    console.log("unable to drop index");
                    console.log(err);
                    deferred.reject(err);               
                }else{
                    deferred.resolve(result);
                }
            });
        }else{
            deferred.resolve("Nothing to drop");
        }
       

    }catch(err){                    
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
        deferred.reject(err);                                     
    }
    return deferred.promise;
}

function _unsetColumn(appId, collectionName, query){

    var deferred = q.defer();

    try{  

        if(query && Object.keys(query).length>0){
            var collection =  global.mongoClient.db(appId).collection(collectionName);
            collection.update({},{$unset: query},{multi : true}, function(err, result){
                if(err){
                    console.log('Column Drop Error');
                    deferred.reject(err);
                }else{
                    console.log('Column Dropped');
                    deferred.resolve();
                }
            });
        }else{
            deferred.resolve("Nothing to unset");
        }
       

    }catch(err){                    
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});  
        deferred.reject(err);                                     
    }
    return deferred.promise;
}

