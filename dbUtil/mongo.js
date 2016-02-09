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
    
            return deferred.promise;
        },

        create: function (appId){

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
            }

            return deferred.promise;
        }
}

	obj.document = {

		getSearchableDocuments : function(appId, collectionName){

			var _self = obj;
			var deferred = q.defer();

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

			return deferred.promise;
		}

	};

	//Collection related processings:
    obj.collection = {
        
        addColumn: function (appId, collectionName, column) {
            var deferred = global.q.defer();

            if(global.mongoDisconnected) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            if (column.dataType === 'GeoPoint') {
                    obj.collection.createIndex(appId, collectionName, column.name).then(function () {
                    deferred.resolve("Index Created");
                }, function (err) {
                    global.winston.log('error',err);
                    deferred.reject("Unable to create Index in Mongo");
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        },
        
        
        create: function (appId, collectionName, schema){
            var deferred = global.q.defer();

            if(global.mongoDisconnected ) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            var promises = [];
            for (var i = 0; i < schema.length; i++) {
                if (schema[i].dataType === 'GeoPoint') {
                    promises.push(obj.collection.createIndex(appId, collectionName,schema[i].name))
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
            return deferred.promise;
        },
        
        createIndex: function (appId, collectionName, columnName) {
            var deferred = global.q.defer();

            if(global.mongoDisconnected ) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            var obj = {};
            obj[columnName] = "2dsphere";
            var collection =  global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName));
            collection.createIndex(obj, function (err, res) {
                if (err) {
                    global.winston.log('error',err);
                    console.log("Could not create index");
                    deferred.reject(err);
                }
                else {
                    console.log(res);
                    deferred.resolve(res);
                }

            });
            return deferred.promise;
        },

		renameColumn : function(appId, collectionName, oldColumnName, newColumnName){

			console.log('++++ Mongo : Renaming Column ++++++');
			console.log('Collection Name : '+ collectionName);
			console.log('Old Column Name : '+oldColumnName);
			console.log('New Column Name : '+newColumnName);

			var deferred = q.defer();

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

			return deferred.promise;
		},

		dropColumn : function(appId, collectionName, columnName){

			console.log('++++ Mongo : Dropping Column ++++++');
			console.log('Collection Name : '+ collectionName);
			console.log('Column Name : '+columnName);

			var deferred = q.defer();

            if(global.mongoDisconnected) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            var _self = obj;

			var collection =  global.mongoClient.db(appId).collection(_self.collection.getId(appId, collectionName));

			var query = {};

			query[columnName] = 1;

            var indexName = columnName+"_2dsphere";
            collection.dropIndex(indexName,function(err,result){
                if(err)
                {
                    if(err.message === 'ns not found'){
                        console.log('Column Drop Success');
                        deferred.resolve();
                    } else {
                        global.winston.log('error', err);
                        console.log("unable to drop index");
                        console.log(err);
                    }
                }else{
                    console.log("index dropped");
                    console.log(result);
                }

            });

			collection.update({},{$unset: query},{multi : true}, function(err, result){
				if(err){
					console.log('Column Drop Error');
					deferred.reject(err);
				}else{
					console.log('Column Dropped');
					deferred.resolve();
				}
			});

			return deferred.promise;
		},

		dropCollection : function(appId, collectionName){

			console.log('++++ Mongo : Dropping Collection ++++++');
			console.log('Collection Name : '+ collectionName);

			var deferred = q.defer();

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

			return deferred.promise;

		},

		renameCollection : function(appId, oldCollectionName, newCollectionName){

			console.log('++++ Mongo : Renaming Collection ++++++');
			console.log('Collection Name : '+ oldCollectionName);

			var deferred = q.defer();

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

			return deferred.promise;
		},

		getId: function(appId, collectionName) { //for a given appId and collectionName it gives a unique collection name
			return collectionName;
		},

		getSchema: function(appId, collectionName) {
			var deferred = q.defer();

			global.redisClient.get(global.keys.cacheSchemaPrefix+'-'+appId+':'+collectionName, function(err, res){
				if(res){
					deferred.resolve(JSON.parse(res).columns);
				}else{
					global.model.Table.findOne({appId : appId, name : collectionName},function(err, res){
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

			return deferred.promise;
		},

		list: function(appId) {

			var deferred = q.defer();

			global.model.Table.find({appId : appId},function(err, res){

				if (err) {
                    global.winston.log('error',err);
					deferred.reject(err);
				} else {
					deferred.resolve(res);
				}

			});

			return deferred.promise;
		}


	};

	return obj;	
};