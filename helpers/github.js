
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require('q');
var oauth = require("oauth").OAuth2;
var github = require('octonode');
var winston = require('winston');

module.exports = {

	getLoginUrl : function(req, appId, authSettings){
		var deferred = q.defer();

		try{

            var githhubClientId=authSettings.github.appId;
            var githubClientSecret=authSettings.github.appSecret;

            var OAuth2 = new oauth(githhubClientId, githubClientSecret, "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");

            var url= OAuth2.getAuthorizeUrl({
                redirect_uri: req.protocol + '://' + req.headers.host +'/auth/'+appId+'/github/callback',
                scope: _getGithubFieldString(authSettings).concat(_getGithubScopeString(authSettings))
            });

            deferred.resolve({loginUrl:url});


		}catch(err){
            winston.log('error',{"error":String(err),"stack": new Error().stack});
            deferred.reject(err);
        }

		return deferred.promise;
	},

    getOAuthAccessToken : function(req, appId, authSettings, code){
        var deferred = q.defer();

        try{

            var githhubClientId=authSettings.github.appId;
            var githubClientSecret=authSettings.github.appSecret;

            var OAuth2 = new oauth(githhubClientId, githubClientSecret, "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");

            OAuth2.getOAuthAccessToken(code, {}, function (err, access_token) {
                if (err) {
                  deferred.reject(err);
                }else{
                    deferred.resolve(access_token);
                }
            });

        }catch(err){
            winston.log('error',{"error":String(err),"stack": new Error().stack});
            deferred.reject(err);
        }

        return deferred.promise;
    },

    getUserByAccessToken : function(req, appId, authSettings, accessToken){

        var deferred = q.defer();

        try{

            var client = github.client(accessToken);

            client.get('/user', {}, function (err, status, body) {
                if (err) {
                  deferred.reject(err);
                }else{
                    deferred.resolve(body);
                }
            });

        }catch(err){
            winston.log('error',{"error":String(err),"stack": new Error().stack});
            deferred.reject(err);
        }

        return deferred.promise;
    }



};



function _getGithubFieldString(authSettings){
    var json=authSettings.github.attributes;

    var scopeArray=[];
    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key].enabled) {
          scopeArray.push(json[key].scope);
        }
    }

    return scopeArray;
}

function _getGithubScopeString(authSettings){
    var json=authSettings.github.permissions;

    var scopeArray=[];
    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key].enabled) {
          scopeArray.push(json[key].scope);
        }
    }

    return scopeArray;
}