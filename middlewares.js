var q = require('q');
var apiTracker = require('./database-connect/apiTracker');
var utilHelper = require('./helpers/util');
var sessionHelper = require('./helpers/session');
var appService = require('./services/app');
var uuid = require('uuid');
var winston = require('winston');

module.exports = function (app) {

    app.use(function(req, res, next) {
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
    app.use(function(req, res, next) {
        try {

            if (req.text && utilHelper._isJSON(req.text)) {
                req.body = JSON.parse(req.text);
            }

            if (req.body && typeof(req.body) === "string" && utilHelper._isJSON(req.body)) {
                req.body = JSON.parse(req.body);
            }

            //INVALIDATE CACHE FOR API
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
            res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
            res.setHeader("Expires", "0"); // Proxies.

            next();
        } catch (e) {
            winston.log('error', {
                "error": String(e),
                "stack": new Error().stack
            });
            //cannot convert to JSON.
            next();
        }
    });

    app.use([
        '/file/:appId',
        '/data/:appId',
        '/app/:appId/:tableName',
        '/user/:appId'
        ], function(req, res, next) {
        //This is the Middleware for authenticating the app access using appID and key
        //check if all the services are loaded first.

        try {

            if (req.text && utilHelper._isJSON(req.text)) {
                req.body = JSON.parse(req.text);
            }

            if (req.body && typeof(req.body) === "string" && utilHelper._isJSON(req.body)) {
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

                    //check if app is in the plan.
                    var promises = [];
                    promises.push(apiTracker.isInPlanLimit(appId));
                    promises.push(appService.isKeyValid(appId, appKey));
                    q.all(promises).then(function(result) {
                        var isAppKeyValid = result[1];
                        var isInPlan = result[0];
                        if (!isInPlan) {
                            //check if the appIsReleased.
                            apiTracker.log(appId, "isReleased/isReleased", "", "JavaScript", true);

                            return res.status(402).send("Reached Plan Limit. Upgrade Plan.");
                        }

                        if (!isAppKeyValid) {
                            return res.status(401).send("App ID or App Key is invalid.");
                        } else {
                            next();
                        }

                    }, function(err) {
                        return res.status(500).send(err.message);
                    });
                }
            }

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }

    });

    app.use(function(req, res, next) {

        try {
            // Middleware for retrieving sessions

            res.header('Access-Control-Expose-Headers', 'sessionID');

            if (req.headers.sessionid) {

                res.header('sessionID', req.headers.sessionid);
                sessionHelper.getSession(req.headers.sessionid, function(err, session) {
                    if (!err) {
                        req.session = session;
                        next();
                    } else {
                        req.session = {};
                        req.session.id = req.header.sessionid;
                        next();
                    }
                });
            } else {

                _setSession(req, res);
                next();
            }

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }

    });
};

function ignoreUrl(requestUrl) {

    try {
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
            }
        }
        return false;

    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}


function _setSession(req, res) {
    try {

        if (!req.session) {
            req.session = {};
            req.session.id = uuid.v1();
        }

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
        sessionHelper.saveSession(obj, expireDays);
    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}
