/* eslint-disable no-param-reassign
 */
const q = require('q');
const uuid = require('node-uuid');
const winston = require('winston');
const keys = require('./keys.js');

// This file manages encryption keys, Host URL, etc etc.
module.exports = {
  initSecureKey() {
    const deferred = q.defer();
    try {
      if (keys.secureKey) {
        winston.info(`Secure Key : ${keys.secureKey}`);
        deferred.resolve(keys.secureKey);
      } else {
        // get it from mongodb, If does not exist, create a new random key and return;

        const collection = keys.mongoClient.db(keys.globalDb).collection(keys.globalSettings);

        collection.find({}).toArray((err, docs) => {
          if (err) {
            winston.info('Error retrieveing Global Settings');
            winston.info(err);
            deferred.reject(err);
          } else {
            const key = uuid.v4(); // generate a new key.

            if (docs.length >= 1) {
              if (docs[0].secureKey) {
                keys.secureKey = docs[0].secureKey;
                winston.info(`Secure Key : ${keys.secureKey}`);
                deferred.resolve(keys.secureKey);
              } else {
                // save in mongodb.
                if (!docs[0]) { docs[0] = {}; }

                docs[0].secureKey = key;


                collection.save(docs[0], (err1) => {
                  if (err1) {
                    winston.info('Error while saving Global Settings');
                    winston.info(err1);
                    deferred.reject(err1);
                  } else {
                    // resolve if not an error
                    keys.secureKey = key;
                    winston.info(`Secure Key : ${keys.secureKey}`);

                    deferred.resolve(key);
                  }
                });
              }
            } else {
              // create a new document.
              const doc = {};
              doc.secureKey = key;
              keys.secureKey = key;
              collection.save(doc, (err1) => {
                if (err1) {
                  winston.info('Error while saving Global Settings');
                  winston.info(err1);
                  deferred.reject(err1);
                } else {
                  // resolve if not an error
                  winston.info(`Secure Key : ${keys.secureKey}`);
                  deferred.resolve(key);
                }
              });
            }
          }
        });
      }
    } catch (e) {
      winston.info('Error Init Encrypt Key');
      winston.info(e);
      winston.log('error', {
        error: String(e),
        stack: new Error().stack,
      });
    }
    return deferred.promise;
  },

  initClusterKey() {
    const deferred = q.defer();
    try {
      if (keys.secureKey) {
        winston.info(`Cluster Key : ${keys.clusterKey}`);
        deferred.resolve(keys.clusterKey);
      } else {
        // get it from mongodb, If does not exist, create a new random key and return;

        const collection = keys.mongoClient.db(keys.globalDb).collection(keys.globalSettings);

        collection.find({}).toArray((err, docs) => {
          if (err) {
            winston.info('Error retrieveing Global Settings');
            winston.info(err);
            deferred.reject(err);
          } else {
            const key = uuid.v4(); // generate a new key.

            if (docs.length >= 1) {
              if (docs[0].clusterKey) {
                keys.clusterKey = docs[0].clusterKey;
                winston.info(`Cluster Key : ${keys.clusterKey}`);
                deferred.resolve(keys.clusterKey);
              } else {
                // save in mongodb.
                if (!docs[0]) { docs[0] = {}; }

                docs[0].clusterKey = key;

                collection.save(docs[0], (err1) => {
                  if (err1) {
                    winston.info('Error while saving Global Settings');
                    winston.info(err1);
                    deferred.reject(err1);
                  } else {
                    // resolve if not an error
                    keys.clusterKey = key;
                    winston.info(`Cluster Key : ${keys.clusterKey}`);
                    deferred.resolve(key);
                  }
                });
              }
            } else {
              // create a new document.
              const doc = {};
              doc.clusterKey = key;
              keys.clusterKey = key;
              collection.save(doc, (err1) => {
                if (err1) {
                  winston.info('Error while saving Global Settings');
                  winston.info(err);
                  deferred.reject(err1);
                } else {
                  // resolve if not an error
                  winston.info(`Cluster Key : ${keys.clusterKey}`);
                  deferred.resolve(key);
                }
              });
            }
          }
        });
      }
    } catch (e) {
      winston.info('Error Init Cluster Key');
      winston.info(e);
      winston.log('error', {
        error: String(e),
        stack: new Error().stack,
      });
    }
    return deferred.promise;
  },

  getMyUrl() {
    const deferred = q.defer();
    try {
      if (keys.myURL) {
        deferred.resolve(keys.myURL);
      } else {
        winston.info('Retrieving Cluster URL...');
        // get it from mongodb, If does not exist, create a new random key and return;

        const collection = keys.mongoClient.db(keys.globalDb).collection(keys.globalSettings);

        collection.find({}).toArray((err, docs) => {
          if (err) {
            winston.info('Error retrieving Global Settings');
            winston.info(err);
            deferred.reject(err);
          } else if (docs.length >= 1) {
            if (docs[0].myURL) {
              winston.info(`Cluster URL : ${docs[0].myURL}`);
              keys.myURL = docs[0].myURL;
              deferred.resolve(keys.myURL);
            } else {
              deferred.reject('URL not found.');
            }
          } else {
            deferred.reject('URL not found.');
          }
        });
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

  changeUrl(url) {
    const deferred = q.defer();

    try {
      const collection = keys.mongoClient.db(keys.globalDb).collection(keys.globalSettings);

      collection.find({}).toArray((err, docs) => {
        if (err) {
          winston.info('Error retrieving Global Settings');
          winston.info(err);
          deferred.reject(err);
        } else if (docs.length >= 1) {
          winston.info('URL Record Found');
          docs[0].myURL = url;
          winston.info('Updating...');
          collection.save(docs[0], (err1) => {
            if (err1) {
              winston.info('Error Updating');
              deferred.reject('Error, cannot change the cluster URL.');
            } else {
              winston.info('Updated.');
              keys.myURL = url;
              deferred.resolve(url);
            }
          });
        } else {
          deferred.reject('Global record not found. Restart the cluster.');
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
