const middlewares = require('../config/middlewares');

module.exports = function (app) {
  // routes
  app.get('/notification/:skip/:limit', middlewares.checkAuth, async (req, res) => {
    const currentUserId = req.user.id;
    const { skip, limit } = req.params;
    try {
      if (currentUserId) {
        const list = await global.notificationService.getNotifications(currentUserId, skip, limit);
        return res.status(200).json(list);
      }
      return res.send(401);
    } catch (error) {
      return res.status(400).send(error);
    }
  });

  app.get('/notification/seen', middlewares.checkAuth, async (req, res) => {
    const currentUserId = req.user.id;

    try {
      if (currentUserId) {
        const list = await global.notificationService.updateNotificationsSeen(currentUserId);
        return res.status(200).json(list);
      }
      return res.send(401);
    } catch (error) {
      return res.status(400).send(error);
    }
  });

  app.delete('/notification/:id', middlewares.checkAuth, async (req, res) => {
    const currentUserId = req.user.id;
    const notifyId = req.params.id;

    try {
      if (currentUserId) {
        const deleted = await global.notificationService.removeNotificationById(notifyId);
        return res.status(200).json(deleted);
      }
      return res.send(401);
    } catch (error) {
      return res.status(400).send(error);
    }
  });

  return app;
};
