
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const Oauth = require('oauth').OAuth2;
const github = require('octonode');
const winston = require('winston');
const { getNestedValue: gnv } = require('./util');


function _getGithubFieldString(authSettings) {
  const json = gnv(['github', 'attributes'], authSettings) || {};

  const scopeArray = Object.keys(json)
    .filter(key => Object.prototype.hasOwnProperty.call(json, key) && json[key].enabled)
    .map(key => json[key].scope);

  return scopeArray;
}

function _getGithubScopeString(authSettings) {
  const json = gnv(['github', 'permissions'], authSettings) || {};

  const scopeArray = Object.keys(json)
    .filter(key => Object.prototype.hasOwnProperty.call(json, key) && json[key].enabled)
    .map(key => json[key].scope);

  return scopeArray;
}

module.exports = {

  getLoginUrl(req, appId, authSettings) {
    const deferred = q.defer();

    try {
      const githhubClientId = authSettings.github.appId;
      const githubClientSecret = authSettings.github.appSecret;

      const OAuth2 = new Oauth(
        githhubClientId,
        githubClientSecret,
        'https://github.com/',
        'login/oauth/authorize',
        'login/oauth/access_token',
      );

      const url = OAuth2.getAuthorizeUrl({
        redirect_uri: `${req.protocol}://${req.headers.host}/auth/${appId}/github/callback`,
        scope: _getGithubFieldString(authSettings).concat(_getGithubScopeString(authSettings)),
      });

      deferred.resolve({ loginUrl: url });
    } catch (err) {
      winston.log('error', { error: String(err), stack: new Error().stack });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  getOAuthAccessToken(req, appId, authSettings, code) {
    const deferred = q.defer();

    try {
      const githhubClientId = authSettings.github.appId;
      const githubClientSecret = authSettings.github.appSecret;

      const OAuth2 = new Oauth(
        githhubClientId,
        githubClientSecret,
        'https://github.com/',
        'login/oauth/authorize',
        'login/oauth/access_token',
      );

      OAuth2.getOAuthAccessToken(code, {}, (err, accessToken) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(accessToken);
        }
      });
    } catch (err) {
      winston.log('error', { error: String(err), stack: new Error().stack });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  getUserByAccessToken(req, appId, authSettings, accessToken) {
    const deferred = q.defer();

    try {
      const client = github.client(accessToken);

      client.get('/user', {}, (err, status, body) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(body);
        }
      });
    } catch (err) {
      winston.log('error', { error: String(err), stack: new Error().stack });
      deferred.reject(err);
    }

    return deferred.promise;
  },


};
