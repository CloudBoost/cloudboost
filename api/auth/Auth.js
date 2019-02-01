/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const winston = require('winston');
const _ = require('underscore');
const uuid = require('uuid');

const customHelper = require('../../helpers/custom.js');

const twitterHelper = require('../../helpers/twitter.js');
const githubHelper = require('../../helpers/github.js');
const linkedinHelper = require('../../helpers/linkedin.js');
const googleHelper = require('../../helpers/google.js');
const facebookHelper = require('../../helpers/facebook.js');

const sessionHelper = require('../../helpers/session');
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
    userId: result._id, // eslint-disable-line no-underscore-dangle
    loggedIn: true,
    appId,
    roles: _.map(result.roles, role => role._id), // eslint-disable-line no-underscore-dangle
  };

  req.session = obj;

  sessionHelper.saveSession(obj, sessionLength);
  return req.session;
};

const getAppSettings = async (req, res, next) => {
  const appId = req.params.appId || null;

  if (!appId) {
    return res.status(400).send('AppId is invalid.');
  }

  try {
    const allSettings = await appService.getAllSettings(appId);
    if (!allSettings || allSettings.length === 0) {
      return res.status(400).send('App Settings not found.');
    }

    const auth = _.first(_.where(allSettings, {
      category: 'auth',
    }));
    let authSettings;
    if (auth) {
      authSettings = auth.settings;
    }

    if (!authSettings) {
      return res.status(400).send('Authentication Settings not found.');
    }

    req.responseObject = {
      appId,
      authSettings,
    };
    return next();
  } catch (error) {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    return res.status(400).send(error);
  }
};

