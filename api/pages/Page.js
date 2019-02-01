
/*
#     CloudBoost - Core Engine that powers Backend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/


const _ = require('underscore');
const winston = require('winston');
const customHelper = require('../../helpers/custom.js');
const apiTracker = require('../../database-connect/apiTracker');
const userService = require('../../services/cloudUser');
const appService = require('../../services/app');
const config = require('../../config/config');

module.exports = (app) => {
  app.get('/page/:appId/reset-password', async (req, res) => {
    const { appId = null } = req.params;
    const { sdk = 'REST' } = req.body;

    apiTracker.log(appId, 'User / Reset User Password', req.url, sdk);

    try {
      const appObject = await appService.getApp(appId);
      const appSettingsObject = await appService.getAllSettings(appId);
      const appKeys = {};
      appKeys.appId = appId;
      appKeys.masterKey = appObject.keys.master;
      if (appObject.keys.encryption_key) {
        delete appObject.keys.encryption_key;
      }
      const general = _.first(_.where(appSettingsObject, { category: 'general' }));
      const auth = _.first(_.where(appSettingsObject, { category: 'auth' }));

      let generalSettings = null;
      if (general) {
        generalSettings = general.settings;
      }
      let authSettings = null;
      if (auth) {
        authSettings = auth.settings;
      }

      res.render(`${config.rootPath}/page-templates/user/password-reset`, {
        appKeys,
        generalSettings,
        authSettings,
      });
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      res.status(400).send(error);
    }
  });

  /*
    Reset Password : This API is used from CloudBoost Reset Password Page.
    */
  app.post('/page/:appId/reset-user-password', async (req, res) => {
    const appId = req.params.appId || null;
    const username = req.body.username || null;
    const sdk = req.body.sdk || 'REST';
    const resetKey = req.body.resetKey || '';
    const newPassword = req.body.newPassword || '';

    if (!newPassword || newPassword === '') {
      return res.status(400).json({
        message: 'New Password is required.',
      });
    }
    try {
      const application = await appService.getApp(appId);
      await userService.resetPassword(
        appId,
        username,
        newPassword,
        resetKey,
        customHelper.getAccessList(req),
        true,
        application.keys.encryption_key,
      );
      apiTracker.log(appId, 'User / Reset User Password', req.url, sdk);
      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(400).json({ error });
    }
  });

  /* Desc   : Render Authentication Page
      Params : appId
      Returns: Authentication html page
    */
  app.get('/page/:appId/authentication', async (req, res) => {
    const appId = req.params.appId || null;
    const sdk = req.body.sdk || 'REST';

    apiTracker.log(appId, 'User / Reset User Password', req.url, sdk);

    try {
      const application = await appService.getApp(appId);
      const appSettingsObject = await appService.getAllSettings(appId);
      const appKeys = {};
      appKeys.appId = appId;
      appKeys.masterKey = application.keys.master;

      const { settings: generalSettings } = _.pick(_.first(_.where(appSettingsObject, { category: 'general' })), 'settings');
      const { settings: authSettings } = _.pick(_.first(_.where(appSettingsObject, { category: 'auth' })), 'settings');

      if (authSettings
        && authSettings.resetPasswordEmail
        && authSettings.resetPasswordEmail.template) {
        delete authSettings.resetPasswordEmail.template;
      }

      if (authSettings && authSettings.signupEmail && authSettings.signupEmail.template) {
        delete authSettings.signupEmail.template;
      }

      res.render(`${config.rootPath}/page-templates/user/login`, {
        appKeys,
        generalSettings,
        authSettings,
      });
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      res.status(400).send(error);
    }
  });


  /* Desc   : Verify User Account And render Activation page
      Params : appId
      Returns: Activation html page
    */
  app.get('/page/:appId/verify', async (req, res) => {
    const appId = req.params.appId || null;
    const sdk = req.body.sdk || 'REST';
    const activateCode = req.query.activateKey;

    apiTracker.log(appId, 'User / Reset User Password', req.url, sdk);

    if (!activateCode) {
      return res.status(400).send('ActivateCode not found');
    }

    try {
      await userService.verifyActivateCode(
        appId,
        activateCode,
        customHelper.getAccessList(req),
      );
      const appSettingsObject = await appService.getAllSettings(appId);
      const { settings: generalSettings } = _.pick(
        _.first(_.where(appSettingsObject, { category: 'general' })),
        'settings',
      );
      return res.render(`${config.rootPath}/page-templates/user/signup-activate`, {
        generalSettings,
        verified: true,
      });
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.render(`${config.rootPath}/page-templates/user/signup-activate`, {
        verified: false,
      });
    }
  });
};
