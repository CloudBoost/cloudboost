
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const winston = require('winston');
const appService = require('../../services/app');
const emailService = require('../../services/cloudEmail');

module.exports = (app) => {
  /**
     *Description : Send Email to all users in the selected aplication
     *Params:
     *- Param secureKey: Secure key of System
     *Returns:
     -Success : success on emails sent
     -Error : Error Data( 'Server Error' : status 500 )
     */
  app.post('/email/:appId/campaign', async (req, res) => {
    const { appId } = req.params;
    const {
      key: appKey,
      query,
      emailBody,
      emailSubject,
    } = req.body;
    try {
      const isMasterKey = await appService.isMasterKey(appId, appKey);
      if (isMasterKey) {
        await emailService.sendEmail(appId, emailBody, emailSubject, query, isMasterKey);
        return res.status(200).send(null);
      }
      return res.status(401).send({ status: 'Unauthorized' });
    } catch (err) {
      winston.error({ error: err });
      if (err === 'Email configuration is not found.' || err === 'No users found') {
        return res.status(400).send({ error: err });
      }
      return res.status(500).json({ message: 'Something went wrong', error: err });
    }
  });
};
