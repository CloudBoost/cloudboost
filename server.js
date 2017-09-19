/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

global.env = process.env.NODE_ENV || 'development';

global.express = require('express');
global.request = require('request');
var pjson = require('./package.json');
var fs = require('fs');
global.rootPath = require('app-root-path');
var busboyBodyParser = require('busboy-body-parser');
var q = require("q");
var _ = require('underscore');
var path = require('path');

global.mongoDisconnected = false;
global.winston = require('winston');
expressWinston = require('express-winston');
require('winston-loggly');
var slack = require('winston-bishop-slack').Slack;
var util = require('util');

global.keys = require('./database-connect/keys.js')();

if (global.env === "development") {
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
if(global.keys.slackWebHook){
    var envVal = process.env["IS_STAGING"] ? 'STAGING' : 'PRODUCTION'
    global.winston.add(slack, {
        webhook_url: global.keys.slackWebHook,
        icon_url: "https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/caution-128.png",
        channel: "#devlogs",
        username: "API ERROR BOT - " + envVal,
        level: 'error',
        handleExceptions: true,
        customFormatter: function(level, message, meta) {
            return { attachments: [ {
            fallback: "An Error occured on API POD in - " + envVal,
            pretext: "An Error occured on API POD in - " + envVal,
            color: '#D00000',
            fields: [{
                    title: meta.error,
                    value: meta.stack,
                    short: false
                }]
            }]}
        }
    })
}

global.keyService = require('./database-connect/keyService.js');

global.q = require('q');
global.uuid = require('uuid');
var bodyParser = require('body-parser');
var session = require('express-session');
global.app = global.express();

//For pages in cloudboost
global.app.set('view engine', 'ejs');
global.app.use('*/assets',global.express.static(path.join(__dirname, 'page-templates/assets')));
global.app.use(bodyParser.json({limit: '5mb'}));
global.app.use(bodyParser.urlencoded({limit: '5mb'}));

var http = null;
var https = null;
try {
    if (fs.statSync('./config/cert.crt').isFile() && fs.statSync('./config/key.key').isFile()) {
        //use https
        console.log("Running on HTTPS protocol.");
        var httpsOptions = {
            key: fs.readFileSync('./config/key.key'),
            cert: fs.readFileSync('./config/cert.crt')
        };
        https = require('https').Server(httpsOptions, global.app);

    }
} catch (e) {
    console.log("INFO : SSL Certificate not found or is invalid.");
    console.log("Switching ONLY to HTTP...");
}

http = require('http').createServer(global.app);

require('./database-connect/cors.js')(); //cors!
var io = require('socket.io')();

if (https) {
    io.attach(https);
} else {
    io.attach(http);
}

var Redis = require('ioredis');

var ioRedisAdapter = require('socket.io-redis');

global.sessionHelper = require('./helpers/session.js');
global.socketSessionHelper = require('./helpers/socketSession.js');
global.socketQueryHelper = require('./helpers/socketQuery.js');
global.cloudBoostHelper = require('./helpers/cloudboost.js')();
global.aclHelper = require('./helpers/ACL.js');

//setting socket.io redis store.
global.mongoService = null;
global.customService = null;
global.userService = null;
global.appService = null;
global.fileService = null;
global.queueService = null;
global.serverService = null;
global.mailService = null;

global.mongoUtil = null;

global.cacheService = null;
global.cacheItems = [];
global.apiTracker = null;
global.socketQueries = [];
global.model = {};

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(busboyBodyParser());

global.app.use(function(req, res, next) {
    if (req.is('text/*')) {
        req.text = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk) {
            req.text += chunk;
        });
        req.on('end', next);
    } else {
        next();
    }
});

//This middleware converts text to JSON.
global.app.use(function(req, res, next) {
    try {
        console.log("Middleware to convert text to JSON");
        if (req.text && _isJSON(req.text)) {
            req.body = JSON.parse(req.text);
        }

        if (req.body && typeof(req.body) === "string" && _isJSON(req.body)) {
            req.body = JSON.parse(req.body);
        }

        console.log("Middleware to converted text to JSON successfully..");

        //INVALIDATE CACHE FOR API
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        res.setHeader("Expires", "0"); // Proxies.

        next();

    } catch (e) {
        global.winston.log('error', {
            "error": String(e),
            "stack": new Error().stack
        });
        //cannot convert to JSON.
        next();
    }
});

