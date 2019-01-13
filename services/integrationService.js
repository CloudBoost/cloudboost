/* eslint camelcase : 0 */
const Slack = require('slack-node');
const request = require('request');
const winston = require('winston');
const appService = require('../services/app');

function notifyOnSlack(integrationSettings, document, appName) {
  let apiToken;
  if (integrationSettings.oauth_response) {
    apiToken = integrationSettings.oauth_response.data.access_token;
  } else {
    return;
  }
  const slack = new Slack(apiToken);
  const timeStamp = Math.floor(Date.now() / 1000);

  // req data
  const event_type = document.name;
  const user = document.data.username;
  const user_email = document.data.email;

  let text; let title; let color; let
    channel;
  switch (event_type) {
    case 'Login':
      if (integrationSettings.Login && integrationSettings.Login.notify === true) {
        title = 'Login';
        text = `A user just logged in to ${appName} application`;
        color = '#36a64f';
        channel = integrationSettings.Login.channel_name;
      }
      break;
    case 'Signup':
      if (integrationSettings.Signup && integrationSettings.Signup.notify === true) {
        title = 'Sign Up';
        text = `A new user just signed up for your ${appName} application`;
        color = '#5CACEE';
        channel = integrationSettings.Signup.channel_name;
      }
      break;
    default:
      if (integrationSettings[event_type] && integrationSettings[event_type].notify === true) {
        title = event_type;
        color = '#9932CC';
        channel = integrationSettings[event_type].channel_name;
      }
  }
  if (title) {
    slack.api('chat.postMessage', {
      channel: `#${channel}`,
      attachments: JSON.stringify([{
        fallback: 'Whenever a User Triggers any event  a notification will appear here',
        color,
        pretext: text,
        author_name: 'Event Notifications',
        author_link: 'https://www.cloudboost.io/',
        // eslint-disable-next-line max-len
        author_icon: 'https://d1qb2nb5cznatu.cloudfront.net/startups/i/490103-917cc2864d0246e313e9521971422f09-medium_jpg.jpg?buster=1430997518',
        title: `User ${event_type} Notification`,
        title_link: 'https://www.cloudboost.io/',
        fields: [
          {
            title: 'User Name',
            value: user,
            short: false,
          },
          {
            title: 'User Email',
            value: user_email,
            short: false,
          },
        ],
        footer: 'CloudBoost',
        // eslint-disable-next-line max-len
        footer_icon: 'https://d1qb2nb5cznatu.cloudfront.net/startups/i/490103-917cc2864d0246e313e9521971422f09-medium_jpg.jpg?buster=1430997518',
        ts: timeStamp,
      },
      ]),
    }, () => {});
  }
}

function notifyOnZapier(integrationSettings, document, collection_name, table_event) {
  const { zapier_events } = integrationSettings;
  const zapier_webhook = integrationSettings.webhook_url || null;
  let eventObject = null;
  for (let i = 0; i < zapier_events.length; i++) {
    if (collection_name === zapier_events[i].tableName) {
      eventObject = zapier_events[i];
    }
  }
  if (eventObject && eventObject[table_event] && zapier_webhook) {
    const headers = {
      'User-Agent': 'Super Agent/0.0.1',
      'Content-Type': 'application/json',
    };

    const options = {
      url: zapier_webhook,
      method: 'POST',
      headers,
      json: document,
    };

    request(options, () => {});
  }
}

const integrationService = {
  async integrationNotification(appId, document, collection_name, table_event) {
    const integration_api = ['slack', 'zapier'];
    try {
      const application = await appService.getApp(appId);
      const appName = application.name;
      const settings = await appService.getAllSettings(appId);
      let integrationSettings;
      settings.forEach((element) => {
        if (element.category === 'integrations') {
          integrationSettings = element.settings;
        }
      }, this);
      if (integrationSettings) {
        for (let i = 0; i < integration_api.length; i++) {
          switch (integration_api[i]) {
            case 'slack':
              if (collection_name === '_Event' && integrationSettings.slack.enabled) {
                notifyOnSlack(integrationSettings.slack, document, appName);
              }
              break;
            case 'zapier':
              if (integrationSettings.zapier.enabled) {
                notifyOnZapier(integrationSettings.zapier, document, collection_name, table_event, appName);
              }
              break;
            default:
              break;
          }
        }
      }
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
    }
  },
};

module.exports = integrationService;
