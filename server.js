/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var env = process.env.NODE_ENV || 'development';

var express = require('express');
var util = require('./helpers/util');
var pjson = require('./package.json');
var fs = require('fs');
var busboyBodyParser = require('busboy-body-parser');
var path = require('path');

global.mongoDisconnected = false;
global.winston = require('winston');
require('winston-loggly');
var slack = require('winston-bishop-slack').Slack;

var CLOUDBOOST_HOSTED = process.env["CLOUDBOOST_HOSTED"]

global.keys = require('./database-connect/keys.js')();

if (env === "development") {
    //Loggly Development Keys
    global.keys.logToken = "f0ebeed1-6c71-47b8-9014-e9ca69a2b114";
    global.keys.logglySubDomain = "cloudboostdev";
}

global.winston.add(global.winston.transports.Loggly, {
    inputToken: global.keys.logToken,
    subdomain: global.keys.logglySubDomain,
    tags: ["cloudboost-server"],
    json: true
});

// add slack transport if API key found
if (global.keys.slackWebHook) {
    var envVal = process.env["IS_STAGING"] ? 'STAGING' : 'PRODUCTION'
    global.winston.add(slack, {
        webhook_url: global.keys.slackWebHook,
        icon_url: "https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/caution-128.png",
        channel: "#devlogs",
        username: "API ERROR BOT - " + envVal,
        level: 'error',
        handleExceptions: true,
        customFormatter: function (level, message, meta) {
            return {
                attachments: [{
                    fallback: "An Error occured on API POD in - " + envVal,
                    pretext: "An Error occured on API POD in - " + envVal,
                    color: '#D00000',
                    fields: [{
                        title: meta.error,
                        value: meta.stack,
                        short: false
                    }]
                }]
            }
        }
    })
}



global.q = require('q');
global.uuid = require('uuid');
var bodyParser = require('body-parser');
var app = express();

//For pages in cloudboost
app.set('view engine', 'ejs');
app.use('*/assets', express.static(path.join(__dirname, 'page-templates/assets')));
app.use(bodyParser.urlencoded({
    limit: '5mb',
    extended: true
}));
app.use(bodyParser.json());
app.use(busboyBodyParser());
app.set('port', 4730); //SET THE DEFAULT PORT.

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

require('./database-connect/cors.js')(app); //cors!
var io = require('socket.io')();

io.attach(http);
// attach io to https, only if running in hosted env and certs are found
if (https && CLOUDBOOST_HOSTED) {
    io.attach(https);
}

global.sessionHelper = require('./helpers/session.js');
global.socketSessionHelper = require('./helpers/socketSession.js');
global.socketQueryHelper = require('./helpers/socketQuery.js');
global.cloudBoostHelper = require('./helpers/cloudboost.js')();
global.aclHelper = require('./helpers/ACL.js');

global.cacheItems = [];
global.apiTracker = null;
global.socketQueries = [];
global.model = {};

//Attach services -
function attachServices() {
    try {

        //loading utils

        //loading services.
        global.mongoService = require('./databases/mongo.js');
        global.customService = require('./services/cloudObjects.js')();
        global.userService = require('./services/cloudUser.js')();
        global.roleService = require('./services/cloudRole.js')();
        global.appService = require('./services/app.js')();
        global.fileService = require('./services/cloudFiles.js')();
        global.serverService = require('./services/server.js');
        global.mailService = require('./services/mail.js')();
        global.emailService = require('./services/cloudEmail.js')();
        global.authService = require('./services/auth.js')();
        global.importHelpers = require('./services/importHelpers.js')();

        console.log('+++++++++++ Services Status : OK. ++++++++++++++++++');
    } catch (e) {
        console.log("FATAL : Cannot attach services");
        console.log(e);
        global.winston.log('error', {
            "error": String(e),
            "stack": new Error().stack
        });
    }
}



//Server kickstart:
http.listen(app.get('port'), function () {
    try {
        
        require('./routes')(app);
        require('./config/setup')();
        attachServices();

        if (!process.env.CBENV || process.env.CBENV === 'STAGING'){
            require('./api/db/mongo.js')(app);            
        }
        
    } catch (e) {
        console.log(e);
        global.winston.log('error', e);
    }
});