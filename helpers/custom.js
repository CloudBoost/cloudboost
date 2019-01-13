/* eslint no-param-reassign: 0 */
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const winston = require('winston');
const mongoService = require('../databases/mongo');

module.exports = {

  getAccessList(req) {
    // req is a http request object.

    try {
      const accessList = {};

      if (!req || !req.session) return accessList;
      if (req.session.userId) {
        accessList.userId = req.session.userId;
      }

      if (req.session.roles) {
        accessList.roles = req.session.roles;
      }

      return accessList;
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      return null;
    }
  },

  checkWriteAclAndUpdateVersion(appId, documents, accessList, isMasterKey) {
    const deferred = q.defer();

    try {
      const promises = [];
      for (let i = 0; i < documents.length; i++) {
        promises.push(
          this.verifyWriteACLAndUpdateVersion(
            appId, documents[i]._tableName, documents[i], accessList, isMasterKey,
          ),
        );
      }
      q.all(promises).then((docs) => {
        deferred.resolve(docs);
      }, (err) => {
        deferred.reject(err);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject('Unauthorized to modify');
    }
    return deferred.promise;
  },

  checkWriteAcl(appId, document, accessList, isMasterKey) {
    try {
      if (isMasterKey) {
        return true;
      }

      const acl = document.ACL;
      if (acl.write.allow.user.indexOf('all') > -1) {
        return true;
      } if (Object.keys(accessList).length === 0) {
        if (acl.write.allow.user.indexOf('all') > -1) {
          return true;
        } return false;
      }
      if (accessList.userId && acl.write.allow.user.indexOf(accessList.userId) > -1) {
        return true;
      } if (accessList.userId && acl.write.deny.user.indexOf(accessList.userId) > -1) return false;

      for (let i = 0; i < accessList.roles.length; i++) {
        if (acl.write.allow.role.indexOf(accessList.roles[i]) > -1) {
          return true;
        }
      }
      return false;
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      return err;
    }
  },

  async verifyWriteACLAndUpdateVersion(appId, collectionName, document, accessList, isMasterKey) {
    const deferred = q.defer();

    try {
      mongoService.document.get(appId, collectionName, document._id, accessList, isMasterKey).then((doc) => {
        if (doc) {
          if (document._version > 0) {
            if (document._version >= doc._version) {
              document._version += 1;
            } else {
              document._version = doc._version + 1;
            }
          } else {
            document._version = doc._version + 1;
          }
          const acl = doc.ACL;
          let status = false; // eslint-disable-line no-unused-vars

          if (isMasterKey) {
            status = true;
          } else if (acl.write.allow.user.indexOf('all') > -1) {
            status = true;
          } else if (Object.keys(accessList).length === 0) {
            if (acl.write.allow.user.indexOf('all') > -1) {
              status = true;
            } else deferred.reject(false);
          } else if (accessList.userId && acl.write.allow.user.indexOf(accessList.userId) > -1) {
            status = true;
          } else if (accessList.userId && acl.write.deny.user.indexOf(accessList.userId) > -1) deferred.reject(false);
          else {
            for (let i = 0; i < accessList.roles.length; i++) {
              if (acl.write.allow.role.indexOf(accessList.roles[i]) > -1) {
                status = true;
              }
            }
            deferred.reject(false);
          }


          const storedKeys = Object.keys(doc);
          const documentKeys = Object.keys(document);
          for (let i = 0; i < storedKeys.length; i++) {
            if (documentKeys.indexOf(storedKeys[i]) === -1) {
              document[storedKeys[i]] = doc[storedKeys[i]];
            }
          }
          const obj = {};
          obj.newDoc = document;
          obj.oldDoc = doc;
          deferred.resolve(obj);
        } else {
          document._version = 0;
          const obj = {};
          obj.newDoc = document;
          obj.oldDoc = null;
          deferred.resolve(obj);
        }
      }, () => {
        document._version = 0;
        deferred.reject(false);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

};
