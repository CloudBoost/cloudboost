const Project = require('../model/project');

module.exports = {
  checkAuth(req, res, next) {
    // eslint-disable-next-line
    const currentUser = req.query.access_token ? req.query.access_token : (req.session.passport && req.session.passport.user
      ? req.session.passport.user
      : null);

    if (currentUser) {
      req.user = currentUser;
      return next();
    }
    return res.status(401).json({
      message: 'Unauthorized access',
    });
  },

  isAppDisabled(req, res, next) {
    Project.findOne({
      appId: req.params.appId,
    }, (err, project) => {
      if (err) {
        return res.status(400).json({
          message: 'Error occurred',
          error: err,
        });
      }
      if (project && !project.disabled) {
        return next();
      }

      return res.status(401).json({
        message: 'App is disabled',
      });
    });
  },
};
