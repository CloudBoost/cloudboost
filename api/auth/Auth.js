
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

const sessionHelper = require('../../helpers/session');
const appService = require('../../services/app');
const authService = require('../../services/auth');

module.exports = function (app) {
  app.get('/auth/:appId/twitter', (req, res) => {
    _getAppSettings(req, res).then((respObj) => {
      const appId = respObj.appId;
      const authSettings = respObj.authSettings;

      twitterHelper.getLoginUrl(req, appId, authSettings).then(data => res.status(200).json({ url: data.loginUrl }), (err) => {
        res.status(500).send(err);
      });
    });
  });

  app.get('/auth/:appId/twitter/callback', (req, res) => {
    const requestToken = req.query.oauth_token;
    const verifier = req.query.oauth_verifier;

    let sessionLength = 30;// Default

    _getAppSettings(req, res).then((respObj) => {
      const appId = respObj.appId;
      const authSettings = respObj.authSettings;

      // Check Session Length from app Settings
      if (authSettings.sessions && authSettings.sessions.sessionLength) {
        const temp = Number(authSettings.sessions.sessionLength);
        if (!isNaN(temp)) {
          sessionLength = temp;
        }
      }

      let twitterTokens = null;
      const twitterReqSecret = null;

      // Make twitter requests
      twitterHelper.getAccessToken(req, appId, authSettings, requestToken, twitterReqSecret, verifier)
        .then((data) => {
          twitterTokens = data;
          delete req.session.twitterReqSecret;

          return twitterHelper.getUserByTokens(req, appId, authSettings, data.accessToken, data.accessSecret);
        }).then((user) => {
          const provider = 'twitter';
          const providerUserId = user.id;
          const providerAccessToken = twitterTokens.accessToken;
          const providerAccessSecret = twitterTokens.accessSecret;

          // save the user
          return authService.upsertUserWithProvider(appId, customHelper.getAccessList(req), provider, providerUserId, providerAccessToken, providerAccessSecret);
        }).then((result) => {
          // create sessions
          const session = setSession(req, appId, sessionLength, result, res);
          return res.redirect(`${authSettings.general.callbackURL}?cbtoken=${session.id}`);
        }, (err) => {
          delete req.session.twitterReqSecret;
          res.status(500).send(err);
        });
    });
  });


  app.get('/auth/:appId/github', (req, res) => {
    _getAppSettings(req, res).then((respObj) => {
      const appId = respObj.appId;
      const authSettings = respObj.authSettings;

      githubHelper.getLoginUrl(req, appId, authSettings).then(data => res.status(200).json({ url: data.loginUrl }), (error) => {
        res.status(500).send(error);
      });
    });
  });

  app.get('/auth/:appId/github/callback', (req, res) => {
    const code = req.query.code;

    let sessionLength = 30;// Default
    _getAppSettings(req, res).then((respObj) => {
      const appId = respObj.appId;
      const authSettings = respObj.authSettings;

      // Check Session Length from app Settings
      if (authSettings.sessions && authSettings.sessions.sessionLength) {
        const temp = Number(authSettings.sessions.sessionLength);
        if (!isNaN(temp)) {
          sessionLength = temp;
        }
      }

      let githubAccessToken = null;

      githubHelper.getOAuthAccessToken(req, appId, authSettings, code).then((accessToken) => {
        githubAccessToken = accessToken;
        return githubHelper.getUserByAccessToken(req, appId, authSettings, accessToken);
      }).then((user) => {
        const provider = 'github';
        const providerUserId = user.id;
        const providerAccessToken = githubAccessToken;
        const providerAccessSecret = null;

        return authService.upsertUserWithProvider(appId, customHelper.getAccessList(req), provider, providerUserId, providerAccessToken, providerAccessSecret);
      }).then((result) => {
        // create sessions
        const session = setSession(req, appId, sessionLength, result, res);
        return res.redirect(`${authSettings.general.callbackURL}?cbtoken=${session.id}`);
      }, (error) => {
        res.status(400).json({
          error,
        });
      });
    });
  });

  app.get('/auth/:appId/linkedin', (req, res) => {
    _getAppSettings(req, res).then((respObj) => {
      const appId = respObj.appId;
      const authSettings = respObj.authSettings;

      linkedinHelper.getLoginUrl(req, appId, authSettings).then(data => res.status(200).json({ url: data.loginUrl }), (error) => {
        res.status(500).send(error);
      });
    });
  });

  app.get('/auth/:appId/linkedin/callback', (req, res) => {
    let sessionLength = 30;// Default
    _getAppSettings(req, res).then((respObj) => {
      const appId = respObj.appId;
      const authSettings = respObj.authSettings;

      // Check Session Length from app Settings
      if (authSettings.sessions && authSettings.sessions.sessionLength) {
        const temp = Number(authSettings.sessions.sessionLength);
        if (!isNaN(temp)) {
          sessionLength = temp;
        }
      }

      let linkedinAccessToken = null;

      linkedinHelper.getAccessToken(req, appId, authSettings, res, req.query.code, req.query.state)
        .then((accessToken) => {
          linkedinAccessToken = accessToken;

          linkedinHelper.getUserByAccessToken(req, appId, authSettings, accessToken).then((user) => {
            const provider = 'linkedin';
            const providerUserId = user.id;
            const providerAccessToken = linkedinAccessToken;
            const providerAccessSecret = null;

            authService.upsertUserWithProvider(appId, customHelper.getAccessList(req), provider, providerUserId, providerAccessToken, providerAccessSecret)
              .then((result) => {
                // create sessions
                const session = setSession(req, appId, sessionLength, result, res);
                return res.redirect(`${authSettings.general.callbackURL}?cbtoken=${session.id}`);
              }, (error) => {
                res.status(500).send(error);
              });
          }, (error) => {
            res.status(500).send(error);
          });
        }, (error) => {
          res.status(500).send(error);
        });
    });
  });


  app.get('/auth/:appId/google', (req, res) => {
    _getAppSettings(req, res).then((respObj) => {
      const appId = respObj.appId;
      const authSettings = respObj.authSettings;

      googleHelper.getLoginUrl(req, appId, authSettings).then(data => res.status(200).json({ url: data.loginUrl }), (error) => {
        res.status(500).send(error);
      });
    });
  });

  app.get('/auth/:appId/google/callback', (req, res) => {
    const code = req.query.code;

    let sessionLength = 30;// Default
    _getAppSettings(req, res).then((respObj) => {
      const appId = respObj.appId;
      const authSettings = respObj.authSettings;

      // Check Session Length from app Settings
      if (authSettings.sessions && authSettings.sessions.sessionLength) {
        const temp = Number(authSettings.sessions.sessionLength);
        if (!isNaN(temp)) {
          sessionLength = temp;
        }
      }

      let googleTokens = null;
      googleHelper.getToken(req, appId, authSettings, code).then((tokens) => {
        googleTokens = tokens;
        return googleHelper.getUserByTokens(req, appId, authSettings, tokens.access_token, tokens.refresh_token);
      }).then((profile) => {
        const provider = 'google';
        const providerUserId = profile.id;
        const providerAccessToken = googleTokens.access_token;
        const providerAccessSecret = null;

        return authService.upsertUserWithProvider(appId, customHelper.getAccessList(req), provider, providerUserId, providerAccessToken, providerAccessSecret);
      }).then((result) => {
        // create sessions
        const session = setSession(req, appId, sessionLength, result, res);
        return res.redirect(`${authSettings.general.callbackURL}?cbtoken=${session.id}`);
      }, (error) => {
        res.status(500).send(error);
      });
    });
  });

  app.get('/auth/:appId/facebook', (req, res) => {
    _getAppSettings(req, res).then((respObj) => {
      const appId = respObj.appId;
      const authSettings = respObj.authSettings;

      facebookHelper.getLoginUrl(req, appId, authSettings).then(data => res.status(200).json({ url: data.loginUrl }), (error) => {
        res.status(500).send(error);
      });
    });
  });

  app.get('/auth/:appId/facebook/callback', (req, res) => {
    const code = req.query.code;

    let sessionLength = 30;// Default
    _getAppSettings(req, res).then((respObj) => {
      const appId = respObj.appId;
      const authSettings = respObj.authSettings;

      // Check Session Length from app Settings
      if (authSettings.sessions && authSettings.sessions.sessionLength) {
        const temp = Number(authSettings.sessions.sessionLength);
        if (!isNaN(temp)) {
          sessionLength = temp;
        }
      }

      let fbAccessToken = null;
      facebookHelper.getAccessToken(req, appId, authSettings, code).then((accessToken) => {
        fbAccessToken = accessToken;
        return facebookHelper.getUserByAccessToken(req, appId, authSettings, accessToken);
      }).then((user) => {
        const provider = 'facebook';
        const providerUserId = user.id;
        const providerAccessToken = fbAccessToken;
        const providerAccessSecret = null;

        return authService.upsertUserWithProvider(appId, customHelper.getAccessList(req), provider, providerUserId, providerAccessToken, providerAccessSecret);
      }).then((result) => {
        // create sessions
        const session = setSession(req, appId, sessionLength, result, res);
        return res.redirect(`${authSettings.general.callbackURL}?cbtoken=${session.id}`);
      }, (error) => {
        res.status(500).send(error);
      });
    });
  });
};

/** ********************** Private Functions ************************ */

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
    roles: _.map(result.roles, role => role._id),
  };

  req.session = obj;

  sessionHelper.saveSession(obj, sessionLength);
  return req.session;
}

function _getAppSettings(req, res) {
  const deferred = q.defer();

  const appId = req.params.appId || null;

  if (!appId) {
    return res.status(400).send('AppId is invalid.');
  }

  const promises = [];

  promises.push(appService.getAllSettings(appId));
  q.all(promises).then((list) => {
    if (!list[0] || list[0].length == 0) {
      return res.status(400).send('App Settings not found.');
    }

    const auth = _.first(_.where(list[0], { category: 'auth' }));
    if (auth) {
      var authSettings = auth.settings;
    }

    if (!authSettings) {
      return res.status(400).send('Authentication Settings not found.');
    }

    const response = {
      appId,
      authSettings,
    };
    deferred.resolve(response);
  }, error => res.status(400).send(error));

  return deferred.promise;
}
