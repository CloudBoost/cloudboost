
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
const customService = require('../services/cloudObjects');
const mailService = require('../services/mail');

const emailService = {
  async sendEmail(appId, emailBody, emailSubject, query, isMasterKey) {
    const userArray = await customService.find(
      appId,
      query,
      'User',
      { email: true },
      null,
      null,
      null,
      {},
      isMasterKey,
    );

    if (userArray.length !== 0) {
      const emailPromises = userArray
        .filter(user => !!user.email)
        .map(async (user) => {
          const mailData = await mailService.emailCampaign(appId, user.email, emailBody, emailSubject);
          return mailData;
        });

      return Promise.all(emailPromises);
    }

    throw 'No users found';
  },

};

module.exports = emailService;
