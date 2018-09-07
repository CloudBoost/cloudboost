/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var fs = require('fs');
var busboyBodyParser = require('busboy-body-parser');
var path = require('path');
var cors = require('cors');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require('./config/config');
var winston = require('winston');

require('./config/logger')(); //configure winston logger transports.

app.use(cors());
//For pages in cloudboost
app.set('view engine', 'ejs');
app.use('*/assets', express.static(path.join(__dirname, 'page-templates/assets')));
app.use(bodyParser.urlencoded({
    limit: '5mb',
    extended: true
}));
app.use(bodyParser.json());
app.use(busboyBodyParser());

const PORT = config.port || 4730;
app.set('port', PORT); //SET THE DEFAULT PORT.

var https = null;
try {
    if (fs.statSync('./config/cert.crt').isFile() && fs.statSync('./config/key.key').isFile()) {
        //use https

        var httpsOptions = {
            key: fs.readFileSync('./config/key.key'),
            cert: fs.readFileSync('./config/cert.crt')
        };
        https = require('https').Server(httpsOptions, app);

    }
} catch (e) {
    winston.log('info', "INFO : SSL Certificate not found or is invalid.");
    winston.info("Switching ONLY to HTTP...");
}

var http = require('http').createServer(app);
config.rootPath = require('app-root-path');
var io = require('socket.io')();

io.attach(http);
// attach io to https, only if running in hosted env and certs are found
if (https) {
    io.attach(https);
}

//Server kickstart:
http.listen(PORT, function () {
    try {

        if (!process.env.CBENV || process.env.CBENV === 'STAGING') {
            require('./api/db/mongo.js')(app);
        }

        require('./config/redis')(io); // Setup redis server
        require('./config/mongo')(); // Setup mongo server
        require('./config/analytics')(); // Setup the analytics server
        require('./config/setup')(); // Setup cloudboost server
        require('./middlewares')(app); //Setup middlewares

        require('./routes')(app); //Setup routes

        winston.info('Cloudboost API running on port %s', PORT);

    } catch (e) {
        winston.log('error', e);
        process.exit(1);
    }
});