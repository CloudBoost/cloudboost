/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const Twitter = require('node-twitter-api');
const winston = require('winston');

module.exports = {

  getLoginUrl(req, appId, authSettings) {
    const deferred = q.defer();

    try {
      const consumerKey = authSettings.twitter.appId;
      const consumerSecret = authSettings.twitter.appSecret;

      const twitter = new Twitter({
        consumerKey,
        consumerSecret,
        callback: `${req.protocol}://${req.headers.host}/auth/${appId}/twitter/callback`,
        x_auth_access_type: 'write',
      });

      twitter.getRequestToken((err, requestToken, requestSecret) => {
        if (err) {
          deferred.reject(err);
        } else {
          const url = `https://api.twitter.com/oauth/authenticate?oauth_token=${requestToken}`;
          deferred.resolve({
            loginUrl: url,
            requestSecret,
          });
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

  getAccessToken(req, appId, authSettings, requestToken, twitterReqSecret, verifier) {
    const deferred = q.defer();

    try {
      const consumerKey = authSettings.twitter.appId;
      const consumerSecret = authSettings.twitter.appSecret;

      const twitter = new Twitter({
        consumerKey,
        consumerSecret,
        callback: `${req.protocol}://${req.headers.host}/auth/${appId}/twitter/callback`,
        x_auth_access_type: 'write',
      });

      twitter.getAccessToken(requestToken, twitterReqSecret, verifier,
        (err, accessToken, accessSecret) => {
          if (err) {
            deferred.reject(err);
          } else {
            deferred.resolve({
              accessToken,
              accessSecret,
            });
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

  getUserByTokens(req, appId, authSettings, accessToken, accessSecret) {
    const deferred = q.defer();

    try {
      const consumerKey = authSettings.twitter.appId;
      const consumerSecret = authSettings.twitter.appSecret;

      const twitter = new Twitter({
        consumerKey,
        consumerSecret,
        callback: `${req.protocol}://${req.headers.host}/auth/${appId}/twitter/callback`,
        x_auth_access_type: 'write',
      });

      twitter.verifyCredentials(accessToken, accessSecret, (err, user) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(user);
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
