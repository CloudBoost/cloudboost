const appService = require('../services/app');

module.exports = function (req, res, next) {
  const appId = req.params.appId;
  appService.getApp(appId).then((app) => {
    if (app.disabled) {
      return res.status(401).json({
        message: 'App is disabled',
        type: 'error',
      });
    }
    return next();
  });
};
