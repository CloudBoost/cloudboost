const middlewares = require('../config/middlewares');

module.exports = function (app) {
  // routes
  app.get('/server/isNewServer', (req, res) => {
    global.userService.isNewServer().then(isNew => res.status(200).send(isNew), error => res.send(500, error));
  });


  app.get('/server', (req, res) => {
    global.cbServerService.getSettings().then(settings => res.status(200).json(settings), error => res.send(500, error));
  });

  app.post('/server', middlewares.checkAuth, (req, res) => {
    const data = req.body || {};
    const currentUserId = req.user.id;

    global.cbServerService.upsertSettings(currentUserId, data.id, data.allowedSignUp)
      .then(settings => res.status(200).json(settings), error => res.send(500, error));
  });

  app.post('/server/url', middlewares.checkAuth, (req, res) => {
    const data = req.body || {};
    const currentUserId = req.user.id;

    global.cbServerService.upsertAPI_URL(currentUserId, data.apiURL)
      .then(settings => res.status(200).json(settings), error => res.status(500).send(error));
  });

  // know server isHosted?
  app.get('/server/isHosted', (req, res) => res.status(200).send(process.env.CLOUDBOOST_HOSTED || false));

  app.get('/status', (req, res) => {
    global.cbServerService.getDBStatuses().then(() => res.status(200).json({
      status: 200,
      message: 'Service Status : OK',
    }), error => res.status(500).send(error));
  });

  return app;
};
