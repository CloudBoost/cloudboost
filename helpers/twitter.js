/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require('q');
var Twitter = require("node-twitter-api");
var winston = require('winston');

module.exports = {

    getLoginUrl: function (req, appId, authSettings) {
        var deferred = q.defer();

        try {

            var consumerKey = authSettings.twitter.appId;
            var consumerSecret = authSettings.twitter.appSecret;

            var twitter = new Twitter({
                consumerKey: consumerKey,
                consumerSecret: consumerSecret,
                callback: req.protocol + '://' + req.headers.host + "/auth/" + appId + "/twitter/callback",
                x_auth_access_type: "write"
            });

            twitter.getRequestToken(function (err, requestToken, requestSecret) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var url = "https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken;
                    deferred.resolve({
                        loginUrl: url,
                        requestSecret: requestSecret
                    });
                }
            });

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            deferred.reject(err);
        }

        return deferred.promise;
    },

    getAccessToken: function (req, appId, authSettings, requestToken, twitterReqSecret, verifier) {
        var deferred = q.defer();

        try {

            var consumerKey = authSettings.twitter.appId;
            var consumerSecret = authSettings.twitter.appSecret;

            var twitter = new Twitter({
                consumerKey: consumerKey,
                consumerSecret: consumerSecret,
                callback: req.protocol + '://' + req.headers.host + "/auth/" + appId + "/twitter/callback",
                x_auth_access_type: "write"
            });

            twitter.getAccessToken(requestToken, twitterReqSecret, verifier, function (err, accessToken, accessSecret) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve({
                        accessToken: accessToken,
                        accessSecret: accessSecret
                    });
                }
            });


        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            deferred.reject(err);
        }

        return deferred.promise;
    },

    getUserByTokens: function (req, appId, authSettings, accessToken, accessSecret) {
        var deferred = q.defer();

        try {

            var consumerKey = authSettings.twitter.appId;
            var consumerSecret = authSettings.twitter.appSecret;

            var twitter = new Twitter({
                consumerKey: consumerKey,
                consumerSecret: consumerSecret,
                callback: req.protocol + '://' + req.headers.host + "/auth/" + appId + "/twitter/callback",
                x_auth_access_type: "write"
            });

            twitter.verifyCredentials(accessToken, accessSecret, function (err, user) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(user);
                }
            });


        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            deferred.reject(err);
        }

        return deferred.promise;
    }
};