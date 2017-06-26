var Slack = require('slack-node');


module.exports = function () {
    return {
        notifyOnSlack: function (integrationSettings, event_type, user) {
            var slack = new Slack();
            slack.setWebhook(integrationSettings.webhook_url);
            var text;
            switch (event_type) {
                case "login":
                    if (integrationSettings.loginNotify === true) {
                        console.log("Slack Login Event enabled");
                        text = "A User Logged into the System with Email-Id : " + user.email;
                    } else {
                        console.log("Slack Login Event Disabled");
                    }
                    break;
                case "signup":
                    if (integrationSettings.signUpNotify === true) {
                        console.log("Slack Sign Up Event enabled");
                        text = "A User Signed into the System with Email-Id : " + user.email;
                    } else {
                        console.log("Slack SingUp Event Disabled");
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
                    if (!err) {
                        console.log(response);
                    }
                });
                return true;
            }
            return false;
        },

        notifyOnZapier: function (integrationSettings, event_type, user) {
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
    }

}



