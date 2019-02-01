
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
/* eslint camelcase: 0 */

const _ = require('underscore');
const jsdom = require('jsdom');
const fs = require('fs');
const q = require('q');
const winston = require('winston');
const mandrill = require('mandrill-api/mandrill');
const nodemailer = require('nodemailer');
const mailgun = require('nodemailer-mailgun-transport');
const appService = require('../services/app');
const keyService = require('../database-connect/keyService');
const smtpConfig = require('../config/config').smtp;
const { getNestedValue: gnv } = require('../helpers/util');

/* Desc   : Send Email through Mandrill
  Params : emailSettings Json
  Returns: Promise
           Resolve->Success Message
           Reject-> Failure message to send
*/
function _mandrill(emailSettings) {
  const deferred = q.defer();

  try {
    const mandrillClient = new mandrill.Mandrill(emailSettings.apiKey);

    const message = {
      html: emailSettings.template,
      subject: emailSettings.subject,
      from_email: emailSettings.fromEmail,
      from_name: emailSettings.fromName,
      to: [{
        email: emailSettings.emailTo,
      }],
    };

    const async = false;

    mandrillClient.messages.send({
      message, async, ip_pool: null, send_at: null,
    }, (result) => {
      if (result && result[0]) {
        if (result[0].status === 'sent') {
          deferred.resolve(result[0].status);
        }
        if (result[0].status === 'rejected') {
          deferred.reject(result[0].status);
        }
      } else {
        deferred.reject('Failed to send!');
      }
    }, (e) => {
      deferred.reject(e);
    });
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
    deferred.reject(err);
  }

  return deferred.promise;
}

/* Desc   : Send Email through Mailgun
  Params : emailSettings Json
  Returns: Promise
           Resolve->Success Message
           Reject-> Failure message to send
*/
function _mailGun(emailSettings) {
  const deferred = q.defer();

  try {
    const nodemailerMailgun = nodemailer.createTransport(mailgun({
      auth: {
        api_key: emailSettings.apiKey,
        domain: emailSettings.domain,
      },
    }));

    nodemailerMailgun.sendMail({
      from: emailSettings.fromEmail,
      to: emailSettings.emailTo,
      subject: emailSettings.subject,
      html: emailSettings.template,
    }, (err, info) => {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(info);
      }
    });
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
    deferred.reject(err);
  }

  return deferred.promise;
}

/* Desc   : Get EMail Settings
  Params : appSettings Json,
           returnDefault(default cloudboost setting will be returned if no email setting found on settings param)
  Returns: Promise
           Resolve->Settings Json
           Reject-> Error on retriving Json from Internal File or Confirguration not found
*/
function _getEmailSettings(settings, returnDefault) {
  const deferred = q.defer();

  try {
    let emailConfig = {};

    const emailSettings = _.first(_.where(settings, { category: 'email' }));
    const mandrillSetting = gnv(['settings', 'mandrill'], emailSettings);
    const mailgunSetting = gnv(['settings', 'mailgun'], emailSettings);
    const emailSettingsFound = (
      gnv(['settings', 'mandrill', 'apiKey'], emailSettings) || gnv(['settings', 'mailgun', 'apiKey'], emailSettings)
    ) || false;

    if (emailSettingsFound) {
      if (mandrillSetting && mandrillSetting.enabled && mandrillSetting.apiKey) {
        // provider is mandrill
        // Note api key
        emailConfig.provider = 'mandrill';
        emailConfig.apiKey = mandrillSetting.apiKey;
        emailConfig.fromEmail = mandrillSetting.fromEmail;
        emailConfig.fromName = emailSettings.settings.fromName;
      }
      if (mailgunSetting && mailgunSetting.enabled && mailgunSetting.apiKey && mailgunSetting.domain) {
        // provider is mailgun
        // Note api key and domain
        emailConfig.provider = 'mailgun';
        emailConfig.apiKey = mailgunSetting.apiKey;
        emailConfig.domain = mailgunSetting.domain;
        emailConfig.fromEmail = emailSettings.settings.fromEmail;
      }
    } else if (returnDefault === true) {
      if (!smtpConfig.provider) {
        throw 'SMTP Configuration file not found.';
      } else {
        emailConfig = smtpConfig;
      }
    }

    // Final Check
    if (emailConfig.apiKey) {
      deferred.resolve(emailConfig);
    } else {
      throw 'Email Configuration is not found.';
    }
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
    deferred.reject(err);
  }

  return deferred.promise;
}

/* Desc   : Retrive file from internal repo
  Params : templateName
  Returns: Promise
           Resolve->file
           Reject-> Error on retriving file from Internal File
*/
function _getTemplateByName(templateName) {
  const deferred = q.defer();
  try {
    fs.readFile(`./mail-templates/${templateName}.html`, 'utf8', (error, data) => {
      if (error) {
        deferred.reject(error);
      } else if (data) {
        deferred.resolve(data);
      }
    });
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
    deferred.reject(err);
  }

  return deferred.promise;
}

/* Desc   : Get Email Template
  Params : settings,templateName
  Returns: Promise
           Resolve->template
           Reject-> Error on retriving Template from Internal File
*/
function _getEmailTemplate(settings, templateName) {
  const deferred = q.defer();

  try {
    let functionName = null;

    if (templateName === 'sign-up') {
      functionName = 'signupEmail';
    }
    if (templateName === 'reset-password') {
      functionName = 'resetPasswordEmail';
    }

    let emailTemplateFound = false;

    if (settings && settings.length > 0) {
      const authSettings = _.where(settings, { category: 'auth' });
      if (authSettings && authSettings.length > 0 && functionName) {
        if (authSettings[0].settings && authSettings[0].settings[functionName].enabled && authSettings[0].settings[functionName].template) {
          emailTemplateFound = true;
          deferred.resolve(authSettings[0].settings[functionName].template);
        }
      }
    }

    if (!emailTemplateFound) {
      _getTemplateByName(templateName).then((defaultTemp) => {
        deferred.resolve(defaultTemp);
      }, (err) => {
        deferred.reject(err);
      });
    }
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
    deferred.reject(err);
  }

  return deferred.promise;
}

/* Desc   : Merge varianbles in  template
  Params : template, variableArray
  Returns: Promise
           Resolve->merged Template
           Reject-> Error on process DOM activities
*/
function _mergeVariablesInTemplate(template, variableArray) {
  const deferred = q.defer();

  try {
    // Parse Template
    jsdom.env(template, [], (error, window) => {
      if (error) {
        deferred.reject('Cannot parse mail template.');
      } else {
        const $ = require('jquery')(window); // eslint-disable-line

        for (let i = 0; i < variableArray.length; ++i) {
          // Plain text
          if (variableArray[i].contentType === 'text') {
            $(`.${variableArray[i].domClass}`).text(variableArray[i].content);
          }

          // href link
          if (variableArray[i].contentType === 'anchortag') {
            $(`.${variableArray[i].domClass}`).attr('href', variableArray[i].content);
          }

          // html content
          if (variableArray[i].contentType === 'html') {
            $(`.${variableArray[i].domClass}`).html(variableArray[i].content);
          }
        }

        deferred.resolve(window.document.documentElement.outerHTML);
      }
    });
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
    deferred.reject(err);
  }

  return deferred.promise;
}

const mail = {};

/* Desc   : Send Reset Password Email
  Params : appId, email, user, passwordResetKey
  Returns: Promise
           Resolve->Success Message
           Reject->Error on getAllSettings()
           or _getEmailSettings()
           or _getEmailTemplate()
           or getMyUrl()
           or _mergeVariablesInTemplate() or sendMail
*/
mail.sendResetPasswordMail = async (appId, email, user, passwordResetKey) => {
  const deferred = q.defer();

  try {
    const settings = await appService.getAllSettings(appId);
    const promises = [];
    promises.push(_getEmailSettings(settings, true));
    promises.push(_getEmailTemplate(settings, 'reset-password'));
    promises.push(keyService.getMyUrl());
    const [emailSettings, emailTemplate, serverUrl] = await q.all(promises);

    const username = user.name || user.firstName || user.username || ' ';

    const variableArray = [{
      domClass: 'username',
      content: username,
      contentType: 'text',
    }, {
      domClass: 'link',
      content: encodeURI(`${serverUrl}/page/${appId}/reset-password?user=${username}&resetKey=${passwordResetKey}`),
      contentType: 'anchortag',
    }];

    const mergedTemplate = await _mergeVariablesInTemplate(emailTemplate, variableArray);
    emailSettings.emailTo = email;
    emailSettings.subject = 'Reset Password';
    emailSettings.template = mergedTemplate;
    let response;
    if (emailSettings.provider === 'mandrill') {
      response = await _mandrill(emailSettings);
    }
    if (emailSettings.provider === 'mailgun') {
      response = await _mailGun(emailSettings);
    }
    deferred.resolve(response);
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
    deferred.reject(err);
  }

  return deferred.promise;
};

/* Desc   : Send Sign Email
  Params : appId, user, activateKey
  Returns: Promise
           Resolve->Success Message
           Reject->Error on getAllSettings()
            or _getEmailSettings()
             or _getEmailTemplate()
              or getMyUrl()
               or _mergeVariablesInTemplate()
                or sendMail
*/
mail.sendSignupMail = async (appId, user, activateKey) => {
  const deferred = q.defer();

  try {
    const settings = await appService.getAllSettings(appId);

    const promises = [];
    promises.push(_getEmailSettings(settings, true));
    promises.push(_getEmailTemplate(settings, 'sign-up'));
    promises.push(keyService.getMyUrl());
    const [emailSettings, emailTemplate, serverUrl] = await q.all(promises);

    const username = user.name || user.firstName || user.username || ' ';

    const variableArray = [{
      domClass: 'username',
      content: username,
      contentType: 'text',
    }, {
      domClass: 'link',
      content: encodeURI(`${serverUrl}/page/${appId}/verify?activateKey=${activateKey}`),
      contentType: 'anchortag',
    }];

    const mergedTemplate = await _mergeVariablesInTemplate(emailTemplate, variableArray);
    emailSettings.emailTo = user.email;
    emailSettings.subject = 'Activate Account';
    emailSettings.template = mergedTemplate;
    let response;
    if (emailSettings.provider === 'mandrill') {
      response = await _mandrill(emailSettings);
    } if (emailSettings.provider === 'mailgun') {
      response = await _mailGun(emailSettings);
    }

    deferred.resolve(response);
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
    deferred.reject(err);
  }

  return deferred.promise;
};

/* Desc   : Send Push Campaign Email
  Params : appId,user, email body
  Returns: Promise
           Resolve->Success Message
           Reject->Error on getAllSettings() or _getEmailSettings() or sendMail
*/
mail.emailCampaign = async (appId, userEmail, emailBody, emailSubject) => {
  const deferred = q.defer();

  try {
    const settings = await appService.getAllSettings(appId);
    const emailSettings = await _getEmailSettings(settings, false);

    emailSettings.emailTo = userEmail;
    emailSettings.subject = emailSubject;
    emailSettings.template = emailBody;

    let response;
    if (emailSettings.provider === 'mandrill') {
      response = await _mandrill(emailSettings);
    }
    if (emailSettings.provider === 'mailgun') {
      response = await _mailGun(emailSettings);
    }

    deferred.resolve(response);
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
    deferred.reject(err);
  }

  return deferred.promise;
};

module.exports = mail;
