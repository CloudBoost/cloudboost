/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require('q');
var uuid = require('node-uuid');

var config = require('../config/config');

//This file manages encryption keys, Host URL, etc etc. 
module.exports = {
	initSecureKey: function () {
		try {
			var deferred = q.defer();

			var key = null;

			if (global.keys.secureKey) {

				deferred.resolve(global.keys.secureKey);
			} else {

				//get it from mongodb, If does not exist, create a new random key and return;
				var collection = config.mongoClient.db(global.keys.globalDb).collection(global.keys.globalSettings);

				collection.find({}).toArray(function (err, docs) {
					if (err) {


						deferred.reject(err);
					} else {

						var key = uuid.v4(); //generate a new key.

						if (docs.length >= 1) {
							if (docs[0].secureKey) {
								global.keys.secureKey = docs[0].secureKey;

								deferred.resolve(global.keys.secureKey);
							} else {

								//save in mongodb.
								if (!docs[0])
									docs[0] = {};

								docs[0]["secureKey"] = key;



								collection.save(docs[0], function (err, doc) {
									if (err) {


										deferred.reject(err);
									} else {
										//resolve if not an error
										global.keys.secureKey = key;

										deferred.resolve(key);
									}
								});
							}
						} else {
							//create a new document.
							var doc = {};
							doc.secureKey = key;
							global.keys.secureKey = key;
							collection.save(doc, function (err, doc) {
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


			global.winston.log('error', {
				"error": String(e),
				"stack": new Error().stack
			});
		}
	},

	initClusterKey: function () {
		try {



			var key = null;

			if (global.keys.secureKey) {

				deferred.resolve(global.keys.clusterKey);
			} else {

				//get it from mongodb, If does not exist, create a new random key and return;
				var deferred = q.defer();

				var collection = config.mongoClient.db(global.keys.globalDb).collection(global.keys.globalSettings);

				collection.find({}).toArray(function (err, docs) {
					if (err) {


						deferred.reject(err);
					} else {

						var key = uuid.v4(); //generate a new key.

						if (docs.length >= 1) {
							if (docs[0].clusterKey) {
								global.keys.clusterKey = docs[0].clusterKey;

								deferred.resolve(global.keys.clusterKey);
							} else {

								//save in mongodb.
								if (!docs[0])
									docs[0] = {};

								docs[0]["clusterKey"] = key;

								collection.save(docs[0], function (err, doc) {
									if (err) {


										deferred.reject(err);
									} else {
										//resolve if not an error
										global.keys.clusterKey = key;

										deferred.resolve(key);
									}
								});
							}
						} else {
							//create a new document.
							var doc = {};
							doc.clusterKey = key;
							global.keys.clusterKey = key;
							collection.save(doc, function (err, doc) {
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
			global.winston.log('error', {
				"error": String(e),
				"stack": new Error().stack
			});
		}
	},

	getMyUrl: function () {

		var deferred = q.defer();

		try {
			if (global.keys.myURL) {
				deferred.resolve(global.keys.myURL);
			} else {

				//get it from mongodb, If does not exist, create a new random key and return; 
				var _deferred = q.defer();

				var collection = config.mongoClient.db(global.keys.globalDb).collection(global.keys.globalSettings);

				collection.find({}).toArray(function (err, docs) {
					if (err) {


						_deferred.reject(err);
					} else {

						if (docs.length >= 1) {
							if (docs[0].myURL) {

								global.keys.myURL = docs[0].myURL;
								_deferred.resolve(global.keys.myURL);
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
			global.winston.log('error', {
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
			var collection = config.mongoClient.db(global.keys.globalDb).collection(global.keys.globalSettings);

			collection.find({}).toArray(function (err, docs) {
				if (err) {


					deferred.reject(err);
				} else {

					if (docs.length >= 1) {

						docs[0].myURL = url;

						collection.save(docs[0], function (err, doc) {

							if (err) {

								deferred.reject("Error, cannot change the cluster URL.");
							} else {

								global.keys.myURL = url;
								deferred.resolve(url);
							}
						});
					} else {
						deferred.reject("Global record not found. Restart the cluster.");
					}
				}
			});

		} catch (e) {
			global.winston.log('error', {
				"error": String(e),
				"stack": new Error().stack
			});
			deferred.reject(e);
		}

		return deferred.promise;

	}
};