/* eslint-disable global-require
 */
const winston = require('winston');
const express = require('express');

const app = express();
const fs = require('fs');
const keys = require('./config/keys');

try { // Load the configuration.
  keys.config = require('./config/cloudboost'); // eslint-disable-line
} catch (e) {
  // File not found.
  keys.config = null;
}

app.set('port', process.env.PORT || 3000);

function startServer() {
  let http = null;
  let https = null;
  let httpsOptions = {};
  try {
    if (fs.statSync('./config/cert.crt').isFile() && fs.statSync('./config/key.key').isFile()) {
      // use https
      winston.info('Running on HTTPS protocol.');
      httpsOptions = {
        key: fs.readFileSync('./config/key.key'),
        cert: fs.readFileSync('./config/cert.crt'),
      };
      https = require('https').Server(httpsOptions, app);
    }
  } catch (e) {
    // crt and key not found.
    winston.info('INFO : SSL Certificate not found or is invalid.');
    winston.info('Switching ONLY to HTTP...');
  }

  http = require('http').createServer(app);

  http.listen(app.get('port'), () => {
    winston.info(`CBFrontend Services runing on PORT:${app.get('port')}`);
  });

  if (https) {
    https.listen(3001, () => {
      winston.info('HTTPS Server started.');
    });
  }
}

// Load app configurations.
require('./app')(app, startServer);