global.app.use([
    '/file/:appId',
    '/data/:appId',
    '/app/:appId/:tableName',
    '/user/:appId',
    '/cache/:appId',
    '/queue/:appId',
    '/push/:appId'
    ], function(req, res, next) {
    //This is the Middleware for authenticating the app access using appID and key
    //check if all the services are loaded first.

    try {

        console.log("This is the Middleware for authenticating the app access using appID and key");

        if (!global.customService || !global.serverService || !global.mongoService || !global.userService || !global.roleService || !global.appService || !global.fileService || !global.cacheService || !global.pushService) {
            return res.status(400).send("Services Not Loaded");
        }

        console.log('Checking if API Key is valid...');

        if (req.text && _isJSON(req.text)) {
            req.body = JSON.parse(req.text);
        }

        if (req.body && typeof(req.body) === "string" && _isJSON(req.body)) {
            req.body = JSON.parse(req.body);
        }

        var requestRecvd = req.originalUrl; //this is the relative url.
        if (ignoreUrl(requestRecvd)) {
            next();
        } else {

            var appKey = req.body.key || req.params.key; //key is extracted from body/url parameters

            var appId = req.params.appId;
            if (!appKey) {
                return res.status(401).send({status: 'error', message: "Key not found. You need to have your Client Key or Master Key in the body or url parameter 'key' when you make this request"});
            } else {
                console.log("check if app is in the plan");
                //check if app is in the plan.
                var promises = [];
                promises.push(global.apiTracker.isInPlanLimit(appId));
                promises.push(global.appService.isKeyValid(appId, appKey));
                global.q.all(promises).then(function(result) {
                    var isAppKeyValid = result[1];
                    var isInPlan = result[0];
                    if (!isInPlan) {
                        //check if the appIsReleased.
                        global.apiTracker.log(appId, "isReleased/isReleased", "", "JavaScript", true);

                        return res.status(402).send("Reached Plan Limit. Upgrade Plan.");
                    }

                    if (!isAppKeyValid) {
                        return res.status(401).send("App ID or App Key is invalid.");
                    } else {
                        next();
                    }

                }, function(err) {
                    console.log(err.message)
                    return res.status(500).send(err.message);
                });
            }
        }

    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }

});

global.app.use(function(req, res, next) {

    try {
        // Middleware for retrieving sessions
        console.log('Session Middleware');

        res.header('Access-Control-Expose-Headers', 'sessionID');

        if (req.headers.sessionid) {
            console.log('Session Found.');
            res.header('sessionID', req.headers.sessionid);
            global.sessionHelper.getSession(req.headers.sessionid, function(err, session) {
                if (!err) {
                    req.session = session;
                    next();
                } else {
                    console.log(err);
                    req.session = {};
                    req.session.id = req.header.sessionid;
                    next();
                }
            });
        } else {
            console.log('No Session Found. Creating a new session.');
            _setSession(req, res);
            next();
        }

    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }

});

