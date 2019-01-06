
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/


const winston = require('winston');
const util = require('../../helpers/util.js');
const config = require('../../config/config');
const serverService = require('../../services/server');
const keyService = require('../../database-connect/keyService');

module.exports = (app) => {
  // Description : Used to change server URL form localhost to any DNS.
  // Params : secureKey : Used to validate the request.
  //         url : New Server URL.
  // Returns : 200 - success
  //          400 - Invalid URL, 401 - Unauthoroized, 500 - Internal Server Error.
  app.post('/server/url', async (req, res) => {
    if (!util.isUrlValid(req.body.url)) {
      return res.status(400).send('Invalid URL');
    }

    if (config.secureKey === req.body.secureKey) {
      try {
        const url = await keyService.changeUrl(req.body.url);
        return res.status(200).json({
          status: 'success',
          message: `Cluster URL Updated to ${url}`,
        });
      } catch (error) {
        winston.error({
          error,
        });
        return res.status(500).send('Error, Cannot change the cluster URL at this time.');
      }
    } else {
      return res.status(401).send('Unauthorized');
    }
  });


  app.get('/status', async (req, res) => {
    try {
      await serverService.getDBStatuses();
      return res.status(200).json({
        status: 200,
        message: 'Service status : OK',
      });
    } catch (error) {
      winston.error({ error });
      return res.status(500).send(error);
    }
  });
};
