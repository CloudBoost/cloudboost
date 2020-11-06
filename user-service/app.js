/* eslint global-require:0 */
const json2xls = require('json2xls');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const _ = require('underscore');

const configSetup = require('./config/setup');
const mongoConfig = require('./config/mongo');
const redisConfig = require('./config/redis');
const passportConfig = require('./config/passport');
const routesConfig = require('./routes');
const logger = require('./config/logger');

const attachServices = () => {
  // Services
  global.beaconService = require('./services/beaconService.js');
  global.userService = require('./services/userService');
  global.subscriberService = require('./services/subscriberService.js');
  global.projectService = require('./services/projectService.js');
  global.tutorialService = require('./services/tutorialService.js');
  global.fileService = require('./services/fileService.js');
  global.mailChimpService = require('./services/mailChimpService.js');
  global.mailService = require('./services/mailService.js');
  global.notificationService = require('./services/notificationService.js');
  global.cbServerService = require('./services/cbServerService.js');
  global.paymentProcessService = require('./services/paymentProcessService.js');
  global.paymentCardService = require('./services/paymentCardService.js');
  global.userAnalyticService = require('./services/userAnalyticService.js');
  global.analyticsNotificationsService = require('./services/analyticsNotificationsService.js');
  global.cbPartnerService = require('./services/cbPartnerService.js');
  global.utilService = require('./services/utilService.js');
  global.dbAccessService = require('./services/dbAccessService.js');
  global.salesLeadService = require('./services/salesLeadService.js');
  global.resourceService = require('./services/resourceService.js');
};

module.exports = (app, startServer) => {
  // configure winston logger
  logger();
  // Express.
  const rawBodySaver = (req, res, buffer) => {
    if (buffer && buffer.length) {
      req.rawBody = buffer;
    }
  };

  app.use(cookieParser());
  app.use(bodyParser.json({
    verify: rawBodySaver, // function to parse original request body buffer as rawBody constiable before parsing to json
  }));

  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(json2xls.middleware);
  app.set('view engine', 'ejs');
  app.use((req, res, next) => {
    // if req body is a string, convert it to JSON.
    if (typeof req.body === 'string') {
      req.body = JSON.parse(req.body);
    }

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });


  app.use((req, res, next) => {
    if (req.is('text/*')) {
      req.text = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => {
        req.text += chunk;
      });
      req.on('end', next);
    } else {
      next();
    }
  });

  const addConnections = _.compose(
    configSetup.setUpDataServices,
    configSetup.setUpAnalyticsServer,
    routesConfig.bind(null, app),
    passportConfig.bind(null, app, passport),
    attachServices,
    mongoConfig.bind(null, startServer),
    redisConfig.bind(null, app),
  );

  addConnections();

  return app;
};
