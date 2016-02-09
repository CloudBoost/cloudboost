/* global global */
var q = require("q");
var _ = require('underscore');

module.exports = function(){

	var g = {};

	g.get = function(appId, collectionName, documentId, accessList, isMasterKey){
		appId = appId.toLowerCase();
		collectionName = collectionName.toLowerCase();

		console.log('++++++ In Elastic Search Get +++++++++');

        var deferred = q.defer();

        if(global.elasticDisconnected || !global.esClient) {
            deferred.reject("ERROR : Elastic Search is not connected");
            return deferred.promise;
        }

		global.esClient.get({
		  index: appId,
		  type: collectionName,
            id: documentId
		}, function (error, response) {
		  if(error){
		  	console.log('++++++ Get Error +++++++++');
              global.winston.log('error',error);
		  	console.log(error);
		  	deferred.reject(error);
		  }else{
		  	console.log('++++++ Get Success +++++++++');
		  	response = _deserialize([response])[0];
              deferred.resolve(response);
		  }
		});

		return deferred.promise;
	};

	g.exists = function(appId, collectionName, documentId, accessList, isMasterKey){

		appId = appId.toLowerCase();
		collectionName = collectionName.toLowerCase();

		console.log('++++++ In Elastic Search Exists +++++++++');

		var deferred = q.defer();


        if(global.elasticDisconnected || !global.esClient) {
            deferred.reject("Database Not Connected");
            return deferred.promise;
        }

		global.esClient.exists({
		  index: appId,
		  type: collectionName,
          id: documentId
		}, function (error, exists) {
			if(error){
                global.winston.log('error',error);
		  	    console.log(error);
		  	    deferred.reject(error);
		  }else{
		  	console.log('++++++ Exist Success +++++++++');
            deferred.resolve(exists);
		  }
		  
		});

		return deferred.promise;
	};

	g.save = function(appId, elasticDocumentArray){
        var deferred = q.defer();


        if(global.elasticDisconnected || !global.esClient) {
            deferred.reject("Database Not Connected");
            return deferred.promise;
        }
        var documentArray = JSON.parse(JSON.stringify(elasticDocumentArray));
        var promises = [];
        documentArray = _serialize(documentArray);
        for(var i=0;i<documentArray.length;i++){
            promises.push(_save(appId,documentArray[i].document._tableName,documentArray[i].document));
        }
        global.q.allSettled(promises).then(function(docs){
            //Not Serialising here as to send the document back, we are using Mongo.
            deferred.resolve(docs);
        },function(err){
            global.winston.log('error',err);
            console.log(err);
           deferred.reject(err);
        });
		return deferred.promise;
	};

	g._update = function(appId, collectionName, document,accessList, isMasterKey){

		appId = appId.toLowerCase();
		collectionName = collectionName.toLowerCase();

		console.log('++++++ In Elastic Search Update +++++++++');
        var deferred = q.defer();


        if(global.elasticDisconnected || !global.esClient) {
            deferred.reject("Database Not Connected");
            return deferred.promise;
        }

		g.get(appId, collectionName, document._id, accessList, isMasterKey).then(function(response){

			if(!response || !response._source)
				deferred.reject('Document not found, hence its not updated.');

			var doc = response._source;

					//update the document
					global.esClient.update({
					  index: appId,
					  type: collectionName,
                      id: document._id,
					  body:{
					  	doc : document
					  } 
					}, function (error, response) {
					  if(error){
                          global.winston.log('error',error);
                          console.log('++++++ Update Error +++++++++');
					  	console.log(error);
					  	deferred.reject(error);
					  }else{
					  	console.log('++++++ Update Success +++++++++');
					  	deferred.resolve(response);
					  }

					});

		}, function(error){
            global.winston.log('error',error);
            deferred.reject(error);
		});

		return deferred.promise;
	};


    g._create = function(appId, collectionName, document){

        appId = appId.toLowerCase();
        collectionName = collectionName.toLowerCase();

        console.log('++++++ In Elastic Search Update +++++++++');

        var deferred = q.defer();


        if(global.elasticDisconnected || !global.esClient) {
            deferred.reject("Database Not Connected");
            return deferred.promise;
        }

        global.esClient.create({
            index: appId,
            type: collectionName,
            id: document._id,
            body: document
        }, function (error, response) {
            if (error) {
                console.log('++++++ Save Error +++++++++');
                console.log(error);
                global.winston.log('error',error);
                deferred.reject(error);
            } else {
                console.log('++++++ Save Success +++++++++');
                deferred.resolve(response);
            }
        });

        return deferred.promise;
    };
    

	g.delete = function(appId, collectionName, documentId, accessList, isMasterKey){

		appId = appId.toLowerCase();
		collectionName = collectionName.toLowerCase();

		console.log('++++++ In Elastic Search Delete +++++++++');

		var deferred = q.defer();


        if(global.elasticDisconnected || !global.esClient) {
            deferred.reject("Database Not Connected");
            return deferred.promise;
        }

		g.get(appId, collectionName, documentId, accessList, isMasterKey).then(function(response){

			if(!response || !response._source)
				deferred.reject('Document not found, hence its not updated.');

			var doc = response._source;

			if(doc.ACL && (doc.ACL.write.allow.user || doc.ACL.write.allow.role)){

				//check if you have an access

				var found = false;

				if(isMasterKey){
					found = true;
				}else{
                    if(doc.ACL.write.allow.user.indexOf('all')>=0 || doc.ACL.write.allow.user.indexOf(accessList.userId)>=0){
                        found = true;
                    }else{
                        for(var i=0;i<accessList.roles.length;i++)
                        {
                            if(doc.ACL.write.allow.role.indexOf(accessList.roles[i])>0)
                            {
                                found = true;
                                break;
                            }
                        }
                    }
				}
				if(!found){
                    console.log('Unauthorized');
					deferred.reject('Unauthorized');
				}else{

					global.esClient.delete({
					  index: appId,
					  type: collectionName,
                        id: documentId,
					  ignore: [404]
					}, function (error, response) {
					 if(error){
					 	console.log('++++++ Delete Error +++++++++');
                         global.winston.log('error',error);
                         deferred.reject(error);
					  }else{
					  	console.log('++++++ Delete Success +++++++++');
					  	deferred.resolve(response);
					  }
					});
				}
			}
		}, function(error){
            global.winston.log('error',error);
            deferred.reject(error);
		});

		return deferred.promise;
	};

	g.search = function(appId, collectionNames, query, sort, limit, skip,accessList, isMasterKey){

        var deferred = q.defer();

        if(global.elasticDisconnected || !global.esClient) {
            deferred.reject("Database Not Connected");
            return deferred.promise;
        }

        query = _serializeSearchFilter(query);

		appId = appId.toLowerCase();

		console.log('++++++ In Elastic Search - Search +++++++++');
        console.log(query);

        /* Check if the query is empty and if it is, Add the default ElasticSearch query */
        if(query && query.filtered && Object.keys(query.filtered.query).length === 0)
            query.filtered.query.match_all = {};

        /* Adding expired data filter */
        var curr=new Date();
        var expire = [{ "missing": { "field": "expires" } }, { "range": { "expires": { "gte": curr } } }];
        var include = null;
        if(query.filtered) {

            if(!query.filtered.filter.bool){
                query.filtered.filter.bool = {};
                query.filtered.filter.bool.must = []; //and
                query.filtered.filter.bool.should = []; //or
                query.filtered.filter.bool.must_not = []; //not
            }
            
            if (query.filtered.filter.$include) { 
                include = query.filtered.filter.$include;
                delete query.filtered.filter.$include;
            }

            if(query.filtered.filter.bool){
                query.filtered.filter.bool.should = query.filtered.filter.bool.should.concat(expire);
            }
        }


         //Access List filter

         if(Object.keys(accessList).length>0){
             //Create the ACL query.
           var acl={bool:{"must":[],"should":[],"must_not":[]}};
            acl.bool.should.push({"term":{"ACL.read.allow.user":"all"}});
            acl.bool.should.push({"term":{"ACL.read.allow.user":accessList.userId}});
            acl.bool.must_not.push({"term":{"ACL.read.deny.user":accessList.userId}});
           if(accessList.roles.length>0) {
                acl.bool.must_not.push({"terms": {"ACl.read.deny.role": accessList.roles}});
                acl.bool.should.push({"terms": {"ACL.read.allow.role": accessList.roles}});
            }

             //add it to must of the rootQuery
            query.filtered.filter.bool.must.push(acl);
        }else {
             //attach the default ACL.
            query.filtered.filter.bool.must.push({"term":{"ACL.read.allow.user":"all"}});
        }


        //join collections and make collections lowercase
		if(collectionNames instanceof Array){
			collectionNames = collectionNames.join(',').toLowerCase();
		}else{
			collectionNames = collectionNames.toLowerCase();
		}



		var body = {};

		if(query){
			body.query=query;
		}

		if(limit || limit===0){
			body.size=limit;
		}

		if(skip || skip===0){
			body.from=skip;
		}

		if(sort && sort.length>0){
			body.sort=sort;
		}


		global.esClient.search({
		  index: appId,
		  type: collectionNames,
		  body: body
		  	
		}, function (error, response) {
		  if(error){
		  	console.log('++++++ Search Error +++++++++');
		  	console.log(error);
              global.winston.log('error',error);
              deferred.reject(error);
		  }else{
		  	console.log('++++++ Search Success +++++++++');
		  	if(response && response.hits && response.hits.hits){
			  	var documents = response.hits.hits; //array of all the documents. 
			  	var sourceDocuments = _.map(documents, function(doc){ return doc._source; }); //take _source form every document.
                    if (include && include.length > 0) {
                        global.mongoService.document._include(appId, include, sourceDocuments).then(function (docs) {
                            docs = _deserialize(docs);
                            deferred.resolve(docs);
                        }, function (error) {
                            global.winston.log('error',error);
                            deferred.reject(error);
                        });
                    } else {
                        docs = _deserialize(sourceDocuments);
                        deferred.resolve(sourceDocuments);
                    }
			 }else{
			 	return [];
			 }
		  }
		});

		return deferred.promise;
	};

	return g;
};

