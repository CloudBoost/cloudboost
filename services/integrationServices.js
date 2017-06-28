var Slack = require('slack-node');

module.exports = function () {

    var timeStamp = Math.floor(Date.now() / 1000);

    return {
        notifyOnSlack: function (integrationSettings, event_type, user, user_email) {
            var slack = new Slack();
            slack.setWebhook(integrationSettings.webhook_url);
            var text, image, title, color;
            switch (event_type) {
                case "Login":
                    if (integrationSettings.loginNotify === true) {
                        console.log("Slack Login Event enabled");
                        text = "A User Signed into the System with Email-Id : " + user.email;
                        title = "Login";
                        color = "#36a64f"
                        image = "https://premium.wpmudev.org/blog/wp-content/uploads/2012/01/login-big.jpg"
                    } else {
                        console.log("Slack Login Event Disabled");
                    }
                    break;
                case "Signup":
                    if (integrationSettings.signUpNotify === true) {
                        console.log("Slack Sign Up Event enabled");
                        text = "A User Signed into the System with Email-Id : " + user.email;
                        title = "Sign Up";
                        color = "#5CACEE";
                        image = "https://www.seoclerk.com/pics/want29404-1GnJBq1437506316.jpg"
                    } else {
                        console.log("Slack SingUp Event Disabled");
                    }
                    break;
                default:
                    console.log(event_type + " Event enabled");
                    title = event_type;
                    color = "#9932CC";
                    text = "A User with Email-Id: " + user.email + " enabled " + event_type + " type of event";
                    image = "https://upload.wikimedia.org/wikipedia/commons/9/92/Random_Encounters_%22RE%22_logo.png"
            }
            if (text) {
                slack.webhook({
                    channel: "#general",
                    username: "CloudBoost",
                    attachments: [
                        {
                            "fallback": "Required plain-text summary of the attachment.",
                            "color": color,
                            "pretext": "Optional text that appears above the attachment block",
                            "author_name": "Event Notifications",
                            "author_link": "http://flickr.com/bobby/",
                            "author_icon": "http://flickr.com/icons/bobby.jpg",
                            "title": event_type + " Slack Notification",
                            "title_link": "https://api.slack.com/",
                            "text": "Optional text that appears within the attachment",
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
                            "image_url": "http://my-website.com/path/to/image.jpg",
                            "thumb_url": "http://example.com/path/to/thumb.png",
                            "footer": "CloudBoost",
                            "footer_icon": "https://d1qb2nb5cznatu.cloudfront.net/startups/i/490103-917cc2864d0246e313e9521971422f09-medium_jpg.jpg?buster=1430997518",
                            "ts": timeStamp
                        }
                    ],
                    icon_emoji: "https://d1qb2nb5cznatu.cloudfront.net/startups/i/490103-917cc2864d0246e313e9521971422f09-medium_jpg.jpg?buster=1430997518"
                }, function (err, response) {
                    if (!err) {
                        console.log(response);
                    }
                });
                return true;
            }
            return false;
        },

        notifyOnZapier: function (integrationSettings, event_type, user, user_email) {
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



