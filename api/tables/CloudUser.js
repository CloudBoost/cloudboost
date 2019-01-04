/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const _ = require('underscore');
const uuid = require('uuid');
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

module.exports = function (app) {
  /**
     * Get User from Sessions
     *
     */

  app.post('/user/:appId/currentUser', (req, res) => { // for login
    const appId = req.params.appId;
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
    query._id = accessList.userId;

    appService.isMasterKey(appId, appKey).then(isMasterKey => customService.findOne(appId, collectionName, query, select, sort, skip, accessList, isMasterKey)).then((result) => {
      res.json(result);
    }, (error) => {
      res.status(400).send(error);
    });

    apiTracker.log(appId, 'User / CurrentUser', req.url, sdk);
  });

  /**
     * User Login Api
     *
     */

  app.post('/user/:appId/login', (req, res) => { // for login
    const appId = req.params.appId;
    const document = req.body.document; // document contains the credentials
    const appKey = req.body.key || req.param('key');
    const sdk = req.body.sdk || 'REST';

    let isMasterKey = false;
    let sessionLength = 30; // Default

    appService.getApp(appId).then((application) => {
      const promises = [];
      promises.push(appService.getAllSettings(appId));
      promises.push(appService.isMasterKey(appId, appKey));

      q.all(promises).then((list) => {
        isMasterKey = list[1];

        // Check Session Length from app Settings
        if (list[0] && list[0].length > 0) {
          const auth = _.first(_.where(list[0], {
            category: 'auth',
          }));
          if (auth && auth.settings && auth.settings.sessions && auth.settings.sessions.sessionLength) {
            const temp = Number(auth.settings.sessions.sessionLength);
            if (!isNaN(temp)) {
              sessionLength = temp;
            }
          }
        }

        // Make request
        return userService.login(appId, document.username, document.password, customHelper.getAccessList(req), isMasterKey, application.keys.encryption_key);
      }).then((result) => {
        // create sessions
        setSession(req, appId, sessionLength, result, res);
        res.json(result);
      }, (error) => {
        res.status(401).json({
          error,
        });
      });

      apiTracker.log(appId, 'User / Login', req.url, sdk);
    });
  });
  /**
     * User Login with provider
     *
     */

  app.post('/user/:appId/loginwithprovider', (req, res) => {
    const appId = req.params.appId;
    const appKey = req.body.key || req.param('key');

    let provider = req.body.provider;
    const accessToken = req.body.accessToken;
    const accessSecret = req.body.accessSecret || null;

    const sdk = req.body.sdk || 'REST';
    let sessionLength = 30; // Default

    if (!provider) {
      res.status(400).json({
        message: 'provider is required.',
      });
      return;
    }

    provider = provider.toLowerCase();

    if (!accessToken) {
      res.status(400).json({
        message: 'accessToken is required.',
      });
      return;
    }

    if (provider === 'twitter' && !accessSecret) {
      res.status(400).json({
        message: 'accessSecret is required for given provider.',
      });
      return;
    }

    const promises = [];
    promises.push(appService.getAllSettings(appId));
    promises.push(appService.isMasterKey(appId, appKey));

    q.all(promises).then((list) => {
      if (!list[0] || list[0].length == 0) {
        return res.status(400).send('App Settings not found.');
      }

      const auth = _.first(_.where(list[0], {
        category: 'auth',
      }));
      if (auth) {
        var authSettings = auth.settings;
      }

      if (!authSettings) {
        return res.status(400).send('Authentication Settings not found.');
      }

      // Check Session Length from app Settings
      if (authSettings.sessions && authSettings.sessions.sessionLength) {
        const temp = Number(authSettings.sessions.sessionLength);
        if (!isNaN(temp)) {
          sessionLength = temp;
        }
      }

      // Get user by accessToken
      const authPromises = [];
      if (provider === 'facebook') {
        authPromises.push(facebookHelper.getUserByAccessToken(req, appId, authSettings, accessToken));
      }
      if (provider === 'google') {
        authPromises.push(googleHelper.getUserByTokens(req, appId, authSettings, accessToken, null));
      }
      if (provider === 'github') {
        authPromises.push(githubHelper.getUserByAccessToken(req, appId, authSettings, accessToken));
      }
      if (provider === 'linkedin') {
        authPromises.push(linkedinHelper.getUserByAccessToken(req, appId, authSettings, accessToken));
      }
      if (provider === 'twitter') {
        authPromises.push(twitterHelper.getUserByTokens(req, appId, authSettings, accessToken, accessSecret));
      }

      q.all(authPromises).then((user) => {
        if (user && user.length > 0 && user[0].id) {
          const providerUserId = user[0].id;
          return authService.upsertUserWithProvider(appId, customHelper.getAccessList(req), provider, providerUserId, accessToken, accessSecret);
        }
        const deferred = q.defer();
        deferred.reject('Invalid accessToken');
        return deferred.promise;
      }).then((result) => {
        // create sessions
        setSession(req, appId, sessionLength, result, res);
        res.json(result);
      }, error => res.status(400).send(error));
    }, error => res.status(400).send(error));

    apiTracker.log(appId, 'User / Login with provider', req.url, sdk);
  });

  /**
     * User SignUp API
     */

  app.post('/user/:appId/signup', (req, res) => { // for user registeration
    const appId = req.params.appId;
    const document = req.body.document;
    const appKey = req.body.key || req.param('key');
    const sdk = req.body.sdk || 'REST';
    let isMasterKey = false;
    let sessionLength = 30; // Default

    const promises = [];
    appService.getApp(appId).then((application) => {
      promises.push(appService.getAllSettings(appId));
      promises.push(appService.isMasterKey(appId, appKey));

      q.all(promises).then((list) => {
        isMasterKey = list[1];

        // Check Session Length from app Settings
        if (list[0] && list[0].length > 0) {
          const auth = _.first(_.where(list[0], {
            category: 'auth',
          }));
          if (auth && auth.settings && auth.settings.sessions && auth.settings.sessions.sessionLength) {
            const temp = Number(auth.settings.sessions.sessionLength);
            if (!isNaN(temp)) {
              sessionLength = temp;
            }
          }
        }

        // Make request
        return userService.signup(appId, document, customHelper.getAccessList(req), isMasterKey, application.keys.encryption_key);
      }).then((result) => {
        if (result) {
          // create sessions
          setSession(req, appId, sessionLength, result, res);
          res.json(result);
        } else {
          res.send(null);
        }
      }, (error) => {
        res.status(400).json({
          error,
        });
      });
    });

    apiTracker.log(appId, 'User / Signup', req.url, sdk);
  });

  /**
     * User Logout Api
     */

  app.post('/user/:appId/logout', (req, res) => { // for logging user out
    const appId = req.params.appId || null;
    const sdk = req.body.sdk || 'REST';
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
    apiTracker.log(appId, 'User / Logout', req.url, sdk);
  });

  /*
     * Change Password.
     */

  app.put('/user/:appId/changePassword', (req, res) => { // for logging user out
    const appId = req.params.appId || null;
    let userId = req.session.userId || null;
    const sdk = req.body.sdk || 'REST';
    const oldPassword = req.body.oldPassword || '';
    const newPassword = req.body.newPassword || '';
    const appKey = req.body.key || '';

    if (!oldPassword || oldPassword === '') {
      res.status(400).json({
        message: 'Old Password is required.',
      });
    }

    if (!newPassword || newPassword === '') {
      res.status(400).json({
        message: 'New Password is required.',
      });
    }

    if (req.session.loggedIn === false) {
      res.status(400).json({
        message: 'User should be logged in to change the password.',
      });
    } else {
      userId = req.session.userId;
      appService.isMasterKey(appId, appKey).then((isMasterKey) => {
        appService.getApp(appId).then(application => userService.changePassword(appId, userId, oldPassword, newPassword, customHelper.getAccessList(req), isMasterKey, application.keys.encryption_key)).then((result) => {
          res.json(result);
        }, (error) => {
          res.json(400, {
            error,
          });
        });
      });
    }
    apiTracker.log(appId, 'User / Logout', req.url, sdk);
  });

  /**
     * User Reset Password
     */

  app.post('/user/:appId/resetPassword', (req, res) => {
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

    userService.resetPassword(appId, email, customHelper.getAccessList(req), true).then(() => {
      res.status(200).json({
        message: 'Password reset email sent.',
      });
    }, (error) => {
      res.json(400, {
        error,
      });
    });

    apiTracker.log(appId, 'User / ResetPassword', req.url, sdk);
  });

  /**
     * Add To Role Api
     */

  app.put('/user/:appId/addToRole', (req, res) => { // for assigning user to a role
    const appId = req.params.appId;
    const user = req.body.user;
    const role = req.body.role;
    const appKey = req.body.key || req.param('key');
    const sdk = req.body.sdk || 'REST';

    appService.isMasterKey(appId, appKey).then(isMasterKey => userService.addToRole(appId, user._id, role._id, customHelper.getAccessList(req), isMasterKey)).then((result) => {
      res.json(result);
    }, (error) => {
      res.json(400, {
        error,
      });
    });
    apiTracker.log(appId, 'User / Role / Add', req.url, sdk);
  });

  app.put('/user/:appId/removeFromRole', (req, res) => { // for removing role from the user
    const appId = req.params.appId;
    const user = req.body.user;
    const role = req.body.role;
    const appKey = req.body.key || req.param('key');
    const sdk = req.body.sdk || 'REST';

    appService.isMasterKey(appId, appKey).then(isMasterKey => userService.removeFromRole(appId, user._id, role._id, customHelper.getAccessList(req), isMasterKey)).then((result) => {
      res.json(result);
    }, (error) => {
      res.status(400).json({
        error,
      });
    });

    apiTracker.log(appId, 'User / Role / Remove', req.url, sdk);
  });

  /* Private Methods */

  function setSession(req, appId, sessionLength, result, res) {
    if (!req.session.id) {
      req.session = {};
      req.session.id = uuid.v1();
    }
    res.header('sessionID', req.session.id);

    const obj = {
      id: req.session.id,
      userId: result._id,
      loggedIn: true,
      appId,
      email: result.email,
      roles: _.map(result.roles, role => role._id),
    };

    req.session = obj;

    sessionHelper.saveSession(obj, sessionLength);
  }
};
