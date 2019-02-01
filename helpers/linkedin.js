/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const winston = require('winston');

function _getLinkedinScopeString(authSettings) {
  const json = authSettings.linkedIn.permissions;

  const scopeArray = Object.keys(json)
    .filter(key => Object.prototype.hasOwnProperty.call(json, key) && json[key])
    .map(key => key.toString());

  return scopeArray;
}

module.exports = {

  getLoginUrl(req, appId, authSettings) {
    const deferred = q.defer();

    try {
      const clienId = authSettings.linkedIn.appId;
      const clientSecret = authSettings.linkedIn.appSecret;

      const Linkedin = require('node-linkedin')(clienId, clientSecret); // eslint-disable-line

      Linkedin.setCallback(`${req.protocol}://${req.headers.host}/auth/${appId}/linkedin/callback`);
      const scope = _getLinkedinScopeString(authSettings);
      const url = Linkedin.auth.authorize(scope);

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

  getAccessToken(req, appId, authSettings, res, code, state) {
    const deferred = q.defer();

    try {
      const clienId = authSettings.linkedIn.appId;
      const clientSecret = authSettings.linkedIn.appSecret;

      const Linkedin = require('node-linkedin')(clienId, clientSecret); // eslint-disable-line
      Linkedin.setCallback(`${req.protocol}://${req.headers.host}/auth/${appId}/linkedin/callback`);

      Linkedin.auth.getAccessToken(res, code, state, (err, results) => {
        if (err) {
          deferred.reject(err);
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
      const clienId = authSettings.linkedIn.appId;
      const clientSecret = authSettings.linkedIn.appSecret;

      const Linkedin = require('node-linkedin')(clienId, clientSecret); // eslint-disable-line
      // Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/auth/'+appId+'/linkedin/callback');

      const linkedin = Linkedin.init(accessToken);

      linkedin.people.me((err, $in) => {
        deferred.resolve($in);
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
