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
var slack = require('winston-bishop-slack').Slack;

global.winston = require('winston');
require('winston-loggly');

var logglyTags = config.logglyTags ? config.logglyTags.split(',') : [];
var port = config.port || 4730;

global.winston.add(global.winston.transports.Loggly, {
    inputToken: config.logToken,
    subdomain: config.logglySubDomain,
    tags: logglyTags,
    json: true
});

// add slack transport if API key found
if (config.slackWebHook) {
    global.winston.add(slack, {
        webhook_url: config.slackWebHook,
        icon_url: config.slackIconUrl,
        channel: config.slackChannel,
        username: "API ERROR BOT - " + config.env,
        level: 'error',
        handleExceptions: true,
        customFormatter: function (level, message, meta) {
            return {
                attachments: [{
                    fallback: "An Error occured on API POD in - " + config.env,
                    pretext: "An Error occured on API POD in - " + config.env,
                    color: '#D00000',
                    fields: [{
                        title: meta.error,
                        value: meta.stack,
                        short: false
                    }]
                }]
            };
        }
    });
}

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
app.set('port', port); //SET THE DEFAULT PORT.


// var http = null;
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
    console.log("INFO : SSL Certificate not found or is invalid.");
    console.log("Switching ONLY to HTTP...");
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
http.listen(app.get('port'), function () {
    try {
        
        if (!process.env.CBENV || process.env.CBENV === 'STAGING'){
            require('./api/db/mongo.js')(app);
        }

        require('./config/redis')(io); // Setup redis server
        require('./config/mongo')(); // Setup mongo server
        require('./config/analytics')(); // Setup the analytics server
        require('./config/setup')(); // Setup cloudboost server
        require('./middlewares')(app); //Setup middlewares               

        require('./routes')(app); //Setup routes
    } catch (e) {
        console.log(e);
        global.winston.log('error', e);
        process.exit(1);
    }
});