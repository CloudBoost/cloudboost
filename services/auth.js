
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
var q = require('q');
var customService = require('../services/cloudObjects');
var winston = require('winston');

var authService = {

	/*Desc   : Upsert user with provider
	  Params : appId, accessList, provider, providerUserId, providerAccessToken, providerAccessSecret
	  Returns: Promise
			   Resolve->user object
			   Reject->Error on findOne()  or save()
	*/
	upsertUserWithProvider: function(appId, accessList, provider, providerUserId, providerAccessToken, providerAccessSecret){

		var deferred = q.defer();

		try{

			var isMasterKey=true;
			var collectionName = "User";
			var select = {};
			var sort = {};
			var skip = 0;

			var query = {};
			query.$include = [];
			query.$includeList = [];
			query["socialAuth"] = {
				$elemMatch: {
					provider:provider,
					id:providerUserId
				}
			};

			customService.findOne(appId, collectionName, query, select, sort, skip, accessList, isMasterKey).then(function(document){

				if(document){
					for(var i=0;i<document.socialAuth.length;++i){
						if(document.socialAuth[i].provider===provider && document.socialAuth[i].id===providerUserId){
							document.socialAuth[i].accessToken=providerAccessToken;
						}
					}
					document._modifiedColumns=["socialAuth"];
				}else{
					document={};
					document._version=0;

					document.ACL={};
					document.ACL['read'] = {"allow":{"user":['all'],"role":[]},"deny":{"user":[],"role":[]}}; //by default allow read access to "all"
					document.ACL['write'] = {"allow":{"user":['all'],"role":[]},"deny":{"user":[],"role":[]}}; //by default allow write access to "all"
					document.ACL.parent = null;

					document.createdAt= new Date();
					document.updatedAt= new Date();
					document.expires= null;

					document.verified=true;
					document.socialAuth=[{
						provider:provider,
						id:providerUserId,
						accessToken:providerAccessToken,
						accessSecret:providerAccessSecret
					}];

					document._modifiedColumns=["createdAt","updatedAt","ACL","expires","verified","socialAuth"];
				}

				document._isModified=true;
				document._tableName=collectionName;
				document._type="user";

				return customService.save(appId, collectionName, document, accessList, isMasterKey);

			}).then(function(result){
				deferred.resolve(result);
			},function(error){
				deferred.reject(error);
			});

		} catch(err){
			winston.log('error',{"error":String(err),"stack": new Error().stack});
			deferred.reject(err);
		}

		return deferred.promise;
	}
};

module.exports = authService;