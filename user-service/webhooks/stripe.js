const keys = require('../config/keys'); // eslint-disable-line
const stripe = require('stripe')(keys.stripeSecureKey);
const bodyParser = require('body-parser');
const _ = require('underscore');
const winston = require('winston');
const Project = require('../model/project');
const paymentCardService = require('../services/paymentCardService');
const { getNestedValue: gnv } = require('../helpers/utils');

/**
 * @description function to email user that his invoice is failed to pay as some reason
 * @param {Object} event
 */
function invoicePaymentFailed(event) {
  const data = event.data.object;
  const subscriptionId = gnv('lines.data.0.id', data);
  const appId = gnv('lines.data.0.metadata.appId', data);
  const nextPaymentAttempt = data.next_payment_attempt;
  const amountDue = data.amount_due;
  const hostedInvoiceUrl = data.hosted_invoice_url;

  // Find the appId in the project Model
  try {
    Project.findOne({
      appId,
    })
      .populate('_userId')
      .then((app) => {
        if (app) {
          if (nextPaymentAttempt) {
            global.mailService.sendPaymentFailedMail({
              userName: app._userId.name,
              userEmail: app._userId.email,
              amount_due: amountDue,
              appName: app.name,
            });
          } else {
            keys.agenda.now('disableApp', {
              appId,
              disabledReason: 'paymentFailed',
              toBeDeleted: true,
            });
            global.mailService.sendAppDisabledMail({
              userEmail: app._userId.email,
              userName: app._userId.name,
              appId,
              appName: app.name,
              disabledReason: 'paymentFailed',
              hostedInvoiceUrl,
            });
            paymentCardService.updateSalesFromAnalytics(appId, {
              status: 'disabled',
              pending_invoice: data.id,
            }, {
              appId,
              'subscriptionDetails.id': subscriptionId,
            });
          }
        }
      });
  } catch (error) {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
  }
}

/**
  * Function for handling subscription deleted
  */

function subscriptionUpdated(event) {
  const data = event.data.object;
  const subscriptionId = data.id;
  const appId = gnv('metadata.appId', data);
  global.projectService.getProject({
    appId,
  })
    .then((project) => {
      if (project) {
        paymentCardService.updateSalesFromAnalytics(appId, {
          subscription_status: data.status,
          subscription_start: data.current_period_start,
          subscription_end: data.current_period_end,
          subscriptionDetails: data,
        }, {
          appId,
          'subscriptionDetails.id': subscriptionId,
        });
      }
    })
    .catch(winston.error);
}

/**
 * @description function to update sales on payment success
 * @param {Object} event
 */
function invoicePaymentSuccess(event) {
  const data = event.data.object;
  const appId = gnv('lines.data.0.metadata.appId', data);
  const subscription = gnv('lines.data.0', data);

  Project.findOneAndUpdate({
    appId,
  }, {
    disabled: false,
    deleted: false,
    disabledDate: null,
    deleteReason: 'active',
    disabledReason: null,
  }, {
    new: true,
  }, (err) => {
    if (err) {
      return winston.error({
        error: String(err),
        stack: new Error().stack,
      });
    }
    keys.agenda.cancel({ name: 'removeApp', 'data.appId': appId });
    return paymentCardService.updateSalesFromAnalytics(appId, {
      subscription_status: subscription.status,
      subscription_start: subscription.current_period_start,
      subscription_end: subscription.current_period_end,
      subscriptionDetails: subscription,
    }, {
      appId,
      'subscriptionDetails.id': subscription.id,
    });
  });
}
/**
 * @description function to update payment on customer update event
 * @param {Object} event
 */
function customerUpdated(event) {
  const payload = event.data.object;
  const reqBody = {
    defaultSource: payload.default_source,
    sources: _.map(payload.sources.data,
      card => _.pick(card, 'last4', 'brand', 'exp_month', 'exp_year', 'cvc_check', 'name', 'funding', 'id')),
  };
  global.paymentCardService.updatePaymentFromStripe(payload.id, reqBody);
}

/**
 * @description function to disable app when subscription is deleted
 * @param {Object} event
 * @name subscriptionDeleted
 */
function subscriptionDeleted(event) {
  const payload = event.data.object;
  const subscriptionId = payload.id;
  const { appId } = payload.metadata;

  global.projectService.updateProjectBy({
    appId,
  }, {
    disabled: true,
    disabledReason: 'subscriptionCancelled',
    disabledDate: Date.now(),
  })
    .then((project) => {
      if (!project) {
        return [null];
      }
      return [
        project,
        paymentCardService.deleteSalesFromAnalytics(appId, {
          appId,
          'subscriptionDetails.id': subscriptionId,
          userId: project._userId,
        })];
    })
    .spread((project) => {
      if (!project) {
        return [null];
      }
      return [project, global.userService.getAccountById(project._userId)];
    })
    .spread((project, userAccount) => {
      if (!project) {
        return null;
      }
      global.mailService.cancelledPlanMail(userAccount, project);
      global.mailService.sendAppDisabledMail({
        disabledReason: 'subscriptionCancelled',
        appId: project.appId,
        userName: userAccount.username,
        userEmail: userAccount.email,
        appName: project.name,
      });
      global.notificationService.subscriptionCancelledNotification({
        appId: project.appId,
        appName: project.name,
        userId: project._userId,
      });
      return keys.agenda.schedule('30 days', 'removeApp', { appId });
    })
    .catch(winston.error);
}

module.exports = (app) => {
  app.post('/webhook/stripe', bodyParser.raw({ type: '*/*' }), (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(req.rawBody, sig, keys.stripeEndpointSecret);
      // Do something with event
      winston.info(event.type);
      switch (event.type) {
        case 'customer.subscription.updated':
          subscriptionUpdated(event);
          break;
        case 'customer.subscription.deleted':
          subscriptionDeleted(event);
          break;
        case 'invoice.payment_succeeded':
          invoicePaymentSuccess(event);
          break;
        case 'invoice.payment_failed':
          invoicePaymentFailed(event);
          break;
        case 'customer.updated':
          customerUpdated(event);
          break;
        default:
          winston.info(event, { json: true });
          break;
      }

      // Return a response
      return res.status(200).json({
        received: true,
      });
    } catch (err) {
      return res.status(400).end();
    }
  });

  app.post('/test-card', (req, res) => {
    const { token } = req.body;

    stripe.charges.create({
      amount: 100,
      currency: 'usd',
      description: 'Charge $1 on card to test',
      source: token,
      capture: true,
    }, (err, charge) => {
      if (err) {
        return res.status(400).json({
          message: 'Card declined',
          error: err,
        });
      }
      return res.status(200).json(charge);
    });
  });
};
