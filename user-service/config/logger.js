const winston = require('winston');
const slack = require('winston-bishop-slack').Slack;
const logglyTransport = require('winston-loggly-transport');
const keys = require('./keys');

module.exports = () => {
  winston.level = process.env.NODE_ENV !== 'test' ? 'debug' : 'info';
  const consoleLevels = process.env.NODE_ENV !== 'test' ? ['error', 'debug', 'info'] : ['info'];
  winston.configure({
    transports: [
      new (winston.transports.Console)({ level: winston.level, colorize: true, stderrLevels: consoleLevels }),
    ],
  });

  // add Loggly transport if API key found
  if (keys.logToken) {
    winston.add(logglyTransport, {
      token: keys.logToken,
      subdomain: 'cloudboost',
      tags: ['frontend-server'],
      json: true,
    });
  }

  // add slack transport if API key found
  if (keys.slackWebHook) {
    const envVal = process.env.IS_STAGING
      ? 'STAGING'
      : 'PRODUCTION';
    winston.add(slack, {
      webhook_url: keys.slackWebHook,
      icon_url: 'https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/caution-128.png',
      channel: '#devlogs',
      username: `USER-SERVICE ERROR - ${envVal}`,
      level: 'error',
      handleExceptions: true,
      customFormatter(level, message, meta) {
        return {
          attachments: [
            {
              fallback: `An Error occured on user-service POD in - ${envVal}`,
              pretext: `An Error occured on user-service POD in - ${envVal}`,
              color: '#D00000',
              fields: [
                {
                  title: meta.error,
                  value: meta.stack,
                  short: false,
                },
              ],
            },
          ],
        };
      },
    });
  }
};
