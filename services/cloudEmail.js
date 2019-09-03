
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/


const q = require('q');
const customService = require('../services/cloudObjects');
const mailService = require('../services/mail');

const emailService = {
  async sendEmail(appId, emailBody, emailSubject, query, isMasterKey) {
    const deferred = q.defer();
    try {
      const userArray = await customService.find(appId, query, 'User', { email: true }, null, null, null, {}, isMasterKey);
      if (userArray.length !== 0) {
        const emailPromises = userArray
          .filter(user => !!user.email)
          .map(async (user) => {
            const mailData = await mailService.emailCampaign(appId, user.email, emailBody, emailSubject);
            return mailData;
          });
        const data = await q.all(emailPromises);
        deferred.resolve(data);
      } else {
        throw 'No users found';
      }
    } catch (error) {
      deferred.reject(error);
    }
    return deferred.promise;
  },

};

module.exports = emailService;
