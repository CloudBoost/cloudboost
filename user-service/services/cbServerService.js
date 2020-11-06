/* eslint-disable no-use-before-define
*/
const winston = require('winston');
const Q = require('q');
const request = require('request');
const _ = require('underscore');
const keys = require('../config/keys.js');
const _Settings = require('../model/_settings');

module.exports = {

  getSettings() {
    const deferred = Q.defer();

    try {
      _Settings.findOne({})
        .then((_cbServerSettings) => {
          const cbServerSettings = _.clone(_cbServerSettings);
          if (cbServerSettings) {
            if (cbServerSettings.clusterKey) {
              delete cbServerSettings._doc.clusterKey;
            }
            if (cbServerSettings.secureKey) {
              delete cbServerSettings._doc.secureKey;
            }
            deferred.resolve(cbServerSettings);
          } else {
            deferred.resolve(null);
          }
        })
        .catch(err => deferred.reject(err));
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  upsertSettings(currentUserId, id, allowSignUp) {
    const deferred = Q.defer();

    try {
      // Check User is Admin
      global.userService.getAccountById(currentUserId)
        .then((user) => {
          if (user.isAdmin) {
            _Settings.findOneAndUpdate({
              _id: id,
            }, {
              $set: {
                allowSignUp,
              },
            }, {
              upsert: true,
              new: true,
            }, (err, _cbServerSettings) => {
              const cbServerSettings = _.clone(_cbServerSettings);
              if (err) {
                deferred.reject(err);
              }
              if (cbServerSettings) {
                if (cbServerSettings.clusterKey) {
                  delete cbServerSettings._doc.clusterKey;
                }
                if (cbServerSettings.secureKey) {
                  delete cbServerSettings._doc.secureKey;
                }

                deferred.resolve(cbServerSettings);
              } else {
                deferred.resolve(null);
              }
            });
          } else {
            deferred.reject('Unauthorised');
          }
        }, (error) => {
          deferred.reject(error);
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
  async upsertAPI_URL(currentUserId, apiURL) {
    const deferred = Q.defer();

    try {
      // Check User is Admin
      const user = await global.userService.getAccountById(currentUserId);
      if (user.isAdmin) {
        const settingsFound = await _Settings.findOne({});
        if (settingsFound) {
          const savedSettings = await _Settings.findOneAndUpdate({ _id: settingsFound._id }, {
            myURL: apiURL
          }, { new: true });
          if (savedSettings.clusterKey) {
            delete savedSettings._doc.clusterKey;
          }
          if (savedSettings.secureKey) {
            delete savedSettings._doc.secureKey;
          }
          deferred.resolve(savedSettings);
        } else {
          deferred.reject('Document not found!');
        }
      } else {
        deferred.reject('Unauthorised');
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

  registerServer(secureKey) {
    const deferred = Q.defer();

    try {
      _registerServerAnalytics(secureKey).then((result) => {
        deferred.resolve(result);
      }, (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        deferred.reject(error);
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
  isHosted() {
    const deferred = Q.defer();

    try {
      _isHostedAnalytics().then((result) => {
        deferred.resolve(result);
      }, (error) => {
        deferred.reject(error);
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
  getDBStatuses() {
    const deferred = Q.defer();

    try {
      const promises = [];

      promises.push(_mongoDbStatus());
      promises.push(_redisDbStatus());
      promises.push(_cloudboostEngineStatus());

      Q.all(promises).then(() => {
        deferred.resolve('All are running..');
      }, (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        deferred.reject(error.error);
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


function _mongoDbStatus() {
  const deferred = Q.defer();

  try {
    const responseJson = {};
    responseJson.serviceName = 'mongodb';
    responseJson.success = null;
    responseJson.error = null;

    keys.mongoClient.command({
      whatsmyuri: 1,
    }, (err) => {
      if (err) {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        responseJson.error = 'Unable to know CBService Mongodb status';
        deferred.reject();
      } else {
        responseJson.success = 'CBService Mongodb status is okay';
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
}

function _redisDbStatus() {
  const deferred = Q.defer();

  try {
    const responseJson = {};
    responseJson.serviceName = 'redisdb';
    responseJson.success = null;
    responseJson.error = null;

    // Simple ping/pong with callback
    keys.redisClient.call('PING', (error, result) => {
      if (error) {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        responseJson.error = 'Unable to know CBService Redisdb status';
        deferred.reject(responseJson);
      }
      if (result === 'PONG') {
        responseJson.success = 'CBService Redisdb PING is successfull';
        deferred.resolve(responseJson);
      } else {
        responseJson.error = 'CBService Redisdb PING is failed';
        deferred.reject(responseJson);
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
}


/** *********************Pinging Analytics Services******************************** */

function _registerServerAnalytics(secureKey) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = secureKey;
    postData = JSON.stringify(postData);

    const url = `${keys.analyticsServiceUrl}/server/register`;
    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || body === 'Error') {
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject(e);
        }
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
}


function _isHostedAnalytics() {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = keys.secureKey;
    postData = JSON.stringify(postData);

    const url = `${keys.analyticsServiceUrl}/server/isHosted`;
    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || body === 'Error') {
        deferred.reject(err);
      } else {
        deferred.resolve(body);
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
}


function _cloudboostEngineStatus() {
  const deferred = Q.defer();

  try {
    const url = `${keys.dataServiceUrl}/status`;

    request.get(url, (err, response, body) => {
      if (err || response.statusCode === 500 || body === 'Error') {
        if (body) {
          deferred.reject({
            error: body,
          });
        } else {
          deferred.reject({
            error: err,
          });
        }
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject(e);
        }
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
}
