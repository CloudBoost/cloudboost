const slack = require('winston-bishop-slack').Slack;
const winston = require('winston');
const logglyTransport = require('winston-loggly-transport');
const config = require('./config');


module.exports = () => {
  winston.level = config.env === 'development' ? 'debug' : 'info';

  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console, {
    level: 'debug',
    colorize: true,
    stderrLevels: ['error', 'debug', 'info'],
  });

  if (config.logglySubDomain) {
    const logglyTags = config.logglyTags ? config.logglyTags.split(',') : [];
    winston.add(logglyTransport, {
      token: config.logToken,
      subdomain: config.logglySubDomain,
      tags: logglyTags,
      json: true,
      level: 'info',
    });
  }

  // add slack transport if API key found
  if (config.slackWebHook) {
    winston.add(slack, {
      webhook_url: config.slackWebHook,
      icon_url: config.slackIconUrl,
      channel: config.slackChannel,
      username: `API ERROR BOT - ${config.env}`,
      level: 'error',
      handleExceptions: true,
      customFormatter(level, message, meta) {
        return {
          attachments: [{
            fallback: `An Error occured on API POD in - ${config.env}`,
            pretext: `An Error occured on API POD in - ${config.env}`,
            color: '#D00000',
            fields: [{
              title: meta.error,
              value: meta.stack,
              short: false,
            }],
          }],
        };
      },
    });
  }
};
