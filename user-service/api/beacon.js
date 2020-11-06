const middlewares = require('../config/middlewares');

module.exports = (app) => {
  // routes
  app.get('/beacon/get', middlewares.checkAuth, (req, res) => {
    const currentUserId = req.user.id;

    global.beaconService.getBeaconByUserId(currentUserId)
      .then(beaconObj => res.status(200).json(beaconObj), error => res.send(500, error));
  });

  app.post('/beacon/update', middlewares.checkAuth, (req, res) => {
    const data = req.body || {};
    const currentUserId = req.user.id;

    if (currentUserId && data) {
      if (currentUserId === data._userId) {
        global.beaconService.updateBeacon(currentUserId, data).then((beaconObj) => {
          if (!beaconObj) {
            return res.send(400, 'Error : Beacon not found');
          }
          return res.status(200).json(beaconObj);
        }, error => res.send(400, error));
      } else {
        res.send(400, 'Unauthorized');
      }
    } else {
      res.send(401);
    }
  });

  return app;
};
