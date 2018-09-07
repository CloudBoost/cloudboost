
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var q = require('q');
var customService = require('../services/cloudObjects');
var mailService = require('../services/mail');

var emailService =  {
	sendEmail: function (appId, emailBody, emailSubject, query, isMasterKey) {
		var deferred = q.defer();
		customService.find(appId, query, 'User', { email: true }, null, null, null, {}, isMasterKey).then(function (data) {
			if (data.length != 0) {
				var emailPromises = [];
				for (var k in data) {
					if (data[k].email) {
						emailPromises.push(mailService.emailCampaign(appId, data[k].email, emailBody, emailSubject));
					}
				}
				q.all(emailPromises).then(function (data) {
					deferred.resolve(data);
				}, function (err) {
					deferred.reject(err);
				});
			} else {
				deferred.reject("No users found");
			}
		}, function (err) {
			deferred.reject(err);
		});
		return deferred.promise;
	}

};

module.exports = emailService;