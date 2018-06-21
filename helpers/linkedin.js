/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require('q');
var winston = require('winston');

module.exports = {

	getLoginUrl: function (req, appId, authSettings) {
		var deferred = q.defer();

		try {

			var clienId = authSettings.linkedIn.appId;
			var clientSecret = authSettings.linkedIn.appSecret;

			var Linkedin = require('node-linkedin')(clienId, clientSecret);

			Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/auth/' + appId + '/linkedin/callback');
			var scope = _getLinkedinScopeString(authSettings);
			var url = Linkedin.auth.authorize(scope);

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

	getAccessToken: function (req, appId, authSettings, res, code, state) {
		var deferred = q.defer();

		try {

			var clienId = authSettings.linkedIn.appId;
			var clientSecret = authSettings.linkedIn.appSecret;

			var Linkedin = require('node-linkedin')(clienId, clientSecret);
			Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/auth/' + appId + '/linkedin/callback');

			Linkedin.auth.getAccessToken(res, code, state, function (err, results) {
				if (err) {
					deferred.reject(err);
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

			var clienId = authSettings.linkedIn.appId;
			var clientSecret = authSettings.linkedIn.appSecret;

			var Linkedin = require('node-linkedin')(clienId, clientSecret);
			//Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/auth/'+appId+'/linkedin/callback');

			var linkedin = Linkedin.init(accessToken);

			linkedin.people.me(function (err, $in) {
				deferred.resolve($in);
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


function _getLinkedinScopeString(authSettings) {
	var json = authSettings.linkedIn.permissions;

	var scopeArray = [];
	for (var key in json) {
		if (json.hasOwnProperty(key) && json[key]) {
			scopeArray.push(key.toString());
		}
	}

	return scopeArray;
}