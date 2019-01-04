
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const winston = require('winston');
const appService = require('../../services/app');
const emailService = require('../../services/cloudEmail');

module.exports = function (app) {
  /**
     *Description : Send Email to all users in the selected aplication
     *Params:
     *- Param secureKey: Secure key of System
     *Returns:
     -Success : success on emails sent
     -Error : Error Data( 'Server Error' : status 500 )
     */
  app.post('/email/:appId/campaign', (req, res) => {
    const appId = req.params.appId;
    const appKey = req.body.key;
    const query = req.body.query;
    const emailBody = req.body.emailBody;
    const emailSubject = req.body.emailSubject;

    appService.isMasterKey(appId, appKey).then((isMasterKey) => {
      if (isMasterKey) {
        emailService.sendEmail(appId, emailBody, emailSubject, query, isMasterKey).then(() => {
          res.status(200).send(null);
        }, (err) => {
          if (err === 'Email Configuration is not found.' || err === 'No users found') {
            res.status(400).send({ error: err });
          } else {
            res.status(500).json({ message: 'Something went wrong', error: err });
          }
        });
      } else {
        res.status(401).send({ status: 'Unauthorized' });
      }
    }, (err) => {
      winston.error({
        error: err,
      });
      return res.status(500).send('Cannot retrieve security keys.');
    });
  });
};
