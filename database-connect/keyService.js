/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const uuid = require('node-uuid');

const winston = require('winston');
const config = require('../config/config');

// This file manages encryption keys, Host URL, etc etc.
module.exports = {

  getSettingsVariables() {
    const deferred = q.defer();
    const collection = config.mongoClient.db(config.globalDb).collection(config.globalSettings);

    collection.find({}).toArray((err, docs) => {
      if (err) {
        return deferred.reject(err);
      }

      if (docs.length) {
        return deferred.resolve(docs[0]);
      }
      return deferred.reject('No configuration found.');
    });

    return deferred.promise;
  },

  initSettingsVariable() {
    const deferred = q.defer();
    const collection = config.mongoClient.db(config.globalDb).collection(config.globalSettings);
    const self = this;

    function cbFn(err) {
      if (err) {
        return deferred.reject(err);
      }

      // since it just saved new configuration recall this function to get the saved settings.
      return self.getSettingsVariables().then(deferred.resolve, deferred.reject);
    }


    collection.find({}).toArray((err, docs) => {
      if (err) {
        return deferred.reject(err);
      }

      if (docs.length) {
        const firstDoc = docs[0];
        if (firstDoc.secureKey && firstDoc.clusterKey && firstDoc.myURL) {
          // Return the firstDoc since all required keys are present.
          return deferred.resolve(firstDoc);
        }
        // Update the found configuration.
        return _saveSettings({ collection, doc: firstDoc }, cbFn);
      }
      return _saveSettings({ collection }, cbFn);
    });

    return deferred.promise;
  },

  getMyUrl() {
    const deferred = q.defer();

    try {
      if (config.myURL) {
        deferred.resolve(config.myURL);
      } else {
        // get it from mongodb, If does not exist, create a new random key and return;

        const collection = config.mongoClient.db(config.globalDb).collection(config.globalSettings);

        collection.find({ clusterKey: config.clusterKey }).toArray((err, docs) => {
          if (err) {
            deferred.reject(err);
          } else if (docs.length >= 1) {
            if (docs[0].myURL) {
              config.myURL = docs[0].myURL;
              deferred.resolve(config.myURL);
            } else {
              _saveSettings({ collection, doc: docs[0] }, () => {
                deferred.resolve(config.hostUrl);
              });
            }
          } else {
            deferred.resolve(config.hostUrl);
          }
        });
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

  changeUrl(url) {
    const deferred = q.defer();

    try {
      const collection = config.mongoClient.db(config.globalDb).collection(config.globalSettings);

      collection.find({}).toArray((err, docs) => {
        if (err) {
          deferred.reject(err);
        } else if (docs.length >= 1) {
          docs[0].myURL = url;

          collection.save(docs[0], (err) => {
            if (err) {
              deferred.reject('Error, cannot change the cluster URL.');
            } else {
              config.myURL = url;
              deferred.resolve(url);
            }
          });
        } else {
          deferred.reject('Global record not found. Restart the cluster.');
        }
      });
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

function _saveSettings(params, callback) {
  const doc = params.doc || {};
  const collection = params.collection;
  doc.secureKey = doc.secureKey || uuid.v4(); // generate a new key.
  doc.clusterKey = doc.clusterKey || uuid.v4();
  doc.myURL = doc.myURL || (config.hostUrl || 'http://localhost:4730');
  collection.save(doc, callback);
}
