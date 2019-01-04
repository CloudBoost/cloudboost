
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const oauth = require('oauth').OAuth2;
const github = require('octonode');
const winston = require('winston');

module.exports = {

  getLoginUrl(req, appId, authSettings) {
    const deferred = q.defer();

    try {
      const githhubClientId = authSettings.github.appId;
      const githubClientSecret = authSettings.github.appSecret;

      const OAuth2 = new oauth(githhubClientId, githubClientSecret, 'https://github.com/', 'login/oauth/authorize', 'login/oauth/access_token');

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

      const OAuth2 = new oauth(githhubClientId, githubClientSecret, 'https://github.com/', 'login/oauth/authorize', 'login/oauth/access_token');

      OAuth2.getOAuthAccessToken(code, {}, (err, access_token) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(access_token);
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


function _getGithubFieldString(authSettings) {
  const json = authSettings.github.attributes;

  const scopeArray = [];
  for (const key in json) {
    if (json.hasOwnProperty(key) && json[key].enabled) {
      scopeArray.push(json[key].scope);
    }
  }

  return scopeArray;
}

function _getGithubScopeString(authSettings) {
  const json = authSettings.github.permissions;

  const scopeArray = [];
  for (const key in json) {
    if (json.hasOwnProperty(key) && json[key].enabled) {
      scopeArray.push(json[key].scope);
    }
  }

  return scopeArray;
}
