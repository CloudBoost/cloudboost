/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var mongoService = require('../databases/mongo');
var q = require('q');
var winston = require('winston');

module.exports = {

    getAccessList: function (req) {

        //req is a http request object.

        try {
            var accessList = {};

            if (!req || !req.session)
                return accessList;
            if (req.session.userId) {
                accessList.userId = req.session.userId;
            }

            if (req.session.roles) {
                accessList.roles = req.session.roles;
            }

            return accessList;

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            return null;
        }
    },

    checkWriteAclAndUpdateVersion: function (appId, documents, accessList, isMasterKey) {
        var deferred = q.defer();

        try {
            var promises = [];
            for (var i = 0; i < documents.length; i++)
                promises.push(this.verifyWriteACLAndUpdateVersion(appId, documents[i]._tableName, documents[i], accessList, isMasterKey));
            q.all(promises).then(function (docs) {
                deferred.resolve(docs);
            }, function (err) {
                deferred.reject(err);
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

    checkWriteAcl: function (appId, document, accessList, isMasterKey) {

        try {
            if (isMasterKey) {
                return true;
            }

            var acl = document.ACL;
            if (acl.write.allow.user.indexOf("all") > -1) {
                return true;
            } else {
                if (Object.keys(accessList).length === 0) {
                    if (acl.write.allow.user.indexOf("all") > -1) {
                        return true;
                    } else
                        return false;
                } else {
                    if (accessList.userId && acl.write.allow.user.indexOf(accessList.userId) > -1) {
                        return true;
                    } else if (accessList.userId && acl.write.deny.user.indexOf(accessList.userId) > -1)
                        return false;
                    else {
                        for (var i = 0; i < accessList.roles.length; i++) {
                            if (acl.write.allow.role.indexOf(accessList.roles[i]) > -1) {
                                return true;
                            }
                        }
                        return false;
                    }
                }
            }
        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }
    },

    verifyWriteACLAndUpdateVersion: function (appId, collectionName, document, accessList, isMasterKey) {
        var deferred = q.defer();

        try {
            mongoService.document.get(appId, collectionName, document._id, accessList, isMasterKey).then(function (doc) {
                if (doc) {
                    if (document._version > 0) {
                        if (document._version >= doc._version) {
                            document._version = document._version + 1;
                        } else {
                            document._version = doc._version + 1;
                        }
                    } else {
                        document._version = doc._version + 1;
                    }
                    var acl = doc.ACL;
                    var status = false; //eslint-disable-line no-unused-vars

                    if (isMasterKey) {
                        status = true;
                    } else {
                        if (acl.write.allow.user.indexOf("all") > -1) {
                            status = true;
                        } else {
                            if (Object.keys(accessList).length === 0) {
                                if (acl.write.allow.user.indexOf("all") > -1) {
                                    status = true;
                                } else
                                    deferred.reject(false);
                            } else {
                                if (accessList.userId && acl.write.allow.user.indexOf(accessList.userId) > -1) {
                                    status = true;
                                } else if (accessList.userId && acl.write.deny.user.indexOf(accessList.userId) > -1)
                                    deferred.reject(false);
                                else {
                                    for (var i = 0; i < accessList.roles.length; i++) {
                                        if (acl.write.allow.role.indexOf(accessList.roles[i]) > -1) {
                                            status = true;
                                        }
                                    }
                                    deferred.reject(false);
                                }
                            }
                        }
                    }


                    var storedKeys = Object.keys(doc);
                    var documentKeys = Object.keys(document);
                    for (let i = 0; i < storedKeys.length; i++) {
                        if (documentKeys.indexOf(storedKeys[i]) === -1) {
                            document[storedKeys[i]] = doc[storedKeys[i]];
                        }
                    }
                    var obj = {};
                    obj.newDoc = document;
                    obj.oldDoc = doc;
                    deferred.resolve(obj);
                } else {
                    document._version = 0;
                    let obj = {};
                    obj.newDoc = document;
                    obj.oldDoc = null;
                    deferred.resolve(obj);
                }
            }, function () {
                document._version = 0;
                deferred.reject(false);
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