const winston = require('winston');
const appService = require('../services/app');

module.exports = async (req, res, next) => {
  const { appId } = req.params;
  try {
    const app = await appService.getApp(appId);
    if (app.disabled) {
      return res.status(401).json({
        message: 'App is disabled',
        type: 'error',
      });
    }
    return next();
  } catch (error) {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    return next(error);
  }
};
