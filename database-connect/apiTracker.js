/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const request = require('request');

const obj = {};
const winston = require('winston');
const config = require('../config/config');

const appLogger = message => () => winston.info(message);

const appReleased = appLogger('App Released');
const appBlocked = appLogger('App Blocked');
const appReleasedError = appLogger('Error Releasing App');
const appBlockedError = appLogger('Error Blocking App');

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

obj.log = (appId, actionName, url, sdk, checkReleaseRequest) => {
  try {
    let URL;
    if (checkReleaseRequest) {
      URL = `${config.analyticsUrl}/app/isReleased`;
    } else {
      URL = `${config.analyticsUrl}/api/store`;
    }
    const postData = JSON.stringify({
      host: config.secureKey,
      appId,
      category: actionName.split('/')[0] || null,
      subCategory: actionName.split('/')[1] || null,
      sdk: sdk || 'REST',
    });

    request.post({
      URL,
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,
    }, (err, response, body) => {
      if (!err) {
        try {
          const data = body && typeof body === 'string' && IsJsonString(body) ? JSON.parse(body) : body;

          if (data && data.limitExceeded) {
            obj.blockApp(appId).then(appBlocked, appBlockedError);
          } else {
            obj.releaseApp(appId).then(appReleased, appReleasedError);
          }
        } catch (e) {
          winston.log('error', {
            error: String(e),
            stack: new Error().stack,
          });
          obj.releaseApp(appId).then(appReleased, appReleasedError);
        }
      }
    });
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
  }
};


// Description : Checks weather the current app is in the Plan Limit.
// Params : appId - ID of the App.
// Returns : Promise - True for yes, It is in the plan limit. False if it exceeded.
obj.isInPlanLimit = (appId) => {
  const deferred = q.defer();

  try {
    config.redisClient.hget('_CB_API_PLAN', appId, (err, res) => {
      if (err) deferred.reject(err);
      else if (res === null || res === 'undefined') {
        deferred.resolve(true);
      } else if (res === 'true') {
        deferred.resolve(true);
      } else {
        deferred.resolve(false);
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
};

// Description : Blocks the app
// Params : appId - ID of the App.
// Returns : Promise (void)
obj.blockApp = (appId) => {
  const deferred = q.defer();

  try {
    config.redisClient.hset('_CB_API_PLAN', appId, false, (err) => {
      if (err) deferred.reject(err);
      deferred.resolve();
    });
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }

  return deferred.promise;
};

// Description : Releases the App.
// Params : appId - ID of the App.
// Returns : Promise (void)
obj.releaseApp = (appId) => {
  const deferred = q.defer();
  try {
    config.redisClient.hset('_CB_API_PLAN', appId, true, (err) => {
      if (err) deferred.reject(err);
      deferred.resolve();
    });
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }
  return deferred.promise;
};


module.exports = obj;
