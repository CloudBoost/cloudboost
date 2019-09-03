/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const _ = require('underscore');
const uuid = require('uuid');
const winston = require('winston');

const { getNestedValue } = require('../../helpers/util.js');
const customHelper = require('../../helpers/custom.js');

const twitterHelper = require('../../helpers/twitter.js');
const githubHelper = require('../../helpers/github.js');
const linkedinHelper = require('../../helpers/linkedin.js');
const googleHelper = require('../../helpers/google.js');
const facebookHelper = require('../../helpers/facebook.js');

const apiTracker = require('../../database-connect/apiTracker');
const sessionHelper = require('../../helpers/session');
const customService = require('../../services/cloudObjects');
const userService = require('../../services/cloudUser');
const appService = require('../../services/app');
const authService = require('../../services/auth');

const setSession = (req, appId, sessionLength, result, res) => {
  if (!req.session.id) {
    req.session = {};
    req.session.id = uuid.v1();
  }
  res.header('sessionID', req.session.id);

  const obj = {
    id: req.session.id,
    userId: result._id, // eslint-disable-line
    loggedIn: true,
    appId,
    email: result.email,
    roles: _.map(result.roles, role => role._id), // eslint-disable-line
  };

  req.session = obj;

  sessionHelper.saveSession(obj, sessionLength);
};

module.exports = (app) => {
  /**
     * Get User from Sessions
     *
     */

  app.post('/user/:appId/currentUser', async (req, res) => { // for login
    const { appId } = req.params;
    const appKey = req.body.key || req.param('key');
    const sdk = req.body.sdk || 'REST';

    const accessList = customHelper.getAccessList(req);

    if (!accessList || !accessList.userId) {
      return res.status(200).send(null);
    }

    const collectionName = 'User';
    const select = {};
    const sort = {};
    const skip = 0;

    const query = {};
    query.$include = [];
    query.$includeList = [];
    query._id = accessList.userId; // eslint-disable-line 

    apiTracker.log(appId, 'User / CurrentUser', req.url, sdk);

    try {
      const isMasterKey = await appService.isMasterKey(appId, appKey);
      const results = await customService.findOne(
        appId,
        collectionName,
        query,
        select,
        sort,
        skip,
        customHelper.getAccessList(req),
        isMasterKey,
      );
      return res.json(results);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(400).send(error);
    }
  });

  /**
     * User Login Api
     *
     */

  app.post('/user/:appId/login', async (req, res) => { // for login
    const { appId } = req.params;
    const { document, sdk = 'REST' } = req.body; // document contains the credentials
    const appKey = req.body.key || req.param('key');

    let sessionLength = 30; // Default

    apiTracker.log(appId, 'User / Login', req.url, sdk);

    try {
      const application = await appService.getApp(appId);
      const isMasterKey = await appService.isMasterKey(appId, appKey);
      const appSettings = await appService.getAllSettings(appId);

      if (appSettings && appSettings.length > 0) {
        const { settings: authSettings } = _.pick(
          _.first(_.where(appSettings, { category: 'auth' })),
          'settings',
        );
        const temp = Number(getNestedValue([
          'sessions',
          'sessionLength',
        ], authSettings));

        if (!isNaN(temp)) { // eslint-disable-line
          sessionLength = temp;
        }
      }

      const result = await userService.login(
        appId,
        document.username,
        document.password,
        customHelper.getAccessList(req),
        isMasterKey,
        application.keys.encryption_key,
      );
      setSession(req, appId, sessionLength, result, res);
      res.json(result);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      res.status(401).json({
        error,
      });
    }
  });
  /**
     * User Login with provider
     *
     */

  app.post('/user/:appId/loginwithprovider', async (req, res) => {
    const { appId } = req.params;

    let { provider } = req.body;
    const { accessToken, accessSecret } = req.body;

    const sdk = req.body.sdk || 'REST';
    let sessionLength = 30; // Default

    if (!provider) {
      return res.status(400).json({
        message: 'provider is required.',
      });
    }

    provider = provider.toLowerCase();

    if (!accessToken) {
      return res.status(400).json({
        message: 'accessToken is required.',
      });
    }

    if (provider === 'twitter' && !accessSecret) {
      return res.status(400).json({
        message: 'accessSecret is required for given provider.',
      });
    }

    apiTracker.log(appId, 'User / Login with provider', req.url, sdk);

    try {
      const appSettings = await appService.getAllSettings(appId);

      if (!appSettings || appSettings.length === 0) {
        return res.status(400).send('App settings not found.');
      }

      const { settings: authSettings } = _.pick(
        _.first(
          _.where(appSettings, {
            category: 'auth',
          }),
        ), 'settings',
      );

      if (!authSettings) {
        return res.status(400).send('Authentication Settings not found.');
      }

      // Check Session Length from app Settings
      const temp = Number(getNestedValue(['sessions', 'sessionLength'], authSettings));
      if (!isNaN(temp)) {
        sessionLength = temp;
      }
      // Get user by accessToken
      const authPromises = [];
      if (provider === 'facebook') {
        authPromises.push(
          facebookHelper.getUserByAccessToken(req, appId, authSettings, accessToken),
        );
      }
      if (provider === 'google') {
        authPromises.push(
          googleHelper.getUserByTokens(req, appId, authSettings, accessToken, null),
        );
      }
      if (provider === 'github') {
        authPromises.push(
          githubHelper.getUserByAccessToken(req, appId, authSettings, accessToken),
        );
      }
      if (provider === 'linkedin') {
        authPromises.push(
          linkedinHelper.getUserByAccessToken(req, appId, authSettings, accessToken),
        );
      }
      if (provider === 'twitter') {
        authPromises.push(
          twitterHelper.getUserByTokens(req, appId, authSettings, accessToken, accessSecret),
        );
      }

      const user = q.all(authPromises);
      if (user && user.length > 0 && user[0].id) {
        const providerUserId = user[0].id;
        const result = await authService.upsertUserWithProvider(
          appId,
          customHelper.getAccessList(req),
          provider, providerUserId,
          accessToken, accessSecret,
        );
        // create sessions
        setSession(req, appId, sessionLength, result, res);
        return res.json(result);
      }
      return res.status(400).send('Invalid accessToken');
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(400).send(error);
    }
  });

  /**
     * User SignUp API
     */

  app.post('/user/:appId/signup', async (req, res) => { // for user registeration
    const { appId } = req.params;
    const { document, sdk = 'REST' } = req.body;
    const appKey = req.body.key || req.param('key');

    let sessionLength = 30; // Default

    apiTracker.log(appId, 'User / Signup', req.url, sdk);

    try {
      const application = await appService.getApp(appId);
      const appSettings = await appService.getAllSettings(appId);
      const isMasterKey = await appService.isMasterKey(appId, appKey);

      if (appSettings && appSettings.length > 0) {
        const auth = _.first(_.where(appSettings, {
          category: 'auth',
        }));
        if (auth
          && auth.settings
          && auth.settings.sessions
          && auth.settings.sessions.sessionLength) {
          const temp = Number(auth.settings.sessions.sessionLength);
          if (!isNaN(temp)) { // eslint-disable-line
            sessionLength = temp;
          }
        }
      }

      const result = await userService.signup(
        appId, document,
        customHelper.getAccessList(req),
        isMasterKey, application.keys.encryption_key,
      );
      if (result) {
        // create sessions
        setSession(req, appId, sessionLength, result, res);
        res.json(result);
      } else {
        res.send(null);
      }
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      res.status(400).json({
        error,
      });
    }
  });

  /**
     * User Logout Api
     */

  app.post('/user/:appId/logout', (req, res) => { // for logging user out
    const appId = req.params.appId || null;
    const sdk = req.body.sdk || 'REST';

    apiTracker.log(appId, 'User / Logout', req.url, sdk);

    if (req.session.loggedIn === true) {
      req.session.userId = null;
      req.session.loggedIn = false;
      req.session.appId = null;
      req.session.email = null;
      req.session.roles = null;
      sessionHelper.saveSession(req.session);
      res.json(req.body.document);
    } else {
      res.status(400).json({
        message: 'You are not logged in',
      });
    }
  });

  /*
     * Change Password.
     */

  app.put('/user/:appId/changePassword', async (req, res) => { // for logging user out
    const appId = req.params.appId || null;
    const { userId = null } = req.session;
    const sdk = req.body.sdk || 'REST';
    const oldPassword = req.body.oldPassword || '';
    const newPassword = req.body.newPassword || '';
    const appKey = req.body.key || '';

    if (!oldPassword || oldPassword === '') {
      return res.status(400).json({
        message: 'Old Password is required.',
      });
    }

    if (!newPassword || newPassword === '') {
      return res.status(400).json({
        message: 'New Password is required.',
      });
    }

    if (req.session.loggedIn === false) {
      return res.status(400).json({
        message: 'User should be logged in to change the password.',
      });
    }

    apiTracker.log(appId, 'User / Logout', req.url, sdk);

    try {
      const isMasterKey = await appService.isMasterKey(appId, appKey);
      const application = await appService.getApp(appId);
      const result = await userService.changePassword(
        appId,
        userId,
        oldPassword,
        newPassword,
        customHelper.getAccessList(req),
        isMasterKey,
        application.keys.encryption_key,
      );
      return res.json(result);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.json(400, {
        error,
      });
    }
  });

  /**
     * User Reset Password
     */

  app.post('/user/:appId/resetPassword', async (req, res) => {
    const appId = req.params.appId || null;
    const email = req.body.email || null;
    const sdk = req.body.sdk || 'REST';

    if (!email) {
      return res.status(400).json({
        message: 'Email not found.',
      });
    }

    if (req.session.loggedIn === true) {
      return res.status(400).json({
        message: 'Password cannot be reset because the user is already logged in. Use change password instead.',
      });
    }

    apiTracker.log(appId, 'User / ResetPassword', req.url, sdk);

    try {
      await userService.resetPassword(appId, email, customHelper.getAccessList(req), true);
      return res.json({
        message: 'Password reset email sent.',
      });
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(400).json({
        error,
      });
    }
  });

  /**
     * Add To Role Api
     */

  app.put('/user/:appId/addToRole', async (req, res) => { // for assigning user to a role
    const { appId } = req.params;
    const { user, role, sdk = 'REST' } = req.body;
    const appKey = req.body.key || req.param('key');

    apiTracker.log(appId, 'User / Role / Add', req.url, sdk);

    try {
      const isMasterKey = await appService.isMasterKey(appId, appKey);
      const result = await userService.addToRole(
        appId,
        user._id,
        role._id,
        customHelper.getAccessList(req),
        isMasterKey,
      );
      res.json(result);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      res.json(400, {
        error,
      });
    }
  });

  app.put('/user/:appId/removeFromRole', async (req, res) => { // for removing role from the user
    const { appId } = req.params;
    const { user, role, sdk = 'REST' } = req.body;
    const appKey = req.body.key || req.param('key');

    apiTracker.log(appId, 'User / Role / Remove', req.url, sdk);

    try {
      const isMasterKey = await appService.isMasterKey(appId, appKey);
      const result = await userService.removeFromRole(
        appId,
        user._id,
        role._id,
        customHelper.getAccessList(req),
        isMasterKey,
      );
      res.json(result);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      res.status(400).json({
        error,
      });
    }
  });
};
