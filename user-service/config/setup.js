/* eslint-disable max-len
 */
const winston = require('winston');
const keys = require('./keys');

module.exports = {
  setUpDataServices() {
    try {
      if (process.env.API_PORT_4730_TCP_ADDR || process.env[`API_${1}_PORT_4730_TCP_ADDR`]) {
        keys.dataServiceUrl = `http://${process.env.API_PORT_4730_TCP_ADDR || process.env[`API_${1}_PORT_4730_TCP_ADDR`]}:4730`;
      }

      if (process.env.IS_STAGING) {
        if (process.env.CLOUDBOOST_API_STAGING_SERVICE_HOST) {
          keys.dataServiceUrl = `http://${process.env.CLOUDBOOST_API_STAGING_SERVICE_HOST}:${process.env.CLOUDBOOST_API_STAGING_SERVICE_PORT}`;
        }
      } else if (process.env.CLOUDBOOST_API_SERVICE_HOST) {
        keys.dataServiceUrl = `http://${process.env.CLOUDBOOST_API_SERVICE_HOST}:${process.env.CLOUDBOOST_API_SERVICE_PORT_CLOUDBOOST}`;
      }

      winston.info(`Data Services URL : ${keys.dataServiceUrl}`);
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  },

  setUpAnalyticsServer() {
    try {
      if (process.env.CLOUDBOOST_ANALYTICS_SERVICE_HOST || process.env.CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST) {
        winston.info('Analytics is running on Kubernetes');

        if (process.env.IS_STAGING) {
          if (process.env.CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST) {
            keys.analyticsServiceUrl = `http://${process.env.CLOUDBOOST_ANALYTICS_STAGING_SERVICE_HOST}:${process.env.CLOUDBOOST_ANALYTICS_STAGING_SERVICE_PORT}`;
          }
        } else {
          keys.analyticsServiceUrl = `http://${process.env.CLOUDBOOST_ANALYTICS_SERVICE_HOST}:${process.env.CLOUDBOOST_ANALYTICS_SERVICE_PORT}`;
        }

        winston.info(`Analytics URL: ${keys.analyticsServiceUrl}`);
      } else {
        if (process.env.ANALYTICS_PORT_5555_TCP_ADDR || process.env[`ANALYTICS_${1}_PORT_5555_TCP_ADDR`]) {
          keys.analyticsServiceUrl = `http://${process.env.ANALYTICS_PORT_5555_TCP_ADDR || process.env[`ANALYTICS_${1}_PORT_5555_TCP_ADDR`]}:5555`;
        }
        winston.info(`Analytics URL: ${keys.analyticsServiceUrl}`);
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  },
};