function _serializeSearchFilter(query){

    if(query && query.filtered && query.filtered.filter && query.filtered.filter.bool &&query.filtered.filter.bool.must){
        for(var i=0;i<query.filtered.filter.bool.must.length;i++) {
            if(query.filtered.filter.bool.must[i].geo_distance) {
                var columnName = Object.keys(query.filtered.filter.bool.must[i].geo_distance)[1];
                var coordinates = query.filtered.filter.bool.must[i].geo_distance[columnName];
                delete query.filtered.filter.bool.must[i].geo_distance[columnName];
                query.filtered.filter.bool.must[i].geo_distance[columnName + '_point'] = coordinates;
            }
        }
    }
    return query;
}

function _save(appId, collectionName, document){
    var deferred = q.defer();
    if(document._isModified){
        delete document._isModified;
    }
    if(document._modifiedColumns){
        delete document._modifiedColumns;
    }

    appId = appId.toLowerCase();
    collectionName = collectionName.toLowerCase();

    console.log('++++++ In Elastic Search Save +++++++++');

    global.elasticSearchService.exists(appId, collectionName, document._id).then(function (res) {

        if (!res) {
            //insert.
            global.elasticSearchService._create(appId, collectionName, document).then(function(response){
                deferred.resolve(response);
            }, function(error){
                global.winston.log('error',error);
                deferred.reject(error);
            });
        } else {
            global.elasticSearchService._update(appId, collectionName, document).then(function(response){
                deferred.resolve(response);
            }, function(error){
                global.winston.log('error',error);
                deferred.reject(error);
            });
        }

    }, function (error) {
        console.log('++++++ Save Error +++++++++');
        console.log(error);
        global.winston.log('error',error);
        deferred.reject(error);
    });

    return deferred.promise;
}

