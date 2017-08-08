var Slack = require('slack-node');

module.exports = function () {


    return {
        integrationNotification: function (appId, document) {
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
                                    notifyOnSlack(integrationSettings.slack, document);
                                }
                                break;
                            // case "zapier":
                            //     if (integrationSettings.zapier.enabled) {
                            //         notifyOnZapier(integrationSettings.zapier, document);
                            //     }
                            //     break;
                        }
                    }
                }

            });
        }
    }

}

function notifyOnSlack(integrationSettings, document) {
    var slack = new Slack();
    var timeStamp = Math.floor(Date.now() / 1000);

    //req data
    var event_type = document.name;
    var user = document.data.username;
    var user_email = document.data.email;

    slack.setWebhook(integrationSettings.webhook_url);
    var text, image, title, color;
    switch (event_type) {
        case "Login":
            if (integrationSettings.loginNotify === true) {
                title = "Login";
                text = "A user just logged in to " + global.appName + " application"
                color = "#36a64f"
            }
            break;
        case "Signup":
            if (integrationSettings.signUpNotify === true) {
                title = "Sign Up";
                text = "A new user just signed up for your " + global.appName + " application"
                color = "#5CACEE";
            }
            break;
        default:
            title = event_type;
            color = "#9932CC";
    }
    if (title) {
        slack.webhook({
            channel: "#general",
            username: "CloudBoost",
            attachments: [
                {
                    "fallback": "Whenever a User Triggers any event  a notification will appear here",
                    "color": color,
                    "pretext": text,
                    "author_name": "Event Notifications",
                    "author_link": "https://www.cloudboost.io/",
                    "author_icon": "https://d1qb2nb5cznatu.cloudfront.net/startups/i/490103-917cc2864d0246e313e9521971422f09-medium_jpg.jpg?buster=1430997518",
                    "title": "User " + event_type + " Notification",
                    "title_link": "https://www.cloudboost.io/",
                    // "text": text,
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
