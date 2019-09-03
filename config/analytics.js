const config = require('./config');

function retrieveUrl() {
  if (process.env.CLOUDBOOST_ANALYTICS_SERVICE_HOST
    || process.env.CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST) {
    // this is running on Kubernetes
    if (process.env.IS_STAGING) {
      if (process.env.CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST) {
        return `http://${process.env.CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST}`;
      }
      return null;
    }
    return `http://${process.env.CLOUDBOOST_ANALYTICS_SERVICE_HOST}`;
  }
  return 'http://localhost:5555';
}

module.exports = () => { config.analyticsUrl = retrieveUrl(); };