//Attach services -
function attachServices() {
    try {
        console.log("Attach services...");
        if (!global.mongoClient) {
            console.log("Error : Could Not Attach Services Mongo DB not loaded.");
            return;
        }

        //loading utils
        global.mongoUtil = require('./dbUtil/mongo')();
        global.apiTracker = require('./database-connect/apiTracker')();

        //loading services.
        global.mongoService = require('./databases/mongo.js')();
        global.customService = require('./services/cloudObjects.js')();
        global.userService = require('./services/cloudUser.js')();
        global.roleService = require('./services/cloudRole.js')();
        global.appService = require('./services/app.js')();
        global.queueService = require('./services/cloudQueue.js')();
        global.fileService = require('./services/cloudFiles.js')();
        global.cacheService = require('./services/cloudCache.js')();
        global.serverService = require('./services/server.js')();
        global.mailService = require('./services/mail.js')();
        global.pushService = require('./services/cloudPush.js')();
        global.emailService = require('./services/cloudEmail.js')();
        global.authService = require('./services/auth.js')();

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



//Attach all API's
function attachAPI() {

    try {
        console.log("Attach API's");
        if (!global.mongoClient || !global.customService || !global.mongoService || !global.userService || !global.roleService || !global.appService || !global.fileService || !global.cacheService || !global.pushService) {
            console.log("Failed to attach API's because services not loaded properly.");
            return;
        }

        require('./api/tables/CloudObjects.js')();
        require('./api/tables/CloudUser.js')();
        require('./api/tables/CloudRole.js')();
        require('./api/app/App.js')();
        require('./api/app/Admin.js')();
        require('./api/app/AppSettings.js')();
        require('./api/app/AppFiles.js')();
        require('./api/file/CloudFiles.js')();
        require('./api/queue/CloudQueue.js')();
        require('./api/cache/CloudCache.js')();
        require('./api/server/Server.js')();
        require('./api/pushNotifications/CloudPush.js')();
        require('./api/email/CloudEmail.js')();
        require('./api/pages/Page.js')();
        require('./api/auth/Auth.js')();

        
        

        console.log('+++++++++++ API Status : OK ++++++++++++++++++');



        app.use(function(err, req, res, next) {
            if (err.status !== 500) {
                return next();
            }

            console.log("FATAL : Internal Server Error");
            console.log(err);

            res.statusCode(500).send({status: "500", message: "Internal Server Error"});
        });

        console.log("CloudBoost Server Started on PORT : " + app.get('port'));
    } catch (e) {
        console.log("FATAL : Error attaching API. ");
        console.log(e);
        global.winston.log('error', {
            "error": String(e),
            "stack": new Error().stack
        });
    }
}

function ignoreUrl(requestUrl) {

    try {

        console.log("Adding Ingnore URLS....");
        var ignoreUrl = [ //for the routes to check whether the particular service is active/not
        "/api/userService",
        "/api/customService",
        "/api/roleService",
        "/api/status",
        "/file",
        "/api/createIndex",
        "/pages",
        "/status"
        ];

        for (var i = 0; i < ignoreUrl.length; i++) {
            if (requestUrl.indexOf(ignoreUrl[i]) >= 0) {
                return true;
            } else {
                var arr = ignoreUrl[i].split("/");
            }
        }

        return false;

    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}

/*
Routes:
*/

app.get('/', function(req, res) {
    console.log('INDEX PAGE RETURNED.');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({status: 200, version: pjson.version, message: "This is CloudBoost API. If you're looking for the dashboard. It should be running on port 1440."}));
});

app.get('/getFile/:filename', function(req, res) { //for getting any file from resources/
    console.log("Getting any file from resources");
    res.sendFile("resources/" + req.params.filename, {root: __dirname});
});





app.set('port', 4730); //SET THE DEFAULT PORT.

//Server kickstart:
http.listen(app.get('port'), function() {
    try {

        var filePath = './config/cloudboost.json';
        _checkFileExists(filePath).then(function(data) {
            if (data) {
                try {
                    global.config = require('./config/cloudboost');
                } catch (e) {
                    global.config = null;
                }
            } else {
                global.config = null;
            }

            console.log("Server Init...");
            console.log("Data Connections Init...");
            addConnections();
            console.log("Services Init...");
            servicesKickstart();

        }, function(error) {

            global.config = null;

            console.log("Server Init...");
            console.log("Data Connections Init...");
            addConnections();
            console.log("Services Init...");
            servicesKickstart();
        });

    } catch (e) {
        console.log("ERROR : Server init error.");
        console.log(e);
        global.winston.log('error', e);
    }
});

if (https) {
    https.listen(4731, function() {
        console.log("HTTPS Server started.");
    });
}

//this fucntion add connections to the DB.
function addConnections() {
    //MONGO DB
    setUpMongoDB();
    //setUp Redis
    setUpRedis();
    //ANALYTICS.
    setUpAnalytics();
}

function setUpAnalytics() {
    try {
        console.log("Setting up Analytics...");
        if (process.env["CLOUDBOOST_ANALYTICS_SERVICE_HOST"] || process.env["CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST"]) {
            //this is running on Kubernetes
            console.log("CloudBoost Analytics is running on Kubernetes");

            if(process.env["IS_STAGING"]){
                if (process.env["CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST"]) {
                    global.keys.analyticsUrl = "http://" + process.env["CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST"];
                }
            } else {
                global.keys.analyticsUrl = "http://" + process.env["CLOUDBOOST_ANALYTICS_SERVICE_HOST"];
            }
            console.log(global.keys.analyticsUrl);
            
        } else {
            console.log("Analytics URL : ");
            global.keys.analyticsUrl = "http://localhost:5555"
            console.log(global.keys.analyticsUrl);
        }
    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}

function setUpRedis() {

    try {
        console.log("Setting up Redis...");
        //Set up Redis.
        if (!global.config && !process.env["REDIS_1_PORT_6379_TCP_ADDR"] && !process.env["REDIS_SENTINEL_SERVICE_HOST"] && !process.env["REDIS_PORT_6379_TCP_ADDR"]) {
            console.error("FATAL : Redis Cluster Not found. Use docker-compose from https://github.com/cloudboost/docker or Kubernetes from https://github.com/cloudboost/kubernetes");
        }

        var hosts = [];

        var isCluster = false;

        if (global.config && global.config.redis && global.config.redis.length > 0) {
            //take from config file
            for (var i = 0; i < global.config.redis.length; i++) {
                hosts.push({host: global.config.redis[i].host, port: global.config.redis[i].port, enableReadyCheck: false});

                if (global.config.redis[i].password) {
                    hosts[i].password = global.config.redis[i].password;
                }
            }

            if (global.config.redis.length > 1) {
                isCluster = true;
            }

        } else {

            console.log("Setting up Redis with no config....");
            if (process.env["REDIS_SENTINEL_SERVICE_HOST"]) {
                //this is running on Kubernetes
                console.log("Redis is running on Kubernetes.");

                var obj = {
                    host: process.env["REDIS_SENTINEL_SERVICE_HOST"],
                    port: process.env["REDIS_SENTINEL_SERVICE_PORT"],
                    enableReadyCheck: false
                };
                hosts.push(obj);
            } else {
                //take from env variables.
                console.log("Setting up Redis take from env variables");
                var i = 1;

                if (process.env["REDIS_PORT_6379_TCP_ADDR"] && process.env["REDIS_PORT_6379_TCP_PORT"]) {
                    var obj = {
                        host: process.env["REDIS_PORT_6379_TCP_ADDR"],
                        port: process.env["REDIS_PORT_6379_TCP_PORT"],
                        enableReadyCheck: false
                    };

                    hosts.push(obj);

                } else {
                    while (process.env["REDIS_" + i + "_PORT_6379_TCP_ADDR"] && process.env["REDIS_" + i + "_PORT_6379_TCP_PORT"]) {
                        if (i > 1) {
                            isCluster = true;
                        }
                        var obj = {
                            host: process.env["REDIS_" + i + "_PORT_6379_TCP_ADDR"],
                            port: process.env["REDIS_" + i + "_PORT_6379_TCP_PORT"],
                            enableReadyCheck: false
                        };
                        hosts.push(obj);
                        i++;
                    }

                }
            }
        }

        //If everything else failsm then try local redis.
        if (hosts.length === 0) {
            var obj = {
                host: "127.0.0.1",
                port: "6379",
                enableReadyCheck: false
            };

            hosts.push(obj);
        }

        if (isCluster) {
            global.redisClient = new Redis.Cluster(hosts);

            console.log("Setting up IO adapter");
            io.adapter(ioRedisAdapter({pubClient: new Redis.Cluster(hosts), subClient: new Redis.Cluster(hosts)}));

        } else {

            global.redisClient = new Redis(hosts[0]);

            console.log("Setting up IO adapter");
            io.adapter(ioRedisAdapter({host: hosts[0].host, port: hosts[0].port}));
        }

        global.realTime = require('./database-connect/realTime')(io);

    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}

function setUpMongoDB() {
    //MongoDB connections.

    try {

        console.log("Looking for a MongoDB Cluster...");

        if ((!global.config && !process.env["MONGO_1_PORT_27017_TCP_ADDR"] && !process.env["KUBERNETES_STATEFUL_MONGO_URL"])) {
            console.error("INFO : Not running on Docker. Use docker-compose (recommended) from https://github.com/cloudboost/docker");
        }

        var mongoConnectionString = "mongodb://";

        if (process.env["CLOUDBOOST_MONGODB_USERNAME"] && process.env["CLOUDBOOST_MONGODB_PASSWORD"]) {
            mongoConnectionString += process.env["CLOUDBOOST_MONGODB_USERNAME"] + ":" + process.env["CLOUDBOOST_MONGODB_PASSWORD"] + "@";
        }

        var isReplicaSet = false;

        if (global.config && global.config.mongo && global.config.mongo.length > 0) {

            if (global.config.mongo[0].username && global.config.mongo[0].password) {
                mongoConnectionString += global.config.mongo[0].username + ":" + global.config.mongo[0].password + "@";
            }

            console.log("Setting up MongoDB from config.....");

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
                
                global.config.mongo = process.env["KUBERNETES_STATEFUL_MONGO_URL"].split(',').map(function(x,i){
                    return {
                        host:x.split(':')[0],
                        port:x.split(':')[1]
                    }
                })
        
                mongoConnectionString += process.env["KUBERNETES_STATEFUL_MONGO_URL"]
                isReplicaSet = true;

            } else {

                var i = 1;

                if (process.env["MONGO_PORT_27017_TCP_ADDR"] && process.env["MONGO_PORT_27017_TCP_PORT"]) {
                    global.config.mongo.push({host: process.env["MONGO_PORT_27017_TCP_ADDR"], port: process.env["MONGO_PORT_27017_TCP_PORT"]});

                    mongoConnectionString += process.env["MONGO_PORT_27017_TCP_ADDR"] + ":" + process.env["MONGO_PORT_27017_TCP_PORT"];
                    mongoConnectionString += ",";

                } else {

                    while (process.env["MONGO_" + i + "_PORT_27017_TCP_ADDR"] && process.env["MONGO_" + i + "_PORT_27017_TCP_PORT"]) {
                        console.log("Setting up MongoDB from  process.env....");
                        if (i > 1) {
                            isReplicaSet = true;
                        }

                        global.config.mongo.push({
                            host: process.env["MONGO_" + i + "_PORT_27017_TCP_ADDR"],
                            port: process.env["MONGO_" + i + "_PORT_27017_TCP_PORT"]
                        });

                        mongoConnectionString += process.env["MONGO_" + i + "_PORT_27017_TCP_ADDR"] + ":" + process.env["MONGO_" + i + "_PORT_27017_TCP_PORT"];
                        mongoConnectionString += ",";
                        i++;
                    }
                }
            }
        }

        //if no docker/kubernetes or local config then switch to localhost.
        if (mongoConnectionString === "mongodb://") {

            global.config.mongo = [];
            global.config.mongo.push({host: "localhost", port: "27017"});

            mongoConnectionString += "localhost:27017";
            mongoConnectionString += ",";
        }

        mongoConnectionString = mongoConnectionString.substring(0, mongoConnectionString.length - 1);
        mongoConnectionString += "/"; //de limitter.
        global.keys.mongoConnectionString = mongoConnectionString;

        console.log("MongoDb connection string:" + global.keys.mongoConnectionString);

        if (isReplicaSet) {
            console.log("MongoDB is in ReplicaSet");
            var str = "?replicaSet=cloudboost&slaveOk=true&maxPoolSize=200&ssl=false&connectTimeoutMS=30000&socketTimeoutMS=30000&w=1&wtimeoutMS=30000";
            global.keys.mongoConnectionString += str;
        }

    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}

//to kickstart database services
function servicesKickstart() {
    try {
        console.log("Kickstart database services..");

        var db = require('./database-connect/mongoConnect.js')().connect();
        db.then(function(db) {
            try {
                global.mongoClient = db;
                //Init Secure key for this cluster. Secure key is used for Encryption / Creating apps , etc.
                global.keyService.initSecureKey().then(function(key) {
                    console.log("Registering Cluster...");
                    global.serverService.registerServer(key).then(function() {
                        console.log("Cluster Registered.");
                    }, function(error) {
                        console.log("Cluster registration failed.");
                        console.log(error);
                    });
                }, function(error) {
                    console.log("Failed to register the cluster.");
                });
                //Cluster Key is used to differentiate which cluster is the request coming from in Analytics.
                global.keyService.initClusterKey();
                attachServices();
                attachAPI();
                if (!process.env.CBENV || process.env.CBENV === 'STAGING')
                    attachDbDisconnectApi();
                attachCronJobs();
            } catch (e) {
                console.log(e);
                global.winston.log('error', {
                    "error": String(e),
                    "stack": new Error().stack
                });
            }
        }, function(err) {
            console.log("Cannot connect to MongoDB.");
            console.log(err);
            // exit server if connection to mongo was not made
            process.exit(1)
        });

    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}

function attachDbDisconnectApi() {
    try {
        console.log("attachDbDisconnectApi..");
        require('./api/db/mongo.js')();
    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}

function attachCronJobs() {
    try {
        console.log("attachCronJobs..");
        require('./cron/expire.js');
        app.use(function(req,res,next){

    res.json({status : 404,message : 'The endpoint was not found. Please check.'});

});
    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}

function _setSession(req, res) {
    try {
        console.log("_setSession..");
        if (!req.session) {
            req.session = {};
            req.session.id = global.uuid.v1();
        }

        console.log('Attaching a session to the header ' + req.session.id);
        res.header('sessionID', req.session.id);

        var obj = {
            id: req.session.id,
            userId: null,
            loggedIn: false,
            appId: null,
            email: null,
            roles: null
        };

        req.session = obj;
        var expireDays = 30; //Default
        global.sessionHelper.saveSession(obj, expireDays);

    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}

function _checkFileExists(filePath) {

    var deferred = q.defer();

    try {

        fs.readFile(filePath, function(err, data) {
            if (err) {
                console.log(err);
                return deferred.reject(err);
            }
            deferred.resolve(data);
        });

    } catch (err) {
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }

    return deferred.promise;
}

function _isJSON(json) {
    //String
    if (json && typeof(json) === "string") {
        try {
            JSON.parse(json);
            return true;
        } catch (e) {
            return false;
        }

    } else {
        return _.isObject(json);
    }

    return false;
}
