const middlewares = require('../config/middlewares');

module.exports = function (app) {
  // routes
  /**
   * @description API endpoint to create or add card to user payment record on analytics API
   *
   */
  app.post('/payment/card', middlewares.checkAuth, async (req, res) => {
    const data = req.body || {};
    const currentUserId = req.user.id;

    try {
      if (currentUserId) {
        if (!data.token) {
          return res.status(400).json({
            message: 'Stripe token is required',
          });
        }

        const user = await global.userService.getAccountById(currentUserId);
        if (!user) {
          return res.status(404).json({
            message: 'Error: user not found',
          });
        }
        data.userId = user._id;
        data.userEmail = user.email;
        const payment = await global.paymentCardService.addCard(currentUserId, data);
        if (!payment) {
          return res.status(404).json({
            message: 'Error: creating card failed',
          });
        }
        return res.status(200).json(payment);
      }
      return res.status(401).send('Unauthorized access');
    } catch (error) {
      return res.status(400).json({
        message: 'Error: creating card failed',
        error,
      });
    }
  });

  /**
   * @description API endpoint to update card details on analytics and stripe
   */

  app.put('/payment/card/:cardId', middlewares.checkAuth, async (req, res) => {
    const data = req.body || {};
    const requiredFields = ['customerId', 'cardId', 'params'];
    const currentUserId = req.user.id;

    try {
      if (currentUserId) {
        const errors = requiredFields.filter(field => !data[field]).map(field => ({
          message: `${field} is required`,
        }));

        if (errors.length) {
          return res.status(400).json({
            message: 'Validation error occurred',
            errors,
          });
        }

        const user = await global.userService.getAccountById(currentUserId);
        if (!user) {
          return res.status(404).json({
            message: 'Error: user not found',
          });
        }
        data.userId = user._id;
        const payment = await global.paymentCardService.updateCard(data);
        if (!payment) {
          return res.status(404).json({
            message: 'Error: updating card failed',
          });
        }
        return res.status(200).json(payment);
      }
      return res.status(401).send('Unauthorized access');
    } catch (error) {
      return res.status(400).json({
        message: 'Error: updating card failed',
        error,
      });
    }
  });

  /**
   * @description API endpoint to delete or remove user card on analytics and stripe
   */

  app.post('/payment/card/:cardId/remove', middlewares.checkAuth, async (req, res) => {
    const data = req.body || {};
    const requiredFields = ['customerId', 'cardId'];
    const currentUserId = req.user.id;

    try {
      if (currentUserId) {
        const errors = requiredFields
          .filter(field => !data[field])
          .map(field => ({
            message: `${field} is required`,
          }));
        if (errors.length) {
          return res.status(400).json({
            message: 'Validation error occurred',
            errors,
          });
        }

        const user = await global.userService.getAccountById(currentUserId);
        if (!user) {
          return res.status(404).json({
            message: 'Error: user not found',
          });
        }
        data.userId = user._id;
        const payment = await global.paymentCardService.removeCard(data);
        if (!payment) {
          return res.status(404).json({
            message: 'Error: removing card failed',
          });
        }
        return res.status(200).json(payment);
      }
      return res.status(401).send('Unauthorized access');
    } catch (error) {
      return res.status(400).json({
        message: 'Error: removing card failed',
        error,
      });
    }
  });
};
