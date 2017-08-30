var Slack = require('slack-node');
var http = require("https");
var querystring = require('querystring');
var request = require('request');

module.exports = function () {


    return {
        integrationNotification: function (appId, document, collection_name, table_event) {
            var integration_api = ["slack", "zapier"];
            global.appService.getApp(appId).then(function (application) {
                var appName = application.name;
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
                                    if (collection_name == "_Event" && integrationSettings.slack.enabled) {
                                        notifyOnSlack(integrationSettings.slack, document, appName);
                                    }
                                    break;
                                case "zapier":
                                    if (integrationSettings.zapier.enabled) {
                                        notifyOnZapier(integrationSettings.zapier, document, collection_name, table_event, appName);
                                    }
                                    break;
                            }
                        }
                    }

                });
            });
        }
    }

}

function notifyOnSlack(integrationSettings, document, appName) {
    var apiToken;
    if (integrationSettings.oauth_response) {
        apiToken = integrationSettings.oauth_response.data.access_token;
    } else {
        return;
    }
    var slack = new Slack(apiToken);
    var timeStamp = Math.floor(Date.now() / 1000);

    //req data
    var event_type = document.name;
    var user = document.data.username;
    var user_email = document.data.email;

    var text, image, title, color, channel;
    switch (event_type) {
        case "Login":
            if (integrationSettings["Login"] && integrationSettings["Login"].notify === true) {
                title = "Login";
                text = "A user just logged in to " + appName + " application"
                color = "#36a64f";
                channel = integrationSettings["Login"].channel_name;
            }
            break;
        case "Signup":
            if (integrationSettings["Signup"] && integrationSettings["Signup"].notify === true) {
                title = "Sign Up";
                text = "A new user just signed up for your " + appName + " application"
                color = "#5CACEE";
                channel = integrationSettings["Signup"].channel_name;
            }
            break;
        default:
            if (integrationSettings[event_type] && integrationSettings[event_type].notify === true) {
                title = event_type;
                color = "#9932CC";
                channel = integrationSettings[event_type].channel_name;
            }
    }
    if (title) {
        slack.api('chat.postMessage', {
            channel: "#" + channel,
            attachments: JSON.stringify([{
                "fallback": "Whenever a User Triggers any event  a notification will appear here",
                "color": color,
                "pretext": text,
                "author_name": "Event Notifications",
                "author_link": "https://www.cloudboost.io/",
                "author_icon": "https://d1qb2nb5cznatu.cloudfront.net/startups/i/490103-917cc2864d0246e313e9521971422f09-medium_jpg.jpg?buster=1430997518",
                "title": "User " + event_type + " Notification",
                "title_link": "https://www.cloudboost.io/",
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
            ])
        }, function (err, response) {
            console.log(response);
        });
        return true;
    }
    return false;
}

function notifyOnZapier(integrationSettings, document, collection_name, table_event, appName) {
    var zapier_events = integrationSettings.zapier_events;
    var zapier_webhook = integrationSettings.webhook_url || null;
    var eventObject = null;
    for (var i = 0; i < zapier_events.length; i++) {
        if (collection_name === zapier_events[i].tableName) {
            eventObject = zapier_events[i];
        }
    }
    if (eventObject && eventObject[table_event] && zapier_webhook) {
        var headers = {
            'User-Agent':       'Super Agent/0.0.1',
            'Content-Type':     'application/json'
        }

        var options = {
            url: zapier_webhook,
            method: 'POST',
            headers: headers,
            json: document
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        })
    }
}


