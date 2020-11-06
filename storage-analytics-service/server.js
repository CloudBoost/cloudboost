var express = require('express');
global.request = require('request');
global.winston = require('winston');
var slack = require('winston-bishop-slack').Slack;
var util = require('util');

try {
    global.config = require('./config/cloudboost');
} catch (e) {
    //if this module is not found then,
    global.config = null;
}

global.keys = require('./database-connect/key.js')();
global.keyService = require('./database-connect/keyService.js');
global.q = require('q');
global.uuid = require('node-uuid');
var bodyParser = require('body-parser');
global.app = express();
var http = require('http').Server(global.app);
require('./database-connect/cors.js')(); //cors!

// add slack transport to winston if API key found
if (global.keys.slackWebHook) {
    var envVal = process.env["IS_STAGING"] ? 'STAGING' : 'PRODUCTION'
    global.winston.add(slack, {
        webhook_url: global.keys.slackWebHook,
        icon_url: "https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/caution-128.png",
        channel: "#devlogs",
        username: "Storage Analytics Service ERROR - " + envVal,
        level: 'error',
        handleExceptions: true,
        customFormatter: function (level, message, meta) {
            return {
                attachments: [{
                    fallback: "An Error occured on Storage Analytics Service POD in - " + envVal,
                    pretext: "An Error occured on Storage Analytics Service POD in - " + envVal,
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


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


global.app.use(function (req, res, next) {
    if (req.is('text/*')) {
        req.text = '';
        req.setEncoding('utf8');
        req.on('data', function (chunk) { req.text += chunk });
        req.on('end', next);
    } else {
        next();
    }
});

//This middleware converts text to JSON.
global.app.use(function (req, res, next) {
    try {
        req.body = JSON.parse(req.text);
        next();
    } catch (e) {
        //cannot convert to JSON.
        next();
    }
});


/*
Routes:
 */

app.get('/', function (req, res) {
    console.log('Index Page Served.');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ status: 200, message: "Service Status : OK", version: pjson.version }));
});

app.set('port', 4000); //SET THE DEFAULT PORT.

//Server kickstart:
http.listen(app.get('port'), function () {
    try {
        console.log("Storage Analytics Server running on port:" + app.get('port'));
        console.log("Data Connections Init...");
        addConnections();
        services();
    } catch (e) {
        console.log("ERROR : Server init error.");
        console.log(e);
        global.winston.log('error', {
            "error": String(e),
            "stack": new Error().stack
        });
    }
});

function services() {
    var db = require('./database-connect/mongoConnect.js')().connect();
    db.then(function (db) {
        try {
            global.mongoClient = db;
            //Init Secure key for this cluster. Secure key is used for Encryption / Creating apps , etc.
            global.keyService.initSecureKey();
            //Cluster Key is used to differentiate which cluster is the request coming from in Analytics.
            global.keyService.initClusterKey();

            attachCronJobs();
        } catch (e) {
            console.log(e);
            global.winston.log('error', {
                "error": String(e),
                "stack": new Error().stack
            });
        }
    }, function (err) {
        console.log("Cannot connect to MongoDB.");
        console.log(err);
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    });
}

//this fucntion add connections to the DB.
function addConnections() {
    //MONGO DB
    setUpMongoDB();
    //ANALYTICS
    setUpAnalyticsServer();
}



function setUpMongoDB() {
    //MongoDB connections. 

    if ((!global.config && !process.env["MONGO_1_PORT_27017_TCP_ADDR"] && !process.env["KUBERNETES_STATEFUL_MONGO_URL"])) {
        console.error("INFO : Not running on Docker. Use docker-compose (recommended) from https://github.com/cloudboost/docker");
    }

    var mongoConnectionString = "mongodb://";

    if (process.env["CLOUDBOOST_MONGODB_USERNAME"] && process.env["CLOUDBOOST_MONGODB_PASSWORD"]) {
        mongoConnectionString += process.env["CLOUDBOOST_MONGODB_USERNAME"] + ":" + process.env["CLOUDBOOST_MONGODB_PASSWORD"] + "@";
    }

    var isReplicaSet = false;

    if (global.config && global.config.mongo && global.config.mongo.length > 0) {
        //take from config file

        if (global.config.mongo.length > 1) {
            isReplicaSet = true;
        }

        for (var i = 0; i < global.config.mongo.length; i++) {
            mongoConnectionString += global.config.mongo[i].host + ":" + global.config.mongo[i].port;
            mongoConnectionString += ",";
        }

    } else {

        if (!global.config) {
            global.config = {};
        }

        global.config.mongo = [];

        if (process.env["KUBERNETES_STATEFUL_MONGO_URL"]) {
            console.log("MongoDB is running on Kubernetes");

            global.config.mongo = process.env["KUBERNETES_STATEFUL_MONGO_URL"].split(',').map(function (x, i) {
                return {
                    host: x.split(':')[0],
                    port: x.split(':')[1]
                }
            })

            mongoConnectionString += process.env["KUBERNETES_STATEFUL_MONGO_URL"]
            isReplicaSet = true;

        } else {
            var i = 1;

            while (process.env["MONGO" + i + "_PORT_27017_TCP_ADDR"] && process.env["MONGO" + i + "_PORT_27017_TCP_PORT"]) {
                if (i > 1) {
                    isReplicaSet = true;
                }

                global.config.mongo.push({
                    host: process.env["MONGO" + i + "_PORT_27017_TCP_ADDR"],
                    port: process.env["MONGO" + i + "_PORT_27017_TCP_PORT"]
                });

                mongoConnectionString += process.env["MONGO" + i + "_PORT_27017_TCP_ADDR"] + ":" + process.env["MONGO" + i + "_PORT_27017_TCP_PORT"];
                mongoConnectionString += ",";
                i++;
            }
        }
    }

    mongoConnectionString = mongoConnectionString.substring(0, mongoConnectionString.length - 1);
    mongoConnectionString += "/"; //de limitter. 
    global.keys.prodSchemaConnectionString = mongoConnectionString + global.keys.globalDb;
    global.keys.mongoConnectionString = mongoConnectionString;

    if (isReplicaSet) {
        console.log("MongoDB is in ReplicaSet");
        var str = "?replicaSet=cloudboost&slaveOk=true&maxPoolSize=200&ssl=false&connectTimeoutMS=30000&socketTimeoutMS=30000&w=1&wtimeoutMS=30000";
        global.keys.prodSchemaConnectionString += str;
        global.keys.mongoConnectionString += str;
    }

    console.log("Mongo Global DB : " + global.keys.prodSchemaConnectionString);
    console.log("Mongo DB Server: " + global.keys.mongoConnectionString);
}

function setUpAnalyticsServer() {
    if (process.env["CLOUDBOOST_ANALYTICS_SERVICE_HOST"]) {
        //this is running on Kubernetes
        console.log("CloudBoost Analytics is running on Kubernetes");
        global.keys.analyticsUrl = "http://" + process.env["CLOUDBOOST_ANALYTICS_SERVICE_HOST"] + "/";
        console.log(global.keys.analyticsUrl);
    }

    if (process.env["CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST"]) {
        //this is running on Kubernetes
        console.log("CloudBoost Analytics is running on Kubernetes");
        global.keys.analyticsUrl = "http://" + process.env["CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST"] + "/";
        console.log(global.keys.analyticsUrl);
    }

    console.log("Analytics URL : ");
    console.log(global.keys.analyticsUrl);
}

function attachCronJobs() {
    require('./cron/storage-analytics.js')();
}
