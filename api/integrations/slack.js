var q = require('q');
var Slack = require('slack-node');

module.exports = function () {
    global.app.post('/integration/slack', function (req, res) {

        var appId = req.body.appid;
        var appkey = req.body.appkey;
        var event_type = req.body.event_type;
        var user = req.body.user;

        console.log(appId, appkey, event_type);

        global.appService.isKeyValid(appId, appkey).then(function (isKeyValid) {
            if (isKeyValid) {

                if (global.mongoDisconnected) {
                    return res.status(500).send('Storage Services are temporarily down');
                }

                var slack = new Slack();
                global.appService.getAllSettings(appId).then(function (settings) {
                    settings
                    var slackSettings;
                    settings.forEach(function (element) {
                        if (element.category == "integrations") {
                            slackSettings = element.settings.slack;
                        }
                    }, this);
                    slack.setWebhook(slackSettings.webhook_url);
                    var text;
                    if (slackSettings.enabled === true) {
                        switch (event_type) {
                            case "login":
                                if (slackSettings.loginNotify === true) {
                                    console.log("Login Event enabled");
                                    text = "A User Logged into the System with Email-Id : " + user.email;
                                } else {

                                }
                                break;
                            case "signup":
                                if (slackSettings.signUpNotify === true) {
                                    console.log("Login Event enabled");
                                    text = "A User SIgned into the System with Email-Id : " + user.email;
                                }
                                break;
                            default:
                                console.log(event_type + " Event enabled");
                                text = "A User with Email-Id: " + user.email + " enabled " + event_type + " type of event";
                        }
                        if (text) {
                            slack.webhook({
                                channel: "#general",
                                username: "webhookbot",
                                text: text
                            }, function (err, response) {
                                console.log(response);
                            });
                            return res.status(200).send("Slack Notification Sent for " + event_type + " type of event");

                        } else {
                            return res.status(401).send("Slack Notification for " + event_type + " type of event not enabled");

                        }
                    } else {
                        console.log("Settings Schema not updated to work with events");
                        var status = "Please update Database to work with events.";
                        response.settings = slackSettings;
                        return res.status(401).send(status);
                    }
                });
            } else {
                console.log("Key not valid");
                var status = "Key Verification Failed";
                return res.status(404).json(status);
            }
        });

    });
}