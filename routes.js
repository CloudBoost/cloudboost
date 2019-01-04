const winston = require('winston');
const config = require('./config/config');
const pjson = require('./package.json');


module.exports = function (app) {
  app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      status: 200,
      version: pjson.version,
      message: "This is CloudBoost API. If you're looking for the dashboard. It should be running on port 1440.",
    }));
  });

  app.get('/getFile/:filename', (req, res) => { // for getting any file from resources/
    res.sendFile(`resources/${req.params.filename}`, {
      root: __dirname,
    });
  });

  require('./api/tables/CloudObjects.js')(app);
  require('./api/tables/CloudUser.js')(app);
  require('./api/tables/CloudRole.js')(app);
  require('./api/app/App.js')(app);
  require('./api/app/Admin.js')(app);
  require('./api/app/AppSettings.js')(app);
  require('./api/app/AppFiles.js')(app);
  require('./api/file/CloudFiles.js')(app);
  require('./api/server/Server.js')(app);
  require('./api/email/CloudEmail.js')(app);
  require('./api/pages/Page.js')(app);
  require('./api/auth/Auth.js')(app);
  require('./cron/expire.js');


  winston.info('+++++++++++ API Status : OK ++++++++++++++++++');

  app.use((req, res) => {
    res.status(404).json({
      status: 404,
      message: 'The endpoint was not found. Please check again.',
    });
  });

  app.use((err, req, res) => {
    winston.error('FATAL : Internal Server Error');
    winston.error(err);

    if (config.env === 'development') {
      res.status(500).json({
        message: err.message,
        error: err.stack,
      });
    } else {
      res.status(500).send({
        status: '500',
        message: 'Internal Server Error',
      });
    }
  });
};
