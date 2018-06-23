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
	initSecureKey: function () {
		try {
			var deferred = q.defer();

			if (config.secureKey) {
				deferred.resolve(config.secureKey);
			} else {

				//get it from mongodb, If does not exist, create a new random key and return;
				var collection = config.mongoClient.db(config.globalDb).collection(config.globalSettings);

				collection.find({}).toArray(function (err, docs) {
					if (err) {
						deferred.reject(err);
					} else {
						var key = uuid.v4(); //generate a new key.
						if (docs.length >= 1) {
							if (docs[0].secureKey) {
								config.secureKey = docs[0].secureKey;

								deferred.resolve(config.secureKey);
							} else {

								//save in mongodb.
								if (!docs[0])
									docs[0] = {};

								docs[0]["secureKey"] = key;



								collection.save(docs[0], function (err) {
									if (err) {
										deferred.reject(err);
									} else {
										//resolve if not an error
										config.secureKey = key;
										deferred.resolve(key);
									}
								});
							}
						} else {
							//create a new document.
							var doc = {};
							doc.secureKey = key;
							config.secureKey = key;
							collection.save(doc, function (err) {
								if (err) {
									deferred.reject(err);
								} else {
									//resolve if not an error
									deferred.resolve(key);
								}
							});
						}
					}
				});

			}

			return deferred.promise;
		} catch (e) {
			winston.log('error', {
				"error": String(e),
				"stack": new Error().stack
			});
		}
	},

	initClusterKey: function () {
		try {
			if (config.secureKey) {
				deferred.resolve(config.clusterKey);
			} else {

				//get it from mongodb, If does not exist, create a new random key and return;
				var deferred = q.defer();

				var collection = config.mongoClient.db(config.globalDb).collection(config.globalSettings);

				collection.find({}).toArray(function (err, docs) {
					if (err) {
						deferred.reject(err);
					} else {
						var key = uuid.v4(); //generate a new key.
						if (docs.length >= 1) {
							if (docs[0].clusterKey) {
								config.clusterKey = docs[0].clusterKey;
								deferred.resolve(config.clusterKey);
							} else {

								//save in mongodb.
								if (!docs[0])
									docs[0] = {};

								docs[0]["clusterKey"] = key;

								collection.save(docs[0], function (err) {
									if (err) {
										deferred.reject(err);
									} else {
										//resolve if not an error
										config.clusterKey = key;
										deferred.resolve(key);
									}
								});
							}
						} else {
							//create a new document.
							var doc = {};
							doc.clusterKey = key;
							config.clusterKey = key;
							collection.save(doc, function (err) {
								if (err) {
									deferred.reject(err);
								} else {
									//resolve if not an error
									deferred.resolve(key);
								}
							});
						}
					}
				});
			}

			return deferred.promise;
		} catch (e) {
			winston.log('error', {
				"error": String(e),
				"stack": new Error().stack
			});
		}
	},

	getMyUrl: function () {

		var deferred = q.defer();

		try {
			if (config.myURL) {
				deferred.resolve(config.myURL);
			} else {

				//get it from mongodb, If does not exist, create a new random key and return; 
				var _deferred = q.defer();

				var collection = config.mongoClient.db(config.globalDb).collection(config.globalSettings);

				collection.find({}).toArray(function (err, docs) {
					if (err) {


						_deferred.reject(err);
					} else {

						if (docs.length >= 1) {
							if (docs[0].myURL) {

								config.myURL = docs[0].myURL;
								_deferred.resolve(config.myURL);
							} else {
								// FOR TESTING, FIX LATER
								_deferred.resolve("http://localhost:4730");
							}
						} else {
							// FOR TESTING, FIX LATER
							_deferred.resolve("http://localhost:4730");
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