function _serialize(document){
    for(var i=0;i<document.length;i++){
        var doc = document[i].document;
        for(var key in doc) {
            if (doc[key]) {
                if (doc[key].constructor === Object && doc[key]._type && doc[key]._type === 'point') {
                    var geoPoint = doc[key].coordinates;
                    var name = key + '_point';
                    doc[name] = geoPoint;
                    delete doc[key];
                } else if (doc[key].constructor === Array && doc[key][0] && doc[key][0]._type && doc[key][0]._type === 'point') {
                    var name = key + '_point';
                    var geoPoint = {};
                    geoPoint.type = "multipoint";
                    var coordinates = [];
                    for (var j = 0; j < doc[key].length; j++) {
                        coordinates.push(doc[key][j].coordinates);
                    }
                    geoPoint.coordinates = coordinates;
                    doc[name] = geoPoint;
                    delete doc[key];
                }
            }
        }
        document[i].document = doc;
    }
    return document;
}


function _deserialize(document){
    for(var i=0;i<document.length;i++){
        for(var key in document[i]) {
            if (key.split('_')[1] === 'point'){
                var name = key.split('_')[0];
                if(document[i][key].constructor === Object && document[i][key].type === 'multipoint'){
                    var geoPoint = [];
                    for(var j=0;j<document[i][key].coordinates.length;j++){
                        var obj = {};
                        obj._type = 'point';
                        obj.latitude = document[i][key].coordinates[j][1];
                        obj.longitude = document[i][key].coordinates[j][0];
                        obj.coordinates = document[i][key].coordinates[j];
                        geoPoint.push(obj);
                    }
                    delete document[i][key];
                    document[i][name] = geoPoint;
                }else{
                    var geoPoint = {};
                    geoPoint._type = 'point';
                    geoPoint.latitude = document[i][key][1];
                    geoPoint.longitude = document[i][key][0];
                    geoPoint.coordinates = document[i][key];
                    delete document[i][key];
                    document[i][name] = geoPoint;
                }
            }
        }
    }
    return document;
}