var q = require("q");
var util = require("../helpers/util.js");
var mongoService = require('../databases/mongo');
var winston = require('winston');

module.exports = {

    save: function (appId, aclObj) {
        var deferred = q.defer();
        var promises = [];
        if(!Array.isArray(aclObj)){
            aclObj = [aclObj];
        }        
        if (aclObj.length > 0) {
            try {
                aclObj = aclObj.map(function (acl) {
                    if (!acl.document._id) {
                        acl.document._id = util.getId();
                    }
                    return acl;
                })
               return mongoService.document.save(appId, aclObj) 
            } catch (err) {
                winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
        } else {
            deferred.resolve(null);
        }
        return deferred.promise;
    },

    findACLByCloudObjectId: function (appId, cloudObjectId) {
        var deferred = q.defer();
        var promises = [];
        if (cloudObjectId) {
            var query = { cloudObjectId: cloudObjectId };
            try {
               return mongoService.document.findOne(appId, '_ACL', query, null, 9999999, 0, null, true);
            
            } catch (err) {
                winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
        } else {
            deferred.reject("cloudObjectId is missing");
        }
        return deferred.promise;
    },

    findACLById: function (appId, id) {
        var deferred = q.defer();
        var promises = [];
        if (id) {
            var query = { _id: id };
            try {
               return mongoService.document.findOne(appId, '_ACL', query, null, 9999999, 0, null, true);
                    
            } catch (err) {
                winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
        } else {
            deferred.reject("aclId is missing");
        }
        return deferred.promise;
    },

    deleteACLById: function (appId, id) {
        var deferred = q.defer();
        var promises = [];
        if (id) {
            var query = { _id: id };
            try {
               return mongoService.document.deleteById(appId, '_ACL', id);
            } catch (err) {
                winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
        } else {
            deferred.reject("aclId is missing");
        }
        return deferred.promise;
    },
    deleteACLByCloudObjectId: function (appId, cloudObjectId) {
        var deferred = q.defer();
        var promises = [];
        if (cloudObjectId) {
            var query = { cloudObjectId: cloudObjectId };
            try {
              return  mongoService.document.deleteByQuery(appId, '_ACL', query);
            } catch (err) {
                winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });
                deferred.reject(err);
            }
        } else {
            deferred.reject("cloudObjectId is missing");
        }
        return deferred.promise;
    }
}