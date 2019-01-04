/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
const q = require('q');
const FB = require('fb');
const winston = require('winston');

module.exports = {

  getLoginUrl(req, appId, authSettings) {
    const deferred = q.defer();

    try {
      const fbAppId = authSettings.facebook.appId;
      const fbAppSecret = authSettings.facebook.appSecret;

      FB.options({
        appId: fbAppId,
        appSecret: fbAppSecret,
        redirectUri: `${req.protocol}://${req.headers.host}/auth/${appId}/facebook/callback`,
      });

      const url = FB.getLoginUrl({
        scope: _getFbScopeString(authSettings),
      });

      deferred.resolve({
        loginUrl: url,
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

  getAccessToken(req, appId, authSettings, code) {
    const deferred = q.defer();

    try {
      const fbAppId = authSettings.facebook.appId;
      const fbAppSecret = authSettings.facebook.appSecret;

      FB.options({
        appId: fbAppId,
        appSecret: fbAppSecret,
        redirectUri: `${req.protocol}://${req.headers.host}/auth/${appId}/facebook/callback`,
      });

      FB.api('oauth/access_token', {
        client_id: FB.options('appId'),
        client_secret: FB.options('appSecret'),
        redirect_uri: FB.options('redirectUri'),
        code,
      }, (results) => {
        if (!results || results.error) {
          deferred.reject(results.error);
        } else {
          deferred.resolve(results.access_token);
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

  getUserByAccessToken(req, appId, authSettings, accessToken) {
    const deferred = q.defer();

    try {
      const fbAppId = authSettings.facebook.appId;
      const fbAppSecret = authSettings.facebook.appSecret;

      FB.options({
        appId: fbAppId,
        appSecret: fbAppSecret,
        redirectUri: `${req.protocol}://${req.headers.host}/auth/${appId}/facebook/callback`,
      });

      FB.setAccessToken(accessToken);
      FB.api('me', {
        fields: _getFbFieldString(authSettings),
        access_token: accessToken,
      }, (fbRes) => {
        deferred.resolve(fbRes);
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


function _getFbScopeString(authSettings) {
  const json = authSettings.facebook.permissions;

  const scopeArray = [];
  for (const key in json) {
    if (json.hasOwnProperty(key) && json[key].enabled) {
      scopeArray.push(json[key].scope);
    }
  }

  return scopeArray.toString();
}

function _getFbFieldString(authSettings) {
  const json = authSettings.facebook.attributes;

  const fieldArray = [];
  for (const key in json) {
    if (json.hasOwnProperty(key) && json[key]) {
      fieldArray.push(key.toString());
    }
  }

  return fieldArray;
}
