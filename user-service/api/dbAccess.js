const middlewares = require('../config/middlewares');

module.exports = function (app) {
  app.post('/dbaccess/enable/:appId', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;
    const { appId } = req.params;
    if (currentUserId && appId) {
      global.dbAccessService.createAccessUrl(currentUserId, appId).then((data) => {
        res.status(200).json({
          data,
        });
      }, (err) => {
        res.status(400).json({
          err,
        });
      });
    } else {
      res.status(401).send('Unauthorised');
    }
  });

  app.post('/dbaccess/get/:appId', middlewares.checkAuth, middlewares.isAppDisabled, (req, res) => {
    const currentUserId = req.user.id;
    const { appId } = req.params;
    if (currentUserId && appId) {
      global.dbAccessService.getAccessUrl(currentUserId, appId).then((data) => {
        res.status(200).json(data);
      }, (err) => {
        res.status(400).json({
          err,
        });
      });
    } else {
      res.status(401).send('Unauthorised');
    }
  });

  return app;
};
