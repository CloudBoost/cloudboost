var Slack = require('slack-node');

module.exports = function () {


    return {
        integrationsNotifications: function (appId, document) {
            var integration_api = ["slack", "zapier"];
            global.appService.getAllSettings(appId).then(function (settings) {
                var integrationSettings;
                settings.forEach(function (element) {
                    if (element.category == "integrations") {
                        integrationSettings = element.settings;
                    }
                }, this);

                if (integrationSettings) {
                    for (var i = 0; i < integration_api.length; i++) {
                        switch (integration_api[i]) {
                            case "slack":
                                if (integrationSettings.slack.enabled) {
                                    console.log("Slack Enabled");
                                    notifyOnSlack(integrationSettings.slack, document.name, document.data.username, document.data.email);

                                } else {
                                    console.log("Slack Disabled");
                                }
                                break;
                            case "zapier":
                                if (integrationSettings.zapier.enabled) {
                                    console.log("Zapier Enabled");
                                    this.notifyOnZapier(integrationSettings.zapier, document.name, document.data.username, document.data.email);
                                } else {
                                    console.log("Zapier Disabled");
                                }
                                break;
                            default:
                                console.log("Settings Schema not updated to work with event");
                                return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }

            });
        }
    }

}

function notifyOnSlack(integrationSettings, event_type, user, user_email) {
    var slack = new Slack();
    var timeStamp = Math.floor(Date.now() / 1000);
    
    slack.setWebhook(integrationSettings.webhook_url);
    var text, image, title, color;
    switch (event_type) {
        case "Login":
            if (integrationSettings.loginNotify === true) {
                console.log("Slack Login Event enabled");
                text = "A User just Logged In"
                title = "Login";
                color = "#36a64f"
            } else {
                console.log("Slack Login Event Disabled");
            }
            break;
        case "Signup":
            if (integrationSettings.signUpNotify === true) {
                console.log("Slack Sign Up Event enabled");
                text = "A New User just Signed Up";
                title = "Sign Up";
                color = "#5CACEE";
            } else {
                console.log("Slack SingUp Event Disabled");
            }
            break;
        default:
            console.log(event_type + " Event enabled");
            title = event_type;
            color = "#9932CC";
            text = "A User just created an Event";
    }
    if (text) {
        slack.webhook({
            channel: "#test",
            username: "CloudBoost",
            attachments: [
                {
                    "fallback": "Whenever a User Signs Up a notification will appear here",
                    "color": color,
                    "pretext": "Optional text that appears above the attachment block",
                    "author_name": "Event Notifications",
                    "author_link": "https://www.cloudboost.io/",
                    "author_icon": "https://d1qb2nb5cznatu.cloudfront.net/startups/i/490103-917cc2864d0246e313e9521971422f09-medium_jpg.jpg?buster=1430997518",
                    "title": "User " + event_type + " Notification",
                    "title_link": "https://www.cloudboost.io/",
                    "text": text,
                    "fields": [
                        {
                            "title": "User Name",
                            "value": user,
                            "short": false
                        },
                        {
                            "title": "User Email",
                            "value": user_email,
                            "short": false
                        }
                    ],
                    "footer": "CloudBoost",
                    "footer_icon": "https://d1qb2nb5cznatu.cloudfront.net/startups/i/490103-917cc2864d0246e313e9521971422f09-medium_jpg.jpg?buster=1430997518",
                    "ts": timeStamp
                }
            ],
            icon_emoji: "https://d1qb2nb5cznatu.cloudfront.net/startups/i/490103-917cc2864d0246e313e9521971422f09-medium_jpg.jpg?buster=1430997518"
        }, function (err, response) {
            if (!err) {
                console.log(response);
            } else {
                console.log(err);
            }
        });
        return true;
    }
    return false;
}

function notifyOnZapier(integrationSettings, event_type, user, user_email) {
    var text;
    switch (event_type) {
        case "login":
            if (integrationSettings.loginNotify === true) {
                console.log("Zapier Login Event enabled");
                text = "A User Logged into the System with Email-Id : " + user.email;
            } else {
                console.log("Zapier Login Event Disabled");
            }
            break;
        case "signup":
            if (integrationSettings.signUpNotify === true) {
                console.log("Zapier Login Event enabled");
                text = "A User SIgned into the System with Email-Id : " + user.email;
            } else {
                console.log("Zapier SingUp Event Disabled");
            }
            break;
        default:
            console.log(event_type + " Event enabled");
            text = "A User with Email-Id: " + user.email + " enabled " + event_type + " type of event";
    }
    if (text) {
        //call to api
        return true;
    } else {
        return false;
    }
}