module.exports = (app) => {
  app.get('/auth/:appId/twitter', getAppSettings, async (req, res) => {
    const { appId, authSettings } = req.responseObject;
    try {
      const responseData = await twitterHelper.getLoginUrl(req, appId, authSettings);
      return res.status(200).json({
        url: responseData.loginUrl,
      });
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(500).send(error);
    }
  });

  app.get('/auth/:appId/twitter/callback', getAppSettings, async (req, res) => {
    const requestToken = req.query.oauth_token;
    const verifier = req.query.oauth_verifier;

    let sessionLength = 30; // Default
    const { appId, authSettings } = req.responseObject;

    // Check Session Length from app Settings
    if (authSettings.sessions && authSettings.sessions.sessionLength) {
      const temp = Number(authSettings.sessions.sessionLength);
      if (!isNaN(temp)) { // eslint-disable-line no-restricted-globals
        sessionLength = temp;
      }
    }

    const twitterReqSecret = null;
    try {
      // Make twitter requests
      const twitterTokens = await twitterHelper.getAccessToken(
        req, appId, authSettings, requestToken, twitterReqSecret, verifier,
      );
      delete req.session.twitterReqSecret;
      const user = await twitterHelper.getUserByTokens(
        req, appId, authSettings, twitterTokens.accessToken, twitterTokens.accessSecret,
      );

      const provider = 'twitter';
      const providerUserId = user.id;
      const providerAccessToken = twitterTokens.accessToken;
      const providerAccessSecret = twitterTokens.accessSecret;
      // save the user
      const savedUser = await authService.upsertUserWithProvider(
        appId, customHelper.getAccessList(req),
        provider, providerUserId, providerAccessToken, providerAccessSecret,
      );
      // create sessions
      const session = setSession(req, appId, sessionLength, savedUser, res);
      return res.redirect(`${authSettings.general.callbackURL}?cbtoken=${session.id}`);
    } catch (error) {
      delete req.session.twitterReqSecret;
      return res.status(500).send(error);
    }
  });


  app.get('/auth/:appId/github', getAppSettings, async (req, res) => {
    const { appId, authSettings } = req.responseObject;
    try {
      const data = await githubHelper.getLoginUrl(req, appId, authSettings);
      return res.status(200).json({ url: data.loginUrl });
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.get('/auth/:appId/github/callback', getAppSettings, async (req, res) => {
    const { code } = req.query;
    const { appId, authSettings } = req.responseObject;

    let sessionLength = 30; // Default
    try {
      if (authSettings.sessions && authSettings.sessions.sessionLength) {
        const temp = Number(authSettings.sessions.sessionLength);
        if (!isNaN(temp)) { // eslint-disable-line no-restricted-globals
          sessionLength = temp;
        }
      }
      const githubAccessToken = await githubHelper.getOAuthAccessToken(
        req, appId, authSettings, code,
      );
      const user = await githubHelper.getUserByAccessToken(
        req, appId, authSettings, githubAccessToken,
      );
      const provider = 'github';
      const providerUserId = user.id;
      const providerAccessToken = githubAccessToken;
      const providerAccessSecret = null;

      const savedUser = await authService.upsertUserWithProvider(
        appId, customHelper.getAccessList(req), provider,
        providerUserId, providerAccessToken, providerAccessSecret,
      );
      // create sessions
      const session = setSession(req, appId, sessionLength, savedUser, res);
      return res.redirect(`${authSettings.general.callbackURL}?cbtoken=${session.id}`);
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

  app.get('/auth/:appId/linkedin', getAppSettings, async (req, res) => {
    const { appId, authSettings } = req.responseObject;
    try {
      const data = await linkedinHelper.getLoginUrl(req, appId, authSettings);
      return res.status(200).json({ url: data.loginUrl });
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.get('/auth/:appId/linkedin/callback', getAppSettings, async (req, res) => {
    const { appId, authSettings } = req.responseObject;
    const { code, state } = req.query;

    let sessionLength = 30; // Default
    try {
      if (authSettings.sessions && authSettings.sessions.sessionLength) {
        const temp = Number(authSettings.sessions.sessionLength);
        if (!isNaN(temp)) { // eslint-disable-line no-restricted-globals
          sessionLength = temp;
        }
      }
      const linkedinAccessToken = await linkedinHelper
        .getAccessToken(req, appId, authSettings, res, code, state);
      const user = await linkedinHelper
        .getUserByAccessToken(req, appId, authSettings, linkedinAccessToken);
      const provider = 'linkedin';
      const providerUserId = user.id;
      const providerAccessToken = linkedinAccessToken;
      const providerAccessSecret = null;
      const result = await authService.upsertUserWithProvider(
        appId, customHelper.getAccessList(req), provider,
        providerUserId, providerAccessToken, providerAccessSecret,
      );
      // create sessions
      const session = setSession(req, appId, sessionLength, result, res);
      return res.redirect(`${authSettings.general.callbackURL}?cbtoken=${session.id}`);
    } catch (error) {
      return res.status(500).send(error);
    }
  });


  app.get('/auth/:appId/google', getAppSettings, async (req, res) => {
    const { appId, authSettings } = req.responseObject;
    try {
      const data = await googleHelper.getLoginUrl(req, appId, authSettings);
      return res.status(200).json({ url: data.loginUrl });
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.get('/auth/:appId/google/callback', getAppSettings, async (req, res) => {
    const { code } = req.query;
    const { appId, authSettings } = req.responseObject;

    let sessionLength = 30; // Default
    try {
      if (authSettings.sessions && authSettings.sessions.sessionLength) {
        const temp = Number(authSettings.sessions.sessionLength);
        if (!isNaN(temp)) { // eslint-disable-line no-restricted-globals
          sessionLength = temp;
        }
      }
      const googleTokens = await googleHelper.getToken(req, appId, authSettings, code);
      const profile = await googleHelper.getUserByTokens(
        req, appId, authSettings, googleTokens.access_token, googleTokens.refresh_token,
      );
      const provider = 'google';
      const providerUserId = profile.id;
      const providerAccessToken = googleTokens.access_token;
      const providerAccessSecret = null;

      const result = await authService.upsertUserWithProvider(
        appId, customHelper.getAccessList(req), provider,
        providerUserId, providerAccessToken, providerAccessSecret,
      );
      // create sessions
      const session = setSession(req, appId, sessionLength, result, res);
      return res.redirect(`${authSettings.general.callbackURL}?cbtoken=${session.id}`);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(500).send(error);
    }
  });

  app.get('/auth/:appId/facebook', getAppSettings, async (req, res) => {
    const { appId, authSettings } = req.responseObject;
    try {
      const data = await facebookHelper.getLoginUrl(req, appId, authSettings);
      return res.status(200).json({ url: data.loginUrl });
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.get('/auth/:appId/facebook/callback', getAppSettings, async (req, res) => {
    const { code } = req.query;
    const { appId, authSettings } = req.responseObject;

    let sessionLength = 30; // Default
    try {
      // Check Session Length from app Settings
      if (authSettings.sessions && authSettings.sessions.sessionLength) {
        const temp = Number(authSettings.sessions.sessionLength);
        if (!isNaN(temp)) { // eslint-disable-line no-restricted-globals
          sessionLength = temp;
        }
      }
      const fbAccessToken = await facebookHelper.getAccessToken(
        req, appId, authSettings, code,
      );
      const user = await facebookHelper.getUserByAccessToken(
        req, appId, authSettings, fbAccessToken,
      );
      const provider = 'facebook';
      const providerUserId = user.id;
      const providerAccessToken = fbAccessToken;
      const providerAccessSecret = null;

      const result = await authService.upsertUserWithProvider(
        appId, customHelper.getAccessList(req), provider,
        providerUserId, providerAccessToken, providerAccessSecret,
      );
      // create sessions
      const session = setSession(req, appId, sessionLength, result, res);
      return res.redirect(`${authSettings.general.callbackURL}?cbtoken=${session.id}`);
    } catch (error) {
      return res.status(500).send(error);
    }
  });
};
