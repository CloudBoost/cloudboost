const keys = require('../config/keys.js');

module.exports = (app) => {
  // routes
  app.post('/:appId/notifications/over80', async (req, res) => {
    const { appId } = req.params;
    const data = req.body || {};
    try {
      if (data && data.secureKey === keys.secureKey) {
        const resp = await global.analyticsNotificationsService.updateUserOver80(appId, data.exceeded80);
        return res.status(200).json(resp);
      }
      return res.status(400).send('Unauthorized');
    } catch (error) {
      return res.status(400).send(error);
    }
  });

  app.post('/:appId/notifications/over100', async (req, res) => {
    const { appId } = req.params;
    const data = req.body || {};
    try {
      if (data && data.secureKey === keys.secureKey) {
        const resp = await global.analyticsNotificationsService.updateUserOver100(appId, data.details);
        return res.status(200).json(resp);
      }
      return res.status(400).send('Unauthorized');
    } catch (error) {
      return res.status(400).send(error);
    }
  });

  return app;
};
