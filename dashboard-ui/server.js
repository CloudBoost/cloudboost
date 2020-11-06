
const path = require('path');
const http = require('http');
const Express = require('express');

const app = new Express();
const server = new http.Server(app);

var config = {
  __isDevelopment: process.env['CLOUDBOOST_DEVELOPMENT'] || false,
  __isHosted: process.env['CLOUDBOOST_HOSTED'] || false,
  __isStaging: process.env['NODE_ENV'] === 'staging',
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  USER_SERVICE_URL: process.env['USER_SERVICE'] || 'http://localhost:3000',
  __isBrowser: true,
  SERVER_URL: process.env['SERVER_URL'] || 'http://localhost:4730',
  DASHBOARD_URL: process.env['DASHBOARD_URL'] || 'http://localhost:1440',
  ACCOUNTS_URL: process.env['ACCOUNTS_URL'] || 'http://localhost:1447',
  DATABROWSER_URL: process.env['DATABROWSER_URL'] || 'http://localhost:3333',
  ANALYTICS_URL: process.env['ANALYTICS_URL'] || 'http://localhost:5555',
  LANDING_URL: process.env['LANDING_URL'] || 'http://localhost:1444',
  STRIPE_KEY: process.env['PUB_STRIPE_KEY'] || 'pk_test_FueQ6KFwm3HxCM56qzlz0F5F'
};

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('*/public/', Express.static(path.join(__dirname, 'public')));

app.get('/status', function (req, res, next) {
  res.status(200).json({ status: 200, message: 'CloudBoost | Dashboard  Status : OK' });
});

app.get('*', function (req, res) {
  config.SERVER_DOMAIN = process.env['SERVER_DOMAIN'] || req.protocol + '://' + req.hostname;
  res.render('index', { config: JSON.stringify(config) });
});

server.listen(process.env.PORT || 1440, (err) => {
  if (err) {
    return console.error(err);
  }
  console.info('Server running on http://localhost:' + (process.env.PORT
    ? process.env.PORT
    : '1440'));
});
