/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require("q");
var _ = require('underscore');
var util = require('../helpers/util.js');
var Grid = require('gridfs-stream');

module.exports = function() {

    var obj = {};

    obj.document = {

        get: function(appId, collectionName, documentId, accessList, isMasterKey) { //returns the document that matches the _id with the documentId
            var _self = obj;

            var deferred = q.defer();
            try {
                _self.document.findOne(appId, collectionName, {
                    _id: documentId
                }, null, null, null, accessList, isMasterKey).then(function(doc) {
                    deferred.resolve(doc);
                }, function(error) {
                    global.winston.log('error', error);
                    deferred.reject(error);
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
            return deferred.promise;
        },

        _include: function(appId, include, docs) {
            //This function is for joins. :)
            var _self = obj;
            var join = [];
            var deferred = global.q.defer();
            try {
                //include and merge all the documents.
                var promises = [];
                include.sort();
                for (var i = 0; i < include.length; i++) {
                    var columnName = include[i].split('.')[0];
                    join.push(columnName);
                    for (var k = 1; k < include.length; k++) {
                        if (columnName === include[k].split('.')[0]) {
                            i = i + 1;
                        } else {
                            break;
                        }
                    }
                    //include this column and merge.
                    var idList = [];
                    var collectionName = null;
                    _.each(docs, function(doc) {
                        if (doc[columnName] != null) {
                            // checks if the doc[columnName] is an list of relations or a relation
                            if (Object.getPrototypeOf(doc[columnName]) === Object.prototype) {
                                if (doc[columnName] && doc[columnName]._id) {
                                    if (doc[columnName]._type === 'file') {
                                        collectionName = "_File";
                                    } else {
                                        collectionName = doc[columnName]._tableName;
                                    }
                                    idList.push(doc[columnName]._id);
                                }
                            } else {
                                for (var j = 0; j < doc[columnName].length; j++) {
                                    if (doc[columnName][j] && doc[columnName][j]._id) {
                                        if (doc[columnName][j]._type === 'file') {
                                            collectionName = "_File";
                                        } else {
                                            collectionName = doc[columnName][j]._tableName;
                                        }
                                        idList.push(doc[columnName][j]._id);
                                    }
                                }
                            }
                        }
                    }, null);

                    // if(idList.length >0 && collectionName) {
                    var q = {};
                    q['_id'] = {};
                    q['_id']['$in'] = idList;
                    promises.push(_self.document.fetch_data(appId, collectionName, q));
                    //}
                }

                global.q.all(promises).then(function(arrayOfDocs) {
                    var pr = [];
                    var r_include = [];
                    for (var i = 0; i < join.length; i++) {
                        for (var k = 0; k < include.length; k++) {
                            if (join[i] === include[k].split('.')[0])
                                r_include.push(include[k]);
                            }
                        for (var k = 0; k < r_include.length; k++) {
                            r_include[k] = r_include[k].split('.').splice(1, 1).join('.');
                        }
                        for (var k = 0; k < r_include.length; k++) {
                            if (r_include[k] === join[i] || r_include[k] === '') {
                                r_include.splice(k, 1);
                                k = k - 1;
                            }
                        }
                        if (r_include.length > 0) {
                            pr.push(_self.document._include(appId, r_include, arrayOfDocs[i]));
                        } else {
                            var new_promise = global.q.defer();
                            new_promise.resolve(arrayOfDocs[i]);
                            pr.push(new_promise.promise);
                        }

                    }

                    global.q.all(pr).then(function(arrayOfDocs) {
                        for (var i = 0; i < docs.length; i++) {
                            for (var j = 0; j < join.length; j++) {
                                //if the doc contains an relation with a columnName.
                                var relationalDoc = docs[i][join[j]];
                                if (relationalDoc) {
                                    var rel = null;
                                    if (relationalDoc.constructor === Array) {
                                        for (var m = 0; m < relationalDoc.length; m++) {
                                            for (var k = 0; k < arrayOfDocs[j].length; k++) {
                                                if (arrayOfDocs[j][k]._id.toString() === relationalDoc[m]._id.toString()) {
                                                    rel = arrayOfDocs[j][k];
                                                    break;
                                                }
                                            }
                                            if (rel) {
                                                docs[i][include[j]][m] = rel;
                                            }
                                        }
                                    } else {
                                        for (var k = 0; k < arrayOfDocs[j].length; k++) {
                                            if (arrayOfDocs[j][k]._id.toString() === relationalDoc._id.toString()) {
                                                rel = arrayOfDocs[j][k];
                                                break;
                                            }
                                        }

                                        if (rel) {
                                            docs[i][join[j]] = rel;
                                        }
                                    }
                                }
                            }
                        }

                        docs = _deserialize(docs);
                        deferred.resolve(docs);
                    }, function(error) {
                        global.winston.log('error', error);
                        console.log(error);
                        deferred.reject(error);
                    });
                }, function(error) {
                    global.winston.log('error', error);
                    console.log(error);
                    deferred.reject();
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
            return deferred.promise;
        },

        fetch_data: function(appId, collectionName, q, promises) {
            var includeDeferred = global.q.defer();

            try {
                if (global.mongoDisconnected) {
                    includeDeferred.reject("Database Not Connected");
                    return includeDeferred.promise;
                }

                if (!collectionName || !q._id['$in']) {
                    includeDeferred.resolve([]);
                    return includeDeferred.promise;
                }

                global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName)).find(q).toArray(function(err, includeDocs) {
                    if (err) {
                        global.winston.log('error', err);
                        includeDeferred.reject(err);
                    } else {
                        includeDeferred.resolve(includeDocs);
                    }
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                includeDeferred.reject(err);
            }
            return includeDeferred.promise;
        },

        find: function(appId, collectionName, query, select, sort, limit, skip, accessList, isMasterKey) {

            console.log('++++++ In find ++++++');
            var deferred = q.defer();
            try {

                if (global.mongoDisconnected) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                console.log(query);
                var collection = global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName));
                var include = [];
                /*query for expires*/

                if (!query.$or) {

                    query.$or = [
                        {
                            "expires": null
                        }, {
                            "expires": {
                                $gte: new Date()
                            }
                        }
                    ];

                } else {

                    old_query = query.$or;
                    if (old_query[0].$include) {
                        if (old_query[0].$include.length > 0) {
                            include = include.concat(old_query[0].$include);
                        }
                        delete old_query[0].$include;
                        delete old_query[0].$includeList;
                    }
                    if (old_query[1]) {
                        if (old_query[1].$include) {
                            if (old_query[1].$include.length > 0) {
                                include = include.concat(old_query[1].$include);
                            }
                            delete old_query[1].$include;
                            delete old_query[1].$includeList;
                        }
                    }
                    query.$and = [
                        {
                            "$or": old_query
                        }, {
                            "$or": [
                                {
                                    "expires": null
                                }, {
                                    "expires": {
                                        $gte: new Date().getTime()
                                    }
                                }
                            ]
                        }
                    ];
                    delete query.$or;
                }

                if (!select || Object.keys(select).length === 0) {
                    select = {};
                } else {
                    //defult columns which should be selected.
                    select["ACL"] = 1;
                    select["createdAt"] = 1;
                    select["updatedAt"] = 1;
                    select["_id"] = 1;
                    select["_tableName"] = 1;
                    select["_type"] = 1;
                    select["expires"] = 1;
                }

                if (!sort) {
                    sort = {};
                }
                //default sort added
                /*
                    without sort if limit and skip are used, the records are returned out of order. To solve this default sort in ascending order of 'createdAt' is added
                */

                if (!sort['createdAt'])
                    sort['createdAt'] = 1

                if (!limit || limit === -1) {
                    limit = 20;
                }

                if (!isMasterKey) {
                    //if its not master key then apply ACL.
                    if (accessList.userId) {
                        var acl_query = [
                            {
                                $or: [
                                    {
                                        "ACL.read.allow.user": 'all'
                                    }, {
                                        "ACL.read.allow.user": accessList.userId
                                    }, {
                                        "ACL.read.allow.role": {
                                            $in: accessList.roles
                                        }
                                    }
                                ]
                            }, {
                                $and: [
                                    {
                                        "ACL.read.deny.user": {
                                            $ne: accessList.userId
                                        }
                                    }, {
                                        "ACL.read.deny.role": {
                                            $nin: accessList.roles
                                        }
                                    }
                                ]
                            }
                        ];
                        if (query.$and)
                            query.$and.push({"$and": acl_query});
                        else
                            query.$and = acl_query;
                        }
                    else {
                        query["ACL.read.allow.user"] = 'all';
                    }
                }

                //check for include.
                if (query.$include) {
                    console.log('Include : ');
                    console.log(query.$include);
                    if (query.$include.length > 0) {
                        include = include.concat(query.$include);
                    }
                }

                //delete $include and $includeList recursively
                query = _sanitizeQuery(query);

                var findQuery = collection.find(query, select);

                if (Object.keys(sort).length > 0) {
                    findQuery = findQuery.sort(sort);
                }

                if (skip) {
                    if (Object.keys(sort).length === 0) { //default sort it in desc order on createdAt
                        findQuery = findQuery.sort({"createdAt": -1});
                    }
                    findQuery = findQuery.skip(skip);
                }

                findQuery = findQuery.limit(limit);

                findQuery.toArray(function(err, docs) {
                    if (err) {
                        console.log('error', err);
                        deferred.reject(err);
                    } else {
                        if (!include || include.length === 0) {
                            docs = _deserialize(docs);
                            deferred.resolve(docs);
                        } else {
                            obj.document._include(appId, include, docs).then(function(docs) {
                                deferred.resolve(docs);
                            }, function(error) {
                                console.log('error', error);
                                deferred.reject(error);
                            });
                        }
                    }
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }

            return deferred.promise;
        },

        findOne: function(appId, collectionName, query, select, sort, skip, accessList, isMasterKey) {

            var mainPromise = q.defer();

            try {
                if (global.mongoDisconnected) {
                    mainPromise.reject("Database Not Connected");
                    return mainPromise.promise;
                }

                obj.document.find(appId, collectionName, query, select, sort, 1, skip, accessList, isMasterKey).then(function(list) {
                    if (Object.prototype.toString.call(list) === '[object Array]') {
                        if (list.length === 0) {
                            mainPromise.resolve(null);
                        } else {
                            mainPromise.resolve(list[0]);
                        }
                    }
                }, function(error) {
                    global.winston.log('error', error);
                    mainPromise.reject(null);
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                mainPromise.reject(err);
            }

            return mainPromise.promise;
        },

        save: function(appId, documentArray) {

            var deferred = q.defer();

            try {
                if (global.mongoDisconnected) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                var promises = [];
                console.log('++++++++ MongoDB Database Save ++++++++');
                for (var i = 0; i < documentArray.length; i++) {
                    promises.push(_save(appId, documentArray[i].document._tableName, documentArray[i].document));
                }
                global.q.allSettled(promises).then(function(docs) {
                    deferred.resolve(docs);
                }, function(err) {
                    global.winston.log('error', err);
                    deferred.reject(err);
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
            return deferred.promise;

        },
        _update: function(appId, collectionName, document) {

            var deferred = q.defer();

            try {

                if (global.mongoDisconnected) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                console.log('Creatign a MongoDB collection object.');

                var collection = global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName));

                console.log('Collection Object Created.');

                var documentId = document._id;

                var query = {};
                query._id = documentId;
                collection.update({
                    _id: documentId
                }, document, {
                    upsert: true
                }, function(err, list, status) {
                    if (err) {
                        global.winston.log('error', err);
                        deferred.reject(err);
                    } else if (list) {
                        console.log('++++ Object Updated +++');
                        deferred.resolve(document);
                    }

                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
            return deferred.promise;
        },

        count: function(appId, collectionName, query, limit, skip, accessList, isMasterKey) {
            var deferred = q.defer();

            try {
                if (global.mongoDisconnected) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                if (skip) {
                    skip = parseInt(skip);
                }

                var collection = global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName));

                //delete $include and $includeList recursively
                query = _sanitizeQuery(query);

                var findQuery = collection.find(query);
                if (skip) {
                    findQuery = findQuery.skip(skip);
                }

                findQuery.count(query, function(err, count) {
                    if (err) {
                        global.winston.log('error', err);
                        deferred.reject(err);
                    } else {
                        deferred.resolve(count);
                    }
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
            return deferred.promise;
        },

        distinct: function(appId, collectionName, onKey, query, select, sort, limit, skip, accessList, isMasterKey) {

            var deferred = q.defer();

            try {
                if (global.mongoDisconnected) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                var collection = global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName));

                var include = [];

                if (query.$include) {
                    if (query.$include.length > 0) {
                        include = include.concat(query.$include);
                    }
                }

                //delete $include and $includeList recursively
                query = _sanitizeQuery(query);

                var keys = {};
                var indexForDot = onKey.indexOf('.');

                // if DOT in onKey
                //  keys = { beforeDot: { afterDot : "$beforeDot.afterDot"} }
                // else
                //  keys = { onKey : "$"+onKey }
                if (indexForDot !== -1) {

                    //not using computed properties as it may not be available in server's nodejs version
                    keys[ onKey.slice(0, indexForDot) ] = { };
                    keys[ onKey.slice(0, indexForDot) ][ onKey.slice(indexForDot + 1) ] = "$" + onKey;
                }
                else
                    keys[onKey] = "$" + onKey;

                if (!sort || Object.keys(sort).length === 0) {
                    sort = {
                        "createdAt": 1
                    };
                }

                if (!query || Object.keys(query).length === 0) {
                    query = {
                        "_id": {
                            "$exists": true
                        }
                    }
                }

                var pipeline = [];
                pipeline.push({$match: query});
                pipeline.push({$sort: sort});

                //push the distinct aggregation.
                pipeline.push({
                    $group: {
                        _id: keys,
                        document: {
                            $first: "$$ROOT"
                        }
                    }
                });

                if (skip && skip != 0) {
                    pipeline.push({$skip: skip});
                }

                if (limit && limit != 0) {
                    pipeline.push({$limit: limit});
                }

                if (select && Object.keys(select).length > 0) {
                    pipeline.push({
                        $project: {
                            document: select
                        }
                    });
                }

                collection.aggregate(pipeline, function(err, res) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        var docs = [];

                        //filter out
                        for (var i = 0; i < res.length; i++) {
                            docs.push(res[i].document);
                        }

                        //include.
                        obj.document._include(appId, include, docs).then(function(docs) {
                            docs = _deserialize(docs);
                            deferred.resolve(docs);
                        }, function(error) {
                            global.winston.log('error', error);
                            deferred.reject(error);
                        });
                    }
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
            return deferred.promise;
        },

        aggregate: function(appId, collectionName, pipeline, limit, skip, accessList, isMasterKey) {

            var deferred = q.defer();

            try {
                if (global.mongoDisconnected) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                var collection = global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName));

                var query = {};
                if (pipeline.length > 0 && pipeline[0] && pipeline[0]["$match"]) {
                    query = pipeline[0]["$match"];
                    pipeline.shift(); //remove first element.
                }

                if (!isMasterKey) {
                    //if its not master key then apply ACL.
                    if (accessList.userId) {
                        var acl_query = [
                            {
                                $or: [
                                    {
                                        "ACL.read.allow.user": 'all'
                                    }, {
                                        "ACL.read.allow.user": accessList.userId
                                    }, {
                                        "ACL.read.allow.role": {
                                            $in: accessList.roles
                                        }
                                    }
                                ]
                            }, {
                                $and: [
                                    {
                                        "ACL.read.deny.user": {
                                            $ne: accessList.userId
                                        }
                                    }, {
                                        "ACL.read.deny.role": {
                                            $nin: accessList.roles
                                        }
                                    }
                                ]
                            }
                        ];
                        if (query.$and)
                            query.$and.push({"$and": acl_query});
                        else
                            query.$and = acl_query;
                        }
                    else {
                        query["ACL.read.allow.user"] = 'all';
                    }
                }

                if (!query.$or) {
                    query.$or = [
                        {
                            "expires": null
                        }, {
                            "expires": {
                                $gte: new Date()
                            }
                        }
                    ];
                }

                pipeline.unshift({"$match": query}); //add item to the begining of the pipeline.

                if (skip && skip != 0) {
                    pipeline.push({$skip: skip});
                }

                if (limit && limit != 0) {
                    pipeline.push({$limit: limit});
                }

                collection.aggregate(pipeline, function(err, res) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(res);
                    }
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }

            return deferred.promise;
        },

        _insert: function(appId, collectionName, document, accessList, isMasterKey) {

            var deferred = q.defer();

            try {
                if (global.mongoDisconnected) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                var collection = global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName));

                collection.save(document, function(err, doc) {
                    if (err) {
                        global.winston.log('error', err);
                        deferred.reject(err);
                    } else {
                        //elastic search code.
                        document = doc;
                        console.log('++++ Object Inserted +++');
                        console.log(document);
                        deferred.resolve(document);
                    }

                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }

            return deferred.promise;
        },

        delete: function(appId, collectionName, document, accessList, isMasterKey) {

            var documentId = document._id;
            var deferred = q.defer();

            try {
                if (global.mongoDisconnected) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                if (!document._id) {
                    deferred.reject('You cant delete an unsaved object');
                } else {
                    var collection = global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName));
                    var query = {
                        _id: documentId
                    };

                    collection.remove(query, {
                        w: 1 //returns the number of documents removed
                    }, function(err, doc) {
                        if (err || doc.result.n === 0) {
                            if (doc.result.n === 0) {
                                err = {
                                    "code": 401,
                                    "message": "You do not have permission to delete"
                                };
                                global.winston.log('error', err);
                                deferred.reject(err);
                            }
                        }
                        if (err) {
                            global.winston.log('error', err);
                            deferred.reject(err);
                        } else if (doc.result.n !== 0) {
                            deferred.resolve(doc.result);
                        } else {
                            deferred.reject({"code": 500, "message": "Server Error"});
                        }
                    });
                }

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }

            return deferred.promise;
        },

        deleteByQuery: function(appId, collectionName, query) {

            var _self = obj;
            var deferred = q.defer();

            try {
                if (global.mongoDisconnected) {
                    deferred.reject("Database Not Connected");
                    return deferred.promise;
                }

                var collection = global.mongoClient.db(appId).collection(global.mongoUtil.collection.getId(appId, collectionName));

                collection.remove(query, {
                    w: 1 //returns the number of documents removed
                }, function(err, doc) {
                    if (err) {
                        global.winston.log('error', err);
                        deferred.reject(err);
                    }
                    deferred.resolve(doc.result);
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }

            return deferred.promise;
        },
        /**********************GRIDFS FILES***************************************************************/

        /*Desc   : Get file from gridfs
          Params : appId,filename
          Returns: Promise
                   Resolve->file
                   Reject->Error on findOne() or file not found(null)
        */
        getFile: function(appId, filename) {

            var deferred = global.q.defer();

            try {
                var gfs = Grid(global.mongoClient.db(appId), require('mongodb'));

                gfs.findOne({
                    filename: filename
                }, function(err, file) {
                    if (err) {
                        deferred.reject(err);
                    }
                    if (!file) {
                        return deferred.resolve(null);
                    }

                    deferred.resolve(file);
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }

            return deferred.promise;
        },
        /*Desc   : Get fileStream from gridfs
          Params : appId,fileId
          Returns: fileStream
        */
        getFileStreamById: function(appId, fileId) {
            try {
                var gfs = Grid(global.mongoClient.db(appId), require('mongodb'));

                var readstream = gfs.createReadStream({_id: fileId});

                return readstream;

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                return null;
            }
        },
        /*Desc   : Delete file from gridfs
          Params : appId,filename
          Returns: Promise
                   Resolve->true
                   Reject->Error on exist() or remove() or file does not exists
        */
        deleteFileFromGridFs: function(appId, filename) {

            var deferred = global.q.defer();

            try {
                var gfs = Grid(global.mongoClient.db(appId), require('mongodb'));

                //File existence checking
                gfs.exist({
                    filename: filename
                }, function(err, found) {
                    if (err) {
                        //Error while checking file existence
                        deferred.reject(err);
                    }
                    if (found) {
                        gfs.remove({
                            filename: filename
                        }, function(err) {
                            if (err) {
                                deferred.reject(err);
                                //unable to delete
                            } else {
                                deferred.resolve(true);
                                //deleted
                            }

                            return deferred.resolve("Success");
                        });
                    } else {
                        //file does not exists
                        deferred.reject("file does not exists");
                    }
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }

            return deferred.promise;
        },
        /*Desc   : Save filestream to gridfs
          Params : appId,fileStream,fileName,contentType
          Returns: Promise
                   Resolve->fileObject
                   Reject->Error on writing file
        */
        saveFileStream: function(appId, fileStream, fileName, contentType) {

            var deferred = global.q.defer();

            try {
                var gfs = Grid(global.mongoClient.db(appId), require('mongodb'));

                //streaming to gridfs
                var writestream = gfs.createWriteStream({filename: fileName, mode: 'w', content_type: contentType});

                fileStream.pipe(writestream);

                writestream.on('close', function(file) {
                    deferred.resolve(file);
                    console.log("Successfully saved in gridfs");
                });

                writestream.on('error', function(error) {
                    deferred.reject(error);
                    writestream.destroy();
                    console.log("Failed to saved in gridfs");
                });

            } catch (err) {
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }

            return deferred.promise;
        },
        /**********************END OF GRIDFS FILES***************************************************************/
    };

    /* Private functions */

    function _sanitizeQuery(query) {

        if (query && query.$includeList) {
            delete query.$includeList;
        }

        if (query && query.$include) {
            delete query.$include;
        }

        if (query && query.$or && query.$or.length > 0) {
            for (var i = 0; i < query.$or.length; ++i) {
                query.$or[i] = _sanitizeQuery(query.$or[i]);
            }
        }

        if (query && query.$and && query.$and.length > 0) {
            for (var i = 0; i < query.$and.length; ++i) {
                query.$and[i] = _sanitizeQuery(query.$and[i]);
            }
        }

        return query;
    }

    function _save(appId, collectionName, document) {
        var deferredMain = q.defer();
        try {
            console.log('In MongoDB provate save function.');
            if (document._isModified) {
                delete document._isModified;
            }
            if (document._modifiedColumns) {
                delete document._modifiedColumns;
            }
            document = _serialize(document);
            //column key array to track sub documents.
            var columns = [];
            global.mongoService.document._update(appId, collectionName, document).then(function(doc) {
                console.log('Document updated.');
                doc = _deserialize(doc);
                deferredMain.resolve(doc);
            }, function(err) {
                global.winston.log('error', err);
                deferredMain.reject(err);
            });

        } catch (err) {
            global.winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            deferred.reject(err);
        }
        return deferredMain.promise;
    }

    function _serialize(document) {
        try {
            for (key in document) {
                if (document[key]) {
                    if (document[key].constructor === Object && document[key]._type) {
                        if (document[key]._type === 'point') {
                            var obj = {};
                            obj.type = 'Point';
                            obj.coordinates = document[key].coordinates;
                            document[key] = obj;
                        }
                    }

                    if (key === "createdAt" || key === "updatedAt" || key === "expires") {
                        if (typeof document[key] === "string") {
                            document[key] = new Date(document[key]);
                        }
                    }
                }
            }
            return document;

        } catch (err) {
            global.winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }
    }
    function _deserialize(docs) {
        try {
            if (docs.length > 0) {
                for (var i = 0; i < docs.length; i++) {
                    var document = docs[i];
                    for (key in document) {
                        if (document[key]) {
                            if (document[key].constructor === Object && document[key].type) {
                                if (document[key].type === 'Point') {
                                    var obj = {};
                                    obj._type = 'point';
                                    obj.coordinates = document[key].coordinates;
                                    obj.latitude = obj.coordinates[1];
                                    obj.longitude = obj.coordinates[0];
                                    document[key] = obj;
                                }
                            } else if (document[key].constructor === Array && document[key][0] && document[key][0].type && document[key][0].type === 'Point') {
                                var arr = [];
                                for (var j = 0; j < document[key].length; j++) {
                                    var obj = {};
                                    obj._type = 'point';
                                    obj.coordinates = document[key][j].coordinates;
                                    obj.latitude = obj.coordinates[1];
                                    obj.longitude = obj.coordinates[0];
                                    arr.push(obj);

                                }
                                document[key] = obj;
                            }
                        }
                    }
                    docs[i] = document;
                }
            } else {
                var document = docs;
                for (var key in document) {
                    if (document[key]) {
                        if (document[key].constructor === Object && document[key].type) {
                            if (document[key].type === 'Point') {
                                var obj = {};
                                obj._type = 'point';
                                obj.coordinates = document[key].coordinates;
                                obj.latitude = obj.coordinates[1];
                                obj.longitude = obj.coordinates[0];
                                document[key] = obj;
                            }
                        } else if (document[key].constructor === Array && document[key][0] && document[key][0].type && document[key][0].type === 'Point') {
                            var arr = [];
                            for (var j = 0; j < document[key].length; j++) {
                                var obj = {};
                                obj._type = 'point';
                                obj.coordinates = document[key][j].coordinates;
                                obj.latitude = obj.coordinates[1];
                                obj.longitude = obj.coordinates[0];
                                arr.push(obj);

                            }
                            document[key] = obj;
                        }
                    }
                }
                docs = document;
            }
            return docs;
        } catch (err) {
            global.winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }
    }
    function _checkBasicDataTypes(data, datatype, columnName, tableName) {

        try {
            if (Object.prototype.toString.call(data) === '[object Array]') {
                for (var i = 0; i < data.length; i++) {

                    var res = _checkDataTypeUtil(data[i], datatype, columnName, tableName);

                    if (res !== '')
                        return res;
                    }
                } else {
                return _checkDataTypeUtil(data, datatype, columnName, tableName);
            }

            return ''; //success!

        } catch (err) {
            global.winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }
    }

    function _checkDataTypeUtil(data, datatype, columnName, tableName) {

        try {
            var isValid = true;
            if (data && datatype === 'Text' && typeof data !== 'string') {
                isValid = false;
            }

            if (data && datatype === 'Email' && typeof data !== 'string' && util.isEmailValid(data)) {
                isValid = false;
            }

            if (data && datatype === 'URL' && typeof data !== 'string' && util.isEmailValid(data)) {
                isValid = false;
            }

            if (data && datatype === 'Password' && typeof data !== 'string') {
                isValid = false;
            }

            if (data && datatype === 'Boolean' && typeof data !== 'boolean') {
                isValid = false;
            }

            if (data && datatype === 'DateTime' && new Date(data).toString() === 'Invalid Date') {
                isValid = false;
            }

            if (data && datatype === 'ACL' && typeof data !== 'object' && doc[key].read && doc[key].write) {
                isValid = false;
            }

            if (data && datatype === 'Object' && typeof data !== 'object') {
                isValid = false;
            }

            if (data && datatype === 'File' && (data._type && data._type !== 'file')) {
                isValid = false;
            }

            if (!isValid) {
                return 'Invalid data in column ' + columnName + ' of table ' + tableName + '. It should be of type ' + datatype;
            }

            return ''; //success!

        } catch (err) {
            global.winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }
    }

    function _isBasicDataType(dataType) {
        try {
            var types = [
                'Object',
                'ACL',
                'DateTime',
                'Boolean',
                'Password',
                'URL',
                'Email',
                'Text',
                'File'
            ];

            if (types.indexOf(dataType) > -1) {
                return true;
            }

            return false;

        } catch (err) {
            global.winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }
    }

    function clone(obj) {
        try {
            var copy;

            // Handle the 3 simple types, and null or undefined
            if (null == obj || "object" != typeof obj)
                return obj;

            // Handle Date
            if (obj instanceof Date) {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            // Handle Array
            if (obj instanceof Array) {
                copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = clone(obj[i]);
                }
                return copy;
            }

            // Handle Object
            if (obj instanceof Object) {
                copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr))
                        copy[attr] = clone(obj[attr]);
                    }
                return copy;
            }

            throw new Error("Unable to copy obj! Its type isn't supported.");

        } catch (err) {
            global.winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }
    }

    return obj;
};
