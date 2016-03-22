var q = require("q");

module.exports = function () {
    
    var g = {};
    
    g.collection = {};
    
    g.column = {};
    
    g.app = {};

    g.helper = {};
    
    g.app = {

        drop: function (appId) {
            
            var deferred = q.defer();

            try{
                appId = appId.toLowerCase();
                
                console.log('++++++ App Delete :  In Elastic Search App Delete +++++++++');
                
                

                if(global.elasticDisconnected || !global.esClient) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                global.esClient.indices.delete({
                    index: appId,
                    ignore: [404]
                }, function (error, response) {
                    if (error) {
                        global.winston.log('error',error);
                        console.log('++++++ Delete Error +++++++++');
                        console.log(error);
                        deferred.reject(error);
                    } else {
                        console.log('++++++ Delete Success +++++++++');
                        deferred.resolve(response);
                    }
                });

            }catch(err){                    
                global.winston.log('error',err);  
                deferred.reject(err);;                                      
            }
            
            return deferred.promise;
        },
        create: function (appId) {
            
            var deferred = q.defer();

            try{
                appId = appId.toLowerCase();
                console.log('Creating an app in search backend.');
                
                

                if(global.elasticDisconnected || !global.esClient) {
                    console.log("Error :Search backend not connected.");
                    deferred.reject("Error : Search backend not connected.");
                    return deferred.promise;
                }

                global.esClient.indices.create({
                    index: appId,
                    ignore: [404]
                }, function (error, response) {
                    if (error) {
                        global.winston.log('error',error);
                        console.log('Error : App cannot be created in search backend.');
                        console.log(error);
                        deferred.reject(error);
                    } else {
                        console.log('Success : App successfully created in search backend.');
                        deferred.resolve(response);
                    }
                });

            }catch(err){                    
                global.winston.log('error',err);  
                deferred.reject(err);;                                      
            }
            
            return deferred.promise;
        }
    }
    
    g.collection.drop = function (appId, collectionName) {
        
        var deferred = q.defer();

        try{
            appId = appId.toLowerCase();
            
            console.log('++++++ App Delete :  In Elastic Search Collection Delete +++++++++');
                

            if(global.elasticDisconnected || !global.esClient) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            collectionName = collectionName.toLowerCase();
            
            //THE CODE BELOW WILL BE DEPRECIATED. CHECK : https://www.elastic.co/guide/en/elasticsearch/reference/2.0/indices-delete-mapping.html

            global.esClient.indices.deleteMapping({
               index: appId,
               type: collectionName,
               ignore: [404],
               body: {
                   query: {
                       match_all : {}
                   }
               }
            }, function (error, response) {
               if (error) {
                   global.winston.log('error',error);
                   console.log('++++++ Delete Error In ES +++++++++');
                   console.log(error);
                   deferred.reject(error);
               } else {
                   console.log('++++++ Delete Success In ES +++++++++');
                   deferred.resolve(response);
               }
            });
            
            deferred.resolve();
        
        }catch(err){                    
            global.winston.log('error',err);  
            deferred.reject(err);;                                      
        }
        return deferred.promise;

    };
    
    g.collection.add = function (appId, collectionName,columns) {

        var deferred = global.q.defer();

        try{
            if(global.elasticDisconnected || !global.esClient) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            appId = appId.toLowerCase();
            collectionName = collectionName.toLowerCase();
            
            //map
            var mapping = null;
            
            if (!mapping) {
                mapping = {};
            }
            
            mapping[collectionName] = {};
            mapping[collectionName].properties = {};
            
            for (var i = 0; i < columns.length; i++) {
                    mapping = g.helper._mapElasticSearchType(appId, collectionName, columns[i], mapping);
            }
            
            //create mapping.
            global.esClient.indices.putMapping({
                index: appId,
                type: collectionName,
                body: mapping,
                ignoreConflicts : true
            }, function (err, result) {
                if (err) {
                    global.winston.log('error',err);
                    deferred.reject(err);
                } else {
                    deferred.resolve();
                }
            });

        }catch(err){                    
            global.winston.log('error',err);  
            deferred.reject(err);;                                      
        }
        
        return deferred.promise;

    };
    
    g.collection.insertBulk = function (appId, collectionName, docs) {
        
        var deferred = q.defer();

        try{
            appId = appId.toLowerCase();
            
            console.log('++++++ App Delete :  In Elastic Search bulk Insert +++++++++');
                  

            if(global.elasticDisconnected || !global.esClient) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            collectionName = collectionName.toLowerCase();
            
            var body = [];
            
            for (var i = 0; i < docs.length; i++) {
                var obj = { index: { _index: appId, _type: collectionName, _id: docs[i]._id } };
                body.push(obj);
                obj = docs[i];
                body.push(obj);
            }
            if (docs.length === 0)
                deferred.resolve();
            else {
                global.esClient.bulk({
                    body: body
                }, function (err, response) {
                    if (err) {
                        global.winston.log('error',err);
                        console.log('++++++ Bulk Insert Error +++++++++');
                        console.log(err);
                        deferred.reject(err);
                    } else {
                        console.log('++++++ Bulk Insert Success +++++++++');
                        deferred.resolve(response);
                    }
                });
            }

        }catch(err){                    
            global.winston.log('error',err);  
            deferred.reject(err);;                                      
        }
        return deferred.promise;

    };
    
    
    ///@column : is the Column Object as stored in Frontend Services.
    g.column.add = function (appId, collectionName, column) {
        
        var deferred = q.defer();

        try{
            if(global.elasticDisconnected || !global.esClient) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

            var mapping = null;
            appId = appId.toLowerCase();
            collectionName = collectionName.toLowerCase();

            if (!mapping) { 
                mapping = {};
            }
            
            mapping[collectionName] = {};
            mapping[collectionName].properties = {};
            mapping[collectionName].properties[column.name] = {};
            
            mapping = g.helper._mapElasticSearchType(appId, collectionName, column, mapping);

            //create mapping.
            global.esClient.indices.putMapping({
                index: appId,
                type: collectionName,
                body:mapping
            }, function (err, result) {
                if (err) {
                    global.winston.log('error',err);
                    deferred.reject(err);
                } else { 
                    deferred.resolve(result);
                }
            });

        }catch(err){                    
            global.winston.log('error',err);  
            deferred.reject(err);;                                      
        }
        
        return deferred.promise;
    };

	g.column.drop = function(appId, collectionName, columnName){

		var deferred = q.defer();

        try{
            if(global.elasticDisconnected || !global.esClient) {
                deferred.reject("Database Not Connected");
                return deferred.promise;
            }

    		//drop elastic search collection.
    		g.collection.drop(appId, collectionName).then(function(){
    			//get all the searchable documents in the new collection form mongodb. 
    			global.mongoUtil.document.getSearchableDocuments(appId, collectionName).then(function(docs){
                    global.mongoUtil.collection.getSchema(appId, collectionName).then(function (columns) {
                        //map
                        var mapping = null;

                        if (!mapping) {
                            mapping = {};
                        }

                        mapping[collectionName] = {};
                        mapping[collectionName].properties = {};

                        for (var i = 0; i < columns.length; i++) {
                            mapping = g.helper._mapElasticSearchType(appId, collectionName, columns[i], mapping);
                        }

                        //create mapping.
                        global.esClient.indices.putMapping({
                            index: appId,
                            type: collectionName,
                            body: mapping
                        }, function (err, result) {
                            if (err) {
                                global.winston.log('error',err);
                                deferred.reject(err);
                            } else {
                                g.collection.insertBulk(appId, collectionName, docs).then(function(res){
                                    deferred.resolve(res);
                                },function(err){
                                   deferred.reject(err);
                                });
                            }
                        });

                    }, function (error) {
                        deferred.reject("Cannot retrieve the schema of the table.");
                    });

                }).then(function(res){
                    deferred.resolve(res);
                }, function(err){
                    global.winston.log('error',err);
                    deferred.reject(err);
                });

            },function(err){
                deferred.reject(err);
            });

        }catch(err){                    
            global.winston.log('error',err);  
            deferred.reject(err);;                                      
        }

		return deferred.promise;

	};

    g.helper._mapElasticSearchType = function (appId, collectionName, column, mapping) {
        
        try{
            var cloudBoostType = column.dataType;
            
            mapping[collectionName].properties[column.name] = {};

            if(cloudBoostType === 'Id' && column.name === 'id'){
                mapping[collectionName].properties[column.name].type = "string";
                mapping[collectionName].properties[column.name].index = "not_analyzed";
                return mapping;
            }

            var types = global.cloudBoostHelper.getAllDataTypesInclId();

            if (types.indexOf(cloudBoostType) > -1) { 
                //if this is a valid type, then...
                if (cloudBoostType === 'Text' || (cloudBoostType === 'List' && column.relatedTo === 'Text')) {   
                    mapping[collectionName].properties[column.name].type = "string";
                }
                else if (cloudBoostType === 'EncryptedText' || (cloudBoostType === 'List' && column.relatedTo === 'EncryptedText')) {
                    mapping[collectionName].properties[column.name].type = "string";
                    mapping[collectionName].properties[column.name].index = "not_analyzed";
                }
                else if (cloudBoostType === 'Number' || (cloudBoostType === 'List' && column.relatedTo === 'Number')) {
                    mapping[collectionName].properties[column.name].type = "float";
                }
                else if (cloudBoostType === 'DateTime' || (cloudBoostType === 'List' && column.relatedTo === 'DateTime')) {
                    mapping[collectionName].properties[column.name].type = "date";
                    mapping[collectionName].properties[column.name].format = "date_time";
                }
                else if (cloudBoostType === 'Boolean' || (cloudBoostType === 'List' && column.relatedTo === 'Boolean')) {
                    mapping[collectionName].properties[column.name].type = "boolean";
                }
                else if (cloudBoostType === 'File' || (cloudBoostType === 'List' && column.relatedTo === 'File')) {
                    mapping[collectionName].properties[column.name].type = "object";
                }
                else  if (cloudBoostType === 'ACL' || (cloudBoostType === 'List' && column.relatedTo === 'ACL')) {
                    mapping[collectionName].properties[column.name].type = "object";
                }
                else if (cloudBoostType === 'Object' || (cloudBoostType === 'List' && column.relatedTo === 'Object')) {
                    mapping[collectionName].properties[column.name].type = "object";
                }
                else if (cloudBoostType === 'URL' || (cloudBoostType === 'List' && column.relatedTo === 'URL')) {
                    mapping[collectionName].properties[column.name].type = "string";
                    mapping[collectionName].properties[column.name].index = "not_analyzed";
                }
                else if (cloudBoostType === 'GeoPoint' || (cloudBoostType === 'List' && column.relatedTo === 'GeoPoint')) {
                    delete mapping[collectionName].properties[column.name];
                    mapping[collectionName].properties[column.name+'_point']={};
                    mapping[collectionName].properties[column.name+'_point'].type = "geo_point";

                   if (cloudBoostType === 'List') {
                       delete mapping[collectionName].properties[column.name];
                       mapping[collectionName].properties[column.name+'_point']={};
                       mapping[collectionName].properties[column.name+'_point'].type = "geo_shape";
                    }
                }

                else if (cloudBoostType === 'Email' || (cloudBoostType === 'List' && column.relatedTo === 'Email')) {
                    mapping[collectionName].properties[column.name].type = "string";
                    mapping[collectionName].properties[column.name].index = "not_analyzed";
                }
                
                else if (cloudBoostType === 'Relation' || (cloudBoostType === 'List' && column.relatedTo )) {
                    mapping[collectionName].properties[column.name].type = "nested";
                    mapping[collectionName].properties[column.name].include_in_parent = true;
                    mapping[collectionName].properties[column.name].properties = {};
                    mapping[collectionName].properties[column.name].properties._id = {};
                    mapping[collectionName].properties[column.name].properties._id.type = "string";
                    mapping[collectionName].properties[column.name].properties._id.index = "not_analyzed";
                }

            }

            return mapping;

        }catch(err){                    
            global.winston.log('error',err);  
            return null;                                     
        }
    };

	return g;
};