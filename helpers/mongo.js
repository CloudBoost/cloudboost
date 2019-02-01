/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const { Db } = require('mongodb');
const q = require('q');
const winston = require('winston');
const config = require('../config/config');
// Private Functions
function _dropIndex(appId, collectionName, indexString) {
  const deferred = q.defer();

  try {
    if (indexString && indexString !== '') {
      const collection = config.mongoClient.db(appId).collection(collectionName);
      collection.dropIndex(indexString, (err, result) => {
        if (err && err.message && err.message !== 'ns not found') {
          winston.log('error', err);


          deferred.reject(err);
        } else {
          deferred.resolve(result);
        }
      });
    } else {
      deferred.resolve('Nothing to drop');
    }
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }
  return deferred.promise;
}

function _unsetColumn(appId, collectionName, query) {
  const deferred = q.defer();

  try {
    if (query && Object.keys(query).length > 0) {
      const collection = config.mongoClient.db(appId).collection(collectionName);
      collection.update({}, {
        $unset: query,
      }, {
        multi: true,
      }, (err, result) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(result);
        }
      });
    } else {
      deferred.resolve('Nothing to unset');
    }
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }
  return deferred.promise;
}

const mongoService = {};

mongoService.app = {

  drop(appId) {
    // This is app delete function,
    // it deletes the app database
    const deferred = q.defer();

    try {
      const _self = mongoService;

      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      _self.database.dropDatabase(appId).then(() => {
        deferred.resolve();
      }, (err) => {
        deferred.resolve(err);
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

  create(appId) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Error : Storage is not connected.');
        return deferred.promise;
      }

      // eslint-disable-next-line global-require
      const replSet = require('../database-connect/mongoConnect.js').replSet();

      const db = new Db(appId, replSet, { w: 1 });

      if (db) {
        deferred.resolve(db);
      } else {
        winston.log('Error : Creating an app in the Storage Backend ');
        deferred.reject('Error : Creating an app in the Storage Backend ');
      }
    } catch (e) {
      winston.log('error', {
        error: String(e),
        stack: new Error().stack,
      });
      deferred.reject(e);
    }

    return deferred.promise;
  },
};

mongoService.document = {

  getSearchableDocuments(appId, collectionName) {
    const _self = mongoService;
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected || !global.database) {
        throw 'Database Not Connected';
      }

      const collection = config.mongoClient.db(appId).collection(_self.collection.getId(appId, collectionName));
      const findQuery = collection.find();

      findQuery.toArray((err, docs) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(docs);
        }
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

// Database related processings

mongoService.database = {

  dropDatabase(appId) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      const database = config.mongoClient.db(appId);

      database.dropDatabase((err) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
        }
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

// Collection related processings:
mongoService.collection = {

  addColumn(appId, collectionName, column) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        throw 'Database Not Connected';
      }

      if (column.dataType === 'GeoPoint' || column.dataType === 'Text') {
        mongoService.collection.createIndex(appId, collectionName, column.name, column.dataType)
          .then(() => {
            deferred.resolve('Index Created');
          }, (err) => {
            winston.log('error', err);
            deferred.reject('Unable to create Index in Mongo');
          });
      } else {
        deferred.resolve();
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

  create(appId, collectionName, schema) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      const promises = [];
      for (let i = 0; i < schema.length; i++) {
        if (schema[i].dataType === 'GeoPoint') {
          promises.push(mongoService.collection.createIndex(appId, collectionName, schema[i].name, schema[i].dataType));
        }
      }
      if (promises.length > 0) {
        q.all(promises).then(() => {
          deferred.resolve('Index Created');
        }, (err) => {
          winston.log('error', err);
          deferred.reject('Unable to create Index in Mongo');
        });
      } else {
        deferred.resolve('Created Table in Mongo');
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

  createIndex(appId, collectionName, columnName, columnType) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }
      /**
                Creating a wild card index , instaed of creating individual $text index on each column seperately
            * */
      const obj = {};

      if (columnType === 'Text') {
        obj['$**'] = 'text';
      }
      if (columnType === 'GeoPoint') {
        obj[columnName] = '2dsphere';
      }

      if (Object.keys(obj).length > 0) {
        const collection = config.mongoClient.db(appId).collection(mongoService.collection.getId(appId, collectionName));
        collection.createIndex(obj, (err, res) => {
          if (err) {
            deferred.reject(err);
          } else {
            deferred.resolve(res);
          }
        });
      } else {
        deferred.resolve('NO index');
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

  deleteAndCreateTextIndexes(appId, collectionName) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }
      /**
                Creating a wild card index , instaed of creating individual $text index on each column seperately
            * */
      const collection = config.mongoClient.db(appId).collection(mongoService.collection.getId(appId, collectionName));
      collection.createIndex({
        '$**': 'text',
      }, (err, res) => {
        if (err) {
          winston.log('error', err);

          deferred.reject(err);
        } else {
          deferred.resolve(res);
        }
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

  getIndexes(appId, collectionName) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      const collection = config.mongoClient.db(appId).collection(mongoService.collection.getId(appId, collectionName));
      collection.indexInformation((err, res) => {
        if (err) {
          deferred.resolve(null);
        } else {
          deferred.resolve(res);
        }
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
  renameColumn(appId, collectionName, oldColumnName, newColumnName) {
    const deferred = q.defer();

    try {
      const _self = mongoService;

      const collection = config.mongoClient.db(appId).collection(_self.collection.getId(appId, collectionName));

      const query = {};

      query[oldColumnName] = newColumnName;

      collection.update({}, {
        $rename: query,
      }, {
        multi: true,
      }, (err, result) => {
        if (err) {
          winston.log('error', err);


          deferred.reject(err);
        } else {
          deferred.resolve(result);
        }
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

  dropColumn(appId, collectionName, columnName, columnType) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      const query = {};

      query[columnName] = 1;

      let indexName = null;
      if (columnType === 'GeoPoint') {
        indexName = `${columnName}_2dsphere`;
      }

      const promises = [];
      promises.push(_dropIndex(appId, collectionName, indexName));
      promises.push(_unsetColumn(appId, collectionName, query));

      // Promise List
      if (promises && promises.length > 0) {
        q.allSettled(promises).then((resultList) => {
          const resFulfilled = [];
          const resRejected = [];
          resultList.forEach((eachResult) => {
            if (eachResult.state === 'fulfilled') {
              resFulfilled.push(eachResult.value);
            } else {
              resRejected.push(eachResult.reason);
            }
          });

          // Check atleast one is fulfilled
          if (resFulfilled && resFulfilled.length > 0) {
            deferred.resolve();
          } else {
            deferred.reject('Unable to drop column and index');
          }
        });
      } else {
        deferred.reslove();
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  dropCollection(appId, collectionName) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        throw 'Database Not Connected';
      }
      const _self = mongoService;

      const collection = config.mongoClient.db(appId).collection(_self.collection.getId(appId, collectionName));

      collection.drop((err, reply) => {
        if (err) {
          if (err.message === 'ns not found') {
            deferred.resolve();
          } else {
            winston.log('error', err);

            deferred.reject(err);
          }
        } else {
          deferred.resolve(reply);
        }
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

  renameCollection(appId, oldCollectionName, newCollectionName) {
    const deferred = q.defer();

    try {
      const _self = mongoService;

      const collection = config.mongoClient.db(appId).collection(_self.collection.getId(appId, oldCollectionName));

      collection.rename(_self.collection.getId(appId, newCollectionName), (err, _collection) => {
        if (err) {
          if (err.message === 'source namespace does not exist') {
            // if oldCollectionName is not found.
            deferred.resolve();
          } else {
            winston.log('error', err);
            deferred.reject(err);
          }
        } else {
          deferred.resolve(_collection);
        }
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

  getId(appId, collectionName) { // for a given appId and collectionName it gives a unique collection name
    try {
      return collectionName;
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      return err;
    }
  },

  list(appId) {
    const deferred = q.defer();

    try {
      const collection = config.mongoClient.db(appId).collection('_Schema');
      const findQuery = collection.find({});
      findQuery.toArray((err, res) => {
        if (err) {
          winston.log('error', err);
          deferred.reject(err);
        } else {
          deferred.resolve(res);
        }
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

module.exports = mongoService;
