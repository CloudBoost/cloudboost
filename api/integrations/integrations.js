var q = require('q');
var integrationServices = require('../../services/integrationServices')();

module.exports = function () {
    global.app.post('/integration', function (req, res) {

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

                var integration_api = ["slack", "zapier"];
                global.appService.getAllSettings(appId).then(function (settings) {
                    var integrationSettings;
                    settings.forEach(function (element) {
                        if (element.category == "integrations") {
                            integrationSettings = element.settings;
                        }
                    }, this);

                    for (var i = 0; i < integration_api.length; i++) {
                        switch (integration_api[i]) {
                            case "slack":
                                if (integrationSettings.slack.enabled) {
                                    console.log("Slack Enabled");
                                    integrationServices.notifyOnSlack(integrationSettings.slack, event_type, user);
                                } else {
                                    console.log("Slack Disabled");
                                }
                                break;
                            case "zapier":
                                if (integrationSettings.zapier.enabled) {
                                    console.log("Zapier Enabled");
                                    integrationServices.notifyOnZapier(integrationSettings.zapier, event_type, user);
                                } else {
                                    console.log("Zapier Disabled");
                                }
                                break;
                            default:
                                console.log("Settings Schema not updated to work with event");
                                var status = "Please update Database to work with events.";
                                response.settings = slackSettings;
                                return res.status(401).send(status);
                        }
                    }
                    return res.status(200).send("Notifications are being sent");
                });
            } else {
                console.log("Key not valid");
                var status = "Key Verification Failed";
                return res.status(404).json(status);
            }
        });

    });
}