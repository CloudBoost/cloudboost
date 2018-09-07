/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require('q');
var uuid = require('node-uuid');

var config = require('../config/config');
var winston = require('winston');

//This file manages encryption keys, Host URL, etc etc.
module.exports = {

	getSettingsVariables: function () {
		var deferred = q.defer();
		var collection = config.mongoClient.db(config.globalDb).collection(config.globalSettings);

		collection.find({}).toArray(function (err, docs) {
			if(err){
				return deferred.reject(err);
			}

			if(docs.length){
				return deferred.resolve(docs[0]);
			} else {
				return deferred.reject('No configuration found.');
			}
		});

		return deferred.promise;
	},

	initSettingsVariable: function () {
		var deferred = q.defer();
		var collection = config.mongoClient.db(config.globalDb).collection(config.globalSettings);
		var self = this;

		function cbFn (err){
			if(err){
				return deferred.reject(err);
			}

			//since it just saved new configuration recall this function to get the saved settings.
			return self.getSettingsVariables().then(deferred.resolve, deferred.reject);
		}


		collection.find({}).toArray(function (err, docs) {
			if(err){
				return deferred.reject(err);
			}

			if(docs.length){
				var firstDoc = docs[0];
				if(firstDoc.secureKey && firstDoc.clusterKey && firstDoc.myURL){
					//Return the firstDoc since all required keys are present.
					return deferred.resolve(firstDoc);
				} else {
					//Update the found configuration.
					return _saveSettings({ collection: collection, doc: firstDoc }, cbFn);
				}
			} else {
				return _saveSettings({ collection: collection }, cbFn);
			}
		});

		return deferred.promise;
	},

	getMyUrl: function () {

		var deferred = q.defer();

		try {
			if (config.myURL) {
				deferred.resolve(config.myURL);
			} else {

				//get it from mongodb, If does not exist, create a new random key and return;

				var collection = config.mongoClient.db(config.globalDb).collection(config.globalSettings);

				collection.find({ clusterKey: config.clusterKey }).toArray(function (err, docs) {
					if (err) {


						deferred.reject(err);
					} else {

						if (docs.length >= 1) {
							if (docs[0].myURL) {

								config.myURL = docs[0].myURL;
								deferred.resolve(config.myURL);
							} else {
								_saveSettings({collection: collection, doc: docs[0] }, function (){
									deferred.resolve(config.hostUrl);
								});
							}
						} else {
							deferred.resolve(config.hostUrl);
						}
					}
				});

			}

		} catch (e) {
			winston.log('error', {
				"error": String(e),
				"stack": new Error().stack
			});
			deferred.reject(e);
		}

		return deferred.promise;
	},

	changeUrl: function (url) {

		var deferred = q.defer();

		try {
			var collection = config.mongoClient.db(config.globalDb).collection(config.globalSettings);

			collection.find({}).toArray(function (err, docs) {
				if (err) {
					deferred.reject(err);
				} else {

					if (docs.length >= 1) {

						docs[0].myURL = url;

						collection.save(docs[0], function (err) {
							if (err) {
								deferred.reject("Error, cannot change the cluster URL.");
							} else {
								config.myURL = url;
								deferred.resolve(url);
							}
						});
					} else {
						deferred.reject("Global record not found. Restart the cluster.");
					}
				}
			});

		} catch (e) {
			winston.log('error', {
				"error": String(e),
				"stack": new Error().stack
			});
			deferred.reject(e);
		}

		return deferred.promise;

	}
};

function _saveSettings(params, callback) {
	var doc = params.doc || {};
	var collection = params.collection;
	doc.secureKey = doc.secureKey || uuid.v4(); //generate a new key.
	doc.clusterKey = doc.clusterKey || uuid.v4();
	doc.myURL = doc.myURL || (config.hostUrl || 'http://localhost:4730');
	collection.save(doc, callback);
}