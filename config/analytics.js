var config = require('./config');

module.exports = function () {
    config.analyticsUrl = retrieveUrl();
};

function retrieveUrl () {
    if (process.env["CLOUDBOOST_ANALYTICS_SERVICE_HOST"] || process.env["CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST"]) {
        //this is running on Kubernetes
        if (process.env["IS_STAGING"]) {
            if (process.env["CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST"]) {
                return "http://" + process.env["CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST"];
            }
        } else {
            return "http://" + process.env["CLOUDBOOST_ANALYTICS_SERVICE_HOST"];
        }
    } else {
        return "http://localhost:5555";
    }
}