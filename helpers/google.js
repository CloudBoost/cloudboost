/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/


const q = require('q');
const google = require('googleapis');

const OAuth2Client = google.auth.OAuth2;
const plus = google.plus('v1');
const winston = require('winston');

module.exports = {

  getLoginUrl(req, appId, authSettings) {
    const deferred = q.defer();

    try {
      const clientId = authSettings.google.appId;
      const clientSecret = authSettings.google.appSecret;
      const redirect = `${req.protocol}://${req.headers.host}/auth/${appId}/google/callback`;

      const oauth2Client = new OAuth2Client(clientId, clientSecret, redirect);

      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: _getGoogleFieldString(authSettings).concat(_getGoogleScopeString(authSettings)),
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


  getToken(req, appId, authSettings, code) {
    const deferred = q.defer();

    try {
      const clientId = authSettings.google.appId;
      const clientSecret = authSettings.google.appSecret;
      const redirect = `${req.protocol}://${req.headers.host}/auth/${appId}/google/callback`;

      const oauth2Client = new OAuth2Client(clientId, clientSecret, redirect);

      oauth2Client.getToken(code, (err, tokens) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(tokens);
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


  getUserByTokens(req, appId, authSettings, accessToken, refreshToken) {
    const deferred = q.defer();

    try {
      const clientId = authSettings.google.appId;
      const clientSecret = authSettings.google.appSecret;
      const redirect = `${req.protocol}://${req.headers.host}/auth/${appId}/google/callback`;

      const oauth2Client = new OAuth2Client(clientId, clientSecret, redirect);

      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      plus.people.get({
        userId: 'me',
        auth: oauth2Client,
      }, (err, profile) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(profile);
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


function _getGoogleFieldString(authSettings) {
  const json = authSettings.google.attributes;

  let scopeString = '';
  let isFirst = false;

  for (const key in json) {
    if (json.hasOwnProperty(key) && json[key].enabled) {
      var scope;
      if (!isFirst) {
        scope = json[key].scope;
        isFirst = true;
      } else {
        scope = ` ${json[key].scope}`;
      }
      scopeString = scopeString.concat(scope);
    }
  }

  return scopeString;
}

function _getGoogleScopeString(authSettings) {
  const json = authSettings.google.permissions;

  let scopeString = '';
  for (const key in json) {
    if (json.hasOwnProperty(key) && json[key].enabled) {
      scopeString = scopeString.concat(` ${json[key].scope}`);
    }
  }

  return scopeString;
}
