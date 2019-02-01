
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
const config = require('../../config/config');

module.exports = (app) => {
  app.post('/db/mongo/Disconnect', (req, res) => {
    global.databaseTemp = global.database;
    global.database = null;
    config.mongoDisconnected = true;
    res.status(200).send('Success');
  });

  app.post('/db/mongo/connect', (req, res) => {
    if (global.databaseTemp) {
      global.database = global.databaseTemp;
    }
    config.mongoDisconnected = false;
    res.status(200).send('Success');
  });
};
