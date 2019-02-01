/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/


const Q = require('q');
const request = require('request');

const winston = require('winston');
const appConfig = require('../config/config');

function _registerServerAnalytics(secureKey) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = secureKey;
    postData = JSON.stringify(postData);

    const url = `${appConfig.analyticsUrl}/server/register`;
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

function _mongoDbStatus() {
  const deferred = Q.defer();
  try {
    const responseJson = {};
    responseJson.serviceName = 'mongodb';
    responseJson.success = null;
    responseJson.error = null;
    appConfig.mongoClient.db(appConfig.globalDb).command({
      serverStatus: 1,
    }, (err, status) => {
      if (err) {
        responseJson.error = 'Unable to know CBEngine Mongodb status';
        deferred.reject(responseJson);
      }
      if (status && status.ok === 1) {
        responseJson.success = 'CBEngine Mongodb status is okay';
        deferred.resolve(responseJson);
      } else {
        responseJson.error = 'CBEngine Mongodb status is failed';
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

function _redisDbStatus() {
  const deferred = Q.defer();

  try {
    const responseJson = {};
    responseJson.serviceName = 'redisdb';
    responseJson.success = null;
    responseJson.error = null;

    // Simple ping/pong with callback
    appConfig.redisClient.call('PING', (error, result) => {
      if (error) {
        responseJson.error = 'Unable to know CBEngine Redisdb status';
        deferred.reject(responseJson);
      }

      if (result === 'PONG') {
        responseJson.success = 'CBEngine Redisdb PING is successfull';
        deferred.resolve(responseJson);
      } else {
        responseJson.error = 'CBEngine Redisdb PING is failed';
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

module.exports = {
  registerServer(secureKey) {
    const deferred = Q.defer();
    try {
      _registerServerAnalytics(secureKey).then((result) => {
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

      Q.all(promises).then((resultList) => {
        if (resultList && resultList[0] && resultList[1]) {
          deferred.resolve('All are running..');
        }
      }, (error) => {
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
