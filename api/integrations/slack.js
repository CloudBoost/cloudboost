var q = require('q');
var Slack = require('slack-node');

module.exports = function () {
    global.app.post('/slack', function (req, res) {

        var appId = req.body.appid;
        var appkey = req.body.appkey;
        var event_type = req.body.event_type;
        var user = req.body.user;

        console.log(appId, appkey, event_type);

        var response = { appid: req.body.appid, status: "", user: user }

        global.appService.isMasterKey(appId, appkey).then(function (isMasterKey) {
            if (isMasterKey) {

                if (global.mongoDisconnected) {
                    return res.status(500).send('Storage Services are temporarily down');
                }

                console.log("in1");
                var slack = new Slack();
                global.appService.getSettings(appId, { "category": "integrations" }).then(function (settings) {
                    console.log("in2", settings);
                    var slackSettings = settings[0].settings.slack;
                    slack.setWebhook(slackSettings.webhook_url);
                    console.log(slackSettings, "Settings")
                    if (slackSettings.enabled === true) {
                        if (event_type == "login" && slackSettings.loginNotify === true) {
                            console.log("Login Event enabled");
                            slack.webhook({
                                channel: "#general",
                                username: "webhookbot",
                                text: "A User Logged into the System with Email-Id : " + user.email
                            }, function(err, response){
                                console.log(response);
                            });
                            response.status = "Login Notification Active & Sent";
                            return res.json(response);
                        } else if (event_type == "signup" && slackSettings.signUpNotify === true) {
                            console.log("Sign Up Event enabled");
                            slack.webhook({
                                channel: "#general",
                                username: "webhookbot",
                                text: "A User Signed Up into the System with Email-Id : " + user.email 
                            }, function(err, response){
                                console.log(response);
                            });
                            response.status = "Sign Up Notification Active & Sent";
                            return res.json(response);
                        } else {
                            console.log("Events are disabled");
                            response.status = "Desired Events are disabled";
                            response.settings = slackSettings;
                        }
                    } else {
                        console.log("Settings Schema not updated to work with events");
                        response.status = "Please update Database to work with events.";
                        response.settings = slackSettings;
                        return res.json(response);
                    }
                });
            } else {
                console.log("MasterKey not valid");
                response.status = "Master Key Verification Failed";
                return res.json(response);
            }
        });

    });
}