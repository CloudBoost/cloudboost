/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const uuid = require('node-uuid');

const winston = require('winston');
const config = require('../config/config');
const util = require('../helpers/util');

async function _saveSettings(params) {
  const deferred = q.defer();

  try {
    const doc = params.doc || {};
    const { collection } = params;
    doc.secureKey = doc.secureKey || uuid.v4(); // generate a new key.
    doc.clusterKey = doc.clusterKey || uuid.v4();
    doc.myURL = doc.myURL || (config.hostUrl || 'http://localhost:4730');
    const _docs = await collection.save(doc);
    deferred.resolve(_docs);
  } catch (error) {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    deferred.reject(error);
  }

  return deferred.promise;
}

// This file manages encryption keys, Host URL, etc etc.
module.exports = {

  async getSettingsVariables(dbc) {
    const deferred = q.defer();
    const collection = dbc.db(config.globalDb).collection(config.globalSettings);
    try {
      const docs = await collection.find({}).toArray();
      if (docs.length) {
        deferred.resolve(docs[0]);
      } else {
        throw 'No configuration found.';
      }
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      deferred.reject(error);
    }

    return deferred.promise;
  },

  async initSettingsVariable(dbc) {
    const deferred = q.defer();

    try {
      const collection = dbc.db(config.globalDb).collection(config.globalSettings);
      const docs = await collection.find({}).toArray();
      if (docs.length) {
        const [doc] = docs;
        if (doc.secureKey && doc.clusterKey && doc.myURL) {
          deferred.resolve(doc);
        } else {
        // Update the found configuration.
          await _saveSettings({ collection, doc });
          const newDoc = await this.getSettingsVariables(dbc);
          deferred.resolve(newDoc);
        }
      } else {
        // Update the found configuration.
        await _saveSettings({ collection });
        const newDoc = await this.getSettingsVariables(dbc);
        deferred.resolve(newDoc);
      }
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      deferred.reject(error);
    }

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

  async changeUrl(url) {
    const deferred = q.defer();

    try {
      const isValidUrl = util.isUrlValid(url);
      if (isValidUrl) {
        const collection = config.mongoClient.db(config.globalDb).collection(config.globalSettings);
        const docs = await collection.find({}).toArray();
        if (docs.length >= 1) {
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
      } else {
        deferred.reject('Invalid URL provided');
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
