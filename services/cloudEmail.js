
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/


const q = require('q');
const customService = require('../services/cloudObjects');
const mailService = require('../services/mail');

const emailService = {
  sendEmail(appId, emailBody, emailSubject, query, isMasterKey) {
    const deferred = q.defer();
    customService.find(appId, query, 'User', { email: true }, null, null, null, {}, isMasterKey).then((data) => {
      if (data.length != 0) {
        const emailPromises = [];
        for (const k in data) {
          if (data[k].email) {
            emailPromises.push(mailService.emailCampaign(appId, data[k].email, emailBody, emailSubject));
          }
        }
        q.all(emailPromises).then((data) => {
          deferred.resolve(data);
        }, (err) => {
          deferred.reject(err);
        });
      } else {
        deferred.reject('No users found');
      }
    }, (err) => {
      deferred.reject(err);
    });
    return deferred.promise;
  },

};

module.exports = emailService;
