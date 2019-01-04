
/*
#     CloudBoost - Core Engine that powers Backend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/


const _ = require('underscore');
const q = require('q');
const winston = require('winston');
const customHelper = require('../../helpers/custom.js');
const apiTracker = require('../../database-connect/apiTracker');
const userService = require('../../services/cloudUser');
const appService = require('../../services/app');
const config = require('../../config/config');

module.exports = function (app) {
  app.get('/page/:appId/reset-password', (req, res) => {
    const appId = req.params.appId || null;
    const sdk = req.body.sdk || 'REST';

    const promises = [];
    promises.push(appService.getApp(appId));
    promises.push(appService.getAllSettings(appId));

    q.all(promises).then((list) => {
      const appKeys = {};
      appKeys.appId = appId;

      appKeys.masterKey = list[0].keys.master;
      const appSettingsObject = list[1];
      list[0].keys.encryption_key ? delete list[0].keys.encryption_key : null;

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
    }, (error) => {
      res.status(400).send(error);
    });

    apiTracker.log(appId, 'User / Reset User Password', req.url, sdk);
  });

  /*
    Reset Password : This API is used from CloudBoost Reset Password Page.
    */
  app.post('/page/:appId/reset-user-password', (req, res) => {
    const appId = req.params.appId || null;
    const username = req.body.username || null;
    const sdk = req.body.sdk || 'REST';
    const resetKey = req.body.resetKey || '';
    const newPassword = req.body.newPassword || '';

    if (!newPassword || newPassword === '') {
      res.status(400).json({
        message: 'New Password is required.',
      });
    }

    appService.getApp(appId).then((application) => {
      userService.resetUserPassword(appId, username, newPassword, resetKey, customHelper.getAccessList(req), true, application.keys.encryption_key)
        .then(() => {
          res.json({ message: 'Password changed successfully.' });
        }, (error) => {
          res.json(400, {
            error,
          });
        });
    });

    apiTracker.log(appId, 'User / Reset User Password', req.url, sdk);
  });

  /* Desc   : Render Authentication Page
      Params : appId
      Returns: Authentication html page
    */
  app.get('/page/:appId/authentication', (req, res) => {
    const appId = req.params.appId || null;
    const sdk = req.body.sdk || 'REST';

    const promises = [];
    promises.push(appService.getApp(appId));
    promises.push(appService.getAllSettings(appId));

    q.all(promises).then((list) => {
      const appKeys = {};
      appKeys.appId = appId;

      appKeys.masterKey = list[0].keys.master;
      const appSettingsObject = list[1];

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

      if (authSettings && authSettings.resetPasswordEmail && authSettings.resetPasswordEmail.template) {
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
    }, (error) => {
      res.status(400).send(error);
    });


    apiTracker.log(appId, 'User / Reset User Password', req.url, sdk);
  });


  /* Desc   : Verify User Account And render Activation page
      Params : appId
      Returns: Activation html page
    */
  app.get('/page/:appId/verify', (req, res) => {
    const appId = req.params.appId || null;
    const sdk = req.body.sdk || 'REST';
    const activateCode = req.query.activateKey;

    if (!activateCode) {
      res.status(400).send('ActivateCode not found');
    }


    const promises = [];
    promises.push(userService.verifyActivateCode(appId, activateCode, customHelper.getAccessList(req)));
    promises.push(appService.getAllSettings(appId));

    q.all(promises).then((list) => {
      const appSettingsObject = list[1];

      const general = _.first(_.where(appSettingsObject, { category: 'general' }));

      let generalSettings = null;
      if (general) {
        generalSettings = general.settings;
      }

      res.render(`${config.rootPath}/page-templates/user/signup-activate`, {
        generalSettings,
        verified: true,
      });
    }, (err) => {
      winston.error({
        error: err,
      });
      res.render(`${config.rootPath}/page-templates/user/signup-activate`, {
        verified: false,
      });
    });

    apiTracker.log(appId, 'User / Reset User Password', req.url, sdk);
  });
};
