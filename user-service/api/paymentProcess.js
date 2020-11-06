const keys = require('../config/keys'); // eslint-disable-line
const stripe = require('stripe')(keys.stripeSecureKey);
const winston = require('winston');
const middlewares = require('../config/middlewares');

module.exports = (app) => {
  /**
   * @description API endpoint to check for coupon code validity
   */
  app.post('/check-coupon', (req, res) => {
    const data = req.body;

    if (!data.couponCode) {
      res.status(400).send('param couponCode is required');
    } else {
      stripe.coupons.retrieve(
        data.couponCode,
        (err, coupon) => {
          if (err) {
            winston.error({
              error: String(err),
              stack: new Error().stack,
            });
            return res.status(404).send(err.message);
          }

          return res.status(200).json(coupon);
        },
      );
    }
  });

  app.put('/:appId/sale/plan', middlewares.checkAuth, async (req, res) => {
    const data = req.body || {};
    const { appId } = req.params;
    const currentUserId = req.user.id;

    try {
      if (currentUserId) {
        if (data && appId) {
          await global.paymentProcessService.changePlan(currentUserId, appId, data);
          const resp = await global.projectService.updateProjectBy({ appId }, {
            cancelPlanAtPeriodEnd: false,
          });
          if (!resp) {
            return res.status(400).send('Error : Something went wrong, try again.');
          }
          return res.status(200).json(resp);
        }
        return res.status(400).send('Bad Request');
      }
      return res.status(400).send('Unauthorized');
    } catch (error) {
      return res.status(400).send(error);
    }
  });

  // routes
  app.post('/:appId/sale', middlewares.checkAuth, (req, res) => {
    const data = req.body || {};
    const { appId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId) {
      if (data && appId) {
        global.paymentProcessService.createSale(currentUserId, appId, data)
          .then(() => global.projectService.updateProjectBy({ appId }, {
            cancelPlanAtPeriodEnd: false,
            disabled: false,
          }))
          .then((salesData) => {
            if (!salesData) {
              return res.status(400).send('Error : Something went wrong, try again.');
            }
            return res.status(200).json(salesData);
          }, error => res.status(400).send(error));
      } else {
        res.status(400).send('Bad Request');
      }
    } else {
      res.status(400).send('Unauthorized');
    }
  });

  app.delete('/:appId/removecard', middlewares.checkAuth, (req, res) => {
    const { appId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId) {
      if (appId) {
        global.paymentProcessService.stopRecurring(appId, currentUserId).then((data) => {
          if (!data) {
            return res.status(400).send('Error : Something went wrong, try again.');
          }
          return res.status(200).json(data);
        }, error => res.status(400).send(error));
      } else {
        res.status(400).send('Bad Request');
      }
    } else {
      res.status(400).send('Unauthorized');
    }
  });

  app.get('/:appId/customer', middlewares.checkAuth, (req, res) => {
    const { appId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId) {
      if (appId) {
        global.paymentProcessService.getCustomer(appId, currentUserId).then((data) => {
          if (!data) {
            return res.status(400).send('Error : Something went wrong, try again.');
          }
          return res.status(200).json(data);
        }, error => res.status(400).send(error));
      } else {
        res.status(400).send('Bad Request');
      }
    } else {
      res.status(400).send('Unauthorized');
    }
  });

  app.post('/:appId/cancel-plan', middlewares.checkAuth, (req, res) => {
    const body = req.body || { disabledReason: 'userInitiatedDelete' };
    const { appId } = req.params;
    const currentUserId = req.user.id;
    if (!body.cancelOption) {
      return res.status(400).json({
        message: 'cancelOption is required',
      });
    }
    if (['cancelImmediately', 'cancelAfter'].indexOf(body.cancelOption) === -1) {
      return res.status(400).json({
        message: 'Invalid cancelOption parsed',
      });
    }
    switch (body.cancelOption) {
      case 'cancelImmediately':
        return global.paymentProcessService.cancelPlanAndRefund(appId, currentUserId)
          .then(() => global.projectService.updateProjectBy({ appId }, {
            disabled: true,
            disabledReason: 'subscriptionCancelled',
          }))
          .then(updated => res.status(200).json({
            message: 'App plan cancelled and refund calculated',
            data: updated,
          }))
          .catch(err => res.status(500).json({
            error: err,
            message: 'Unknown server error',
          }));

      case 'cancelAfter':
        return global.paymentProcessService.cancelPlanAfter(appId)
          .then(() => global.projectService.updateProjectBy({ appId }, {
            cancelPlanAtPeriodEnd: true,
          }))
          .then(appData => res.status(200).json({
            message: 'App subscription setting updated',
            data: appData,
          }))
          .catch(err => res.status(500).json({
            error: err,
            message: 'Unknown server error',
          }));

      default:
        return res.status(200).json({ message: 'Successfully cancelled app plan' });
    }
  });

  return app;
};
