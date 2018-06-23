/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
var q = require('q');
var FB = require('fb');
var winston = require('winston');

module.exports = {

    getLoginUrl: function (req, appId, authSettings) {
        var deferred = q.defer();

        try {

            var fbAppId = authSettings.facebook.appId;
            var fbAppSecret = authSettings.facebook.appSecret;

            FB.options({
                appId: fbAppId,
                appSecret: fbAppSecret,
                redirectUri: req.protocol + '://' + req.headers.host + "/auth/" + appId + "/facebook/callback"
            });

            var url = FB.getLoginUrl({
                scope: _getFbScopeString(authSettings)
            });

            deferred.resolve({
                loginUrl: url
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

    getAccessToken: function (req, appId, authSettings, code) {
        var deferred = q.defer();

        try {
            var fbAppId = authSettings.facebook.appId;
            var fbAppSecret = authSettings.facebook.appSecret;

            FB.options({
                appId: fbAppId,
                appSecret: fbAppSecret,
                redirectUri: req.protocol + '://' + req.headers.host + "/auth/" + appId + "/facebook/callback"
            });

            FB.api('oauth/access_token', {
                client_id: FB.options('appId'),
                client_secret: FB.options('appSecret'),
                redirect_uri: FB.options('redirectUri'),
                code: code
            }, function (results) {
                if (!results || results.error) {
                    deferred.reject(results.error);
                } else {
                    deferred.resolve(results.access_token);
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

    getUserByAccessToken: function (req, appId, authSettings, accessToken) {
        var deferred = q.defer();

        try {

            var fbAppId = authSettings.facebook.appId;
            var fbAppSecret = authSettings.facebook.appSecret;

            FB.options({
                appId: fbAppId,
                appSecret: fbAppSecret,
                redirectUri: req.protocol + '://' + req.headers.host + "/auth/" + appId + "/facebook/callback"
            });

            FB.setAccessToken(accessToken);
            FB.api('me', {
                fields: _getFbFieldString(authSettings),
                access_token: accessToken
            }, function (fbRes) {
                deferred.resolve(fbRes);
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
};


function _getFbScopeString(authSettings) {
    var json = authSettings.facebook.permissions;

    var scopeArray = [];
    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key].enabled) {
            scopeArray.push(json[key].scope);
        }
    }

    return scopeArray.toString();
}

function _getFbFieldString(authSettings) {
    var json = authSettings.facebook.attributes;

    var fieldArray = [];
    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key]) {
            fieldArray.push(key.toString());
        }
    }

    return fieldArray;
}