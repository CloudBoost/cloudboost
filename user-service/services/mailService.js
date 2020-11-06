/* eslint max-len:0 */
const keys = require('../config/keys'); // eslint-disable-line

const _ = require('underscore');
const winston = require('winston');
const Q = require('q');
const jsdom = require('jsdom');
const fs = require('fs');
const sendgrid = require('sendgrid')(keys.sendgridApiKey);
const request = require('request');

const configPlans = require('../config/pricingPlans')();
const constants = require('../config/constants.json');

/** *********************************Private Functions********************************* */

function _mergeVariablesInTemplate(template, variableArray) {
  const deferred = Q.defer();

  try {
    // Parse Template
    jsdom.env(template, [], (error, window) => {
      if (error) {
        deferred.reject('Cannot parse mail template.');
      } else {
        const $ = require('jquery')(window); // eslint-disable-line

        for (let i = 0; i < variableArray.length; ++i) {
          if (variableArray[i].contentType === 'text') {
            $(`.${variableArray[i].domClass}`).text(variableArray[i].content);
          } else if (variableArray[i].contentType === 'html') {
            $(`.${variableArray[i].domClass}`).html(variableArray[i].content);
          }
        }

        deferred.resolve(window.document.documentElement.outerHTML);
      }
    });
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }

  return deferred.promise;
}

function _getEmailTemplate(templateName) {
  const deferred = Q.defer();

  const templatePath = `./mail-templates/${templateName}.html`;

  try {
    fs.readFile(templatePath, 'utf8', (error, data) => {
      if (error) {
        deferred.reject(error);
      } else if (data) {
        deferred.resolve(data);
      }
    });
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }

  return deferred.promise;
}

function _buildSendGridMailRequest(emailTo, subject, mergedTemplate, cc) {
  const mailBody = {
    personalizations: [{
      to: [{
        email: emailTo,
      }],
      subject,
    }],
    from: {
      email: keys.adminEmailAddress,
      name: 'CloudBoost.io',
    },
    reply_to: {
      email: constants.supportEmail,
      name: 'CloudBoost.io',
    },
    content: [{
      type: 'text/html',
      value: mergedTemplate,
    }],
  };
  mailBody.personalizations.cc = cc ? [{
    email: cc,
  }] : null;
  return sendgrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mailBody,
  });
}


module.exports = {

  sendTextMail(from, to, subject, text) {
    const deferred = Q.defer();

    const emailRequest = _buildSendGridMailRequest(to, subject, text);
    sendgrid.API(emailRequest, (err, info) => {
      if (err) {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        deferred.reject(err);
      } else {
        deferred.resolve(info);
      }
    });

    return deferred.promise;
  },

  sendMail(mailName, emailTo, subject, variableArray, cc) {
    const deferred = Q.defer();
    try {
      _getEmailTemplate(mailName).then((template) => {
        if (template) {
          return _mergeVariablesInTemplate(template, variableArray);
        }
        const noTempDef = Q.defer();
        noTempDef.reject(`${mailName} template not found`);
        return noTempDef.promise;
      }).then((mergedTemplate) => {
        const emailRequest = _buildSendGridMailRequest(emailTo, subject, mergedTemplate, cc);
        sendgrid.API(emailRequest, (err, info) => {
          if (err) {
            winston.error({
              error: String(err),
              stack: new Error().stack,
            });
            deferred.reject(err);
          } else {
            deferred.resolve(info);
          }
        });
      }, (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        deferred.reject(error);
      });
    } catch (err) {
      deferred.reject(err);
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }

    return deferred.promise;
  },

  sendSignupMail(user) {
    const mailName = 'signupwelcome';
    const emailTo = user.email;
    const subject = 'Welcome to CloudBoost';
    const firstname = user.name.split(' ')[0];

    const variableArray = [{
      domClass: 'username',
      content: firstname,
      contentType: 'text',
    }];

    this.sendMail(mailName, emailTo, subject, variableArray);
  },

  sendActivationMail(user) {
    const mailName = 'accountactivated';
    const emailTo = user.email;
    const subject = 'Your account is now activated';

    const variableArray = [{
      domClass: 'username',
      content: user.name,
      contentType: 'text',
    }];

    this.sendMail(mailName, emailTo, subject, variableArray);
  },

  sendResetPasswordMail(user) {
    const mailName = 'forgotpassword';
    const emailTo = user.email;
    const subject = 'Reset your password';

    const variableArray = [{
      domClass: 'username',
      content: user.name,
      contentType: 'text',
    }, {
      domClass: 'link',
      content: `<a href='${keys.accountsUrl}changepassword?code=${user.emailVerificationCode}' class='btn-primary'>Reset your password</a>`,
      contentType: 'html',
    }];

    this.sendMail(mailName, emailTo, subject, variableArray);
  },

  sendUpdatePasswordMail(user) {
    const mailName = 'passwordchanged';
    const emailTo = user.email;
    const subject = "You've changed your password";

    const variableArray = [{
      domClass: 'username',
      content: user.name,
      contentType: 'text',
    }];

    this.sendMail(mailName, emailTo, subject, variableArray);
  },

  sendRequestDemoMail(user) {
    const mailName = 'demorequested';
    const emailTo = user.salesEmail;
    const subject = "You've requested for a demo with CloudBoost";

    const variableArray = [{
      domClass: 'username',
      content: user.firstName,
      contentType: 'text',
    }];

    this.sendMail(mailName, emailTo, subject, variableArray);
  },

  sendSlackInviteMail(user) {
    const options = {
      url: 'https://slack.com/api/users.admin.invite',
      method: 'GET',
      qs: {
        token: 'xoxp-11873098179-111402824422-234336993777-b96c9fb3b69f82ebb79d12f280779de1',
        email: user.email,
        resend: true,
      },
    };
    request(options);
  },

  sendResourceMail(user, resource) {
    const mailName = 'resource';
    const emailTo = user.salesEmail;
    const subject = `Here's your ${resource.type}`;
    const cc = 'support@cloudboost.io';
    const variableArray = [{
      domClass: 'username',
      content: user.firstName,
      contentType: 'text',
    }, {
      domClass: 'resource',
      content: resource.type,
      contentType: 'text',
    },
    {
      domClass: 'link',
      content: `<a href='${resource.fileURL}'>Click here to view the file >></a>`,
      contentType: 'html',
    }, {
      domClass: 'file-type',
      content: resource.type,
      contentType: 'text',
    },
    ];

    this.sendMail(mailName, emailTo, subject, variableArray, cc);
  },

  sendPaymentFailedMail(data) {
    const mailName = 'failed_app_payment';
    const subject = 'Failed Payment Activity';

    const variableArray = [{
      domClass: 'username',
      content: data.userName,
      contentType: 'text',
    }, {
      domClass: 'amountdue',
      content: `${data.amountDue} USD`,
      contentType: 'text',
    }, {
      domClass: 'appname',
      content: data.appName,
      contentType: 'text',
    }];

    this.sendMail(mailName, data.userEmail, subject, variableArray);
  },
  /**
   * @param {Object} data
   * @param {String} data.appId
   * @param {String} data.userEmail
   * @param {String} data.userName
   * @param {String} data.appName
   * @param {String} data.disabledReason
   * @param {String} data.hostedInvoiceUrl
   */
  sendAppDisabledMail(data) {
    /**
         * App is disabled for different reasons like:
         * 1. Payment over due
         * 2. App has been inactive for a over 60days
         * 3. Subscription cancelled by user
         */
    const {
      appId,
      userName,
      appName,
      disabledReason,
      userEmail: emailTo,
    } = data;
    const reasons = {
      paymentFailed: 'Your app payment invoice is over due and will be deleted in 30 days, please click the link below to pay your pending invoice to activate your app.',
      subscriptionCancelled: 'Your app subscription has been cancelled and may be deleted in 30 days, please login to your dashboard using the link below to subscribe to a new plan',
      appInactive60: 'Your app has been inactive for more than 60 days and will be deleted in 30 days, please click the link below to reactivate your app',
    };
    const links = {
      paymentFailed: `<a href='${data.hostedInvoiceUrl}' class='btn-primary'> Pay Invoice </a>`,
      subscriptionCancelled: `<a href='${keys.accountsUrl}' class='btn-primary'>Login to dashboard</a>`,
      appInactive60: `<a href='${keys.accountsUrl}/reactivate/${appId}' class='btn-primary'>Activate your app</a>`,
    };
    const mailName = 'disableApp';
    const subject = `Your app ${appName} is disabled.`;
    const variableArray = [
      {
        domClass: 'username',
        content: userName,
        contentType: 'text',
      }, {
        domClass: 'appname',
        content: appName,
        contentType: 'text',
      }, {
        domClass: 'disablereason',
        content: reasons[disabledReason],
        contentType: 'text',
      }, {
        domClass: 'link',
        content: links[disabledReason],
        contentType: 'html',
      },
    ];

    this.sendMail(mailName, emailTo, subject, variableArray);
  },

  forwardCustomerDetails(data) {
    /**
         * Forward customer details to support for different reasons like:
         * 1. Cancelled app plan
         * 2. User initiated delete
         */
    const emailTo = 'support@cloudboost.io';
    const {
      appId,
      userName,
      appName,
      disabledReason,
      userEmail,
    } = data;
    const reasons = {
      cancelledPlan: 'User cancelled plan ',
      userInitiatedDelete: 'User wants to delete app ',
    };
    const mailName = 'contactsupport';
    const subject = `App ${appName} refund discussion`;
    const variableArray = [{
      domClass: 'username',
      content: userName,
      contentType: 'text',
    }, {
      domClass: 'useremail',
      content: userEmail,
      contentType: 'text',
    }, {
      domClass: 'appname',
      content: appName,
      contentType: 'text',
    }, {
      domClass: 'appid',
      content: appId,
      contentType: 'text',
    }, {
      domClass: 'disablereason',
      content: reasons[disabledReason],
      contentType: 'text',
    }];

    this.sendMail(mailName, emailTo, subject, variableArray);
  },
  cancelledPlanMail(user, app) {
    const emailTo = user.email;
    const userName = user.username;
    const appName = app.name;
    const plan = _.first(_.where(configPlans.plans, { id: app.planId }));
    const mailName = 'cancelplan';
    const subject = `App ${appName} plan cancelled`;
    const variableArray = [{
      domClass: 'username',
      content: userName,
      contentType: 'text',
    }, {
      domClass: 'appname',
      content: appName,
      contentType: 'text',
    }, {
      domClass: 'planname',
      content: plan.planName,
      contentType: 'text',
    },
    ];

    this.sendMail(mailName, emailTo, subject, variableArray);
  },

};
