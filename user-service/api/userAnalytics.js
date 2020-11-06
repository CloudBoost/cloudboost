const winston = require('winston');
const middlewares = require('../config/middlewares');

module.exports = function (app) {
  // routes
  app.get('/analytics/api/:appId/usage', middlewares.checkAuth, (req, res) => {
    const { appId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId) {
      return global.userAnalyticService.apiUsage(appId).then(result => res.status(200).json(result), (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        return res.send(400, error);
      });
    }
    return res.send(400, 'Unauthorized-User not found');
  });

  app.get('/analytics/storage/:appId/usage', middlewares.checkAuth, (req, res) => {
    const { appId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId) {
      return global.userAnalyticService.storageUsage(appId).then(result => res.status(200).json(result), (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        return res.send(400, error);
      });
    }
    return res.send(400, 'Unauthorized-User not found');
  });

  app.get('/analytics/api/:appId/count', middlewares.checkAuth, (req, res) => {
    const { appId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId) {
      return global.userAnalyticService.apiCount(appId).then(result => res.status(200).json(result), (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        return res.send(400, error);
      });
    }
    return res.send(400, 'Unauthorized-User not found');
  });

  app.get('/analytics/storage/:appId/count', middlewares.checkAuth, (req, res) => {
    const { appId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId) {
      return global.userAnalyticService.storageLastRecord(appId).then(result => res.status(200).json(result), (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        return res.send(400, error);
      });
    }
    return res.send(400, 'Unauthorized-User not found');
  });


  app.post('/analytics/api-storage/bulk/count', middlewares.checkAuth, (req, res) => {
    const currentUserId = req.user.id;
    const data = req.body || {};

    if (currentUserId) {
      return global.userAnalyticService.bulkApiStorageDetails(data.appIdArray).then(result => res.status(200).json(result), (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        return res.send(400, error);
      });
    }
    return res.send(400, 'Unauthorized-User not found');
  });

  app.post('/analytics/get/statistics', middlewares.checkAuth, (req, res) => {
    const currentUserId = req.user.id;
    const data = req.body || {};

    if (currentUserId) {
      return global.userAnalyticService.getAppStatistics(data.appId).then(result => res.status(200).json(result), (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        return res.send(400, error);
      });
    }
    return res.send(400, 'Unauthorized-User not found');
  });

  return app;
};
