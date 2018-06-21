/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var q = require('q');
var google = require('googleapis');
var OAuth2Client = google.auth.OAuth2;
var plus = google.plus('v1');
var winston = require('winston');

module.exports = {

    getLoginUrl: function (req, appId, authSettings) {
        var deferred = q.defer();

        try {

            var clientId = authSettings.google.appId;
            var clientSecret = authSettings.google.appSecret;
            var redirect = req.protocol + '://' + req.headers.host + '/auth/' + appId + '/google/callback';

            var oauth2Client = new OAuth2Client(clientId, clientSecret, redirect);

            var url = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: _getGoogleFieldString(authSettings).concat(_getGoogleScopeString(authSettings))
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


    getToken: function (req, appId, authSettings, code) {
        var deferred = q.defer();

        try {

            var clientId = authSettings.google.appId;
            var clientSecret = authSettings.google.appSecret;
            var redirect = req.protocol + '://' + req.headers.host + '/auth/' + appId + '/google/callback';

            var oauth2Client = new OAuth2Client(clientId, clientSecret, redirect);

            oauth2Client.getToken(code, function (err, tokens) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(tokens);
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


    getUserByTokens: function (req, appId, authSettings, accessToken, refreshToken) {
        var deferred = q.defer();

        try {

            var clientId = authSettings.google.appId;
            var clientSecret = authSettings.google.appSecret;
            var redirect = req.protocol + '://' + req.headers.host + '/auth/' + appId + '/google/callback';

            var oauth2Client = new OAuth2Client(clientId, clientSecret, redirect);

            oauth2Client.setCredentials({
                access_token: accessToken,
                refresh_token: refreshToken
            });

            plus.people.get({
                userId: 'me',
                auth: oauth2Client
            }, function (err, profile) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(profile);
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
};


function _getGoogleFieldString(authSettings) {
    var json = authSettings.google.attributes;

    var scopeString = '';
    var isFirst = false;

    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key].enabled) {
            var scope;
            if (!isFirst) {
                scope = json[key].scope;
                isFirst = true;
            } else {
                scope = " " + json[key].scope;
            }
            scopeString = scopeString.concat(scope);
        }
    }

    return scopeString;
}

function _getGoogleScopeString(authSettings) {
    var json = authSettings.google.permissions;

    var scopeString = '';
    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key].enabled) {
            scopeString = scopeString.concat(" " + json[key].scope);
        }
    }

    return scopeString;
}