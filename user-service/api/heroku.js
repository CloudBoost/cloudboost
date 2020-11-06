/* eslint-disable no-param-reassign
 */
const winston = require('winston');

const auth = require('basic-auth');
const sha1 = require('sha1');
const keys = require('../config/keys.js');

/*
 * This API is built from these links :
 * https://devcenter.heroku.com/articles/building-a-heroku-add-on
 */

module.exports = function (app) {
  /*
  * This is Heroku SSO Login
  */

  app.post('/heroku/sso/login', (req, res) => {
    const preToken = `${req.body.id}:${keys.herokuSalt}:${req.body.timestamp}`;
    const token = sha1(preToken);
    const navData = req.body['nav-data'];

    if (token !== req.body.token) {
      return res.status(403).end('Unauthorized.');
    }

    if (parseInt(req.body.timestamp, 10) < (new Date().getTime() / 1000) - 5 * 60) {
      return res.status(403).end('Session Expired.');
    }

    // find an app  and then find the user.

    const appId = req.body.id;

    return global.projectService.getProject(appId).then((project) => {
      if (!project) {
        return res.status(404).end('App not found.');
      }

      const userId = project._userId;

      if (!userId) {
        return res.status(404).end('User not found.');
      }

      return global.userService.getAccountById(userId).then((user) => {
        if (!user) {
          return res.status(404).end('User not found.');
        }

        // if user is found, then login the user.

        return req.login(user, (err) => {
          if (err) {
            return res.status(500).end(err);
          }


          delete user.emailVerificationCode;
          delete user.password; // delete this code form response for security

          res.writeHead(302, {
            'Set-Cookie': `heroku-nav-data=${navData};userId=${userId}`,
            Location: `https://dashboard.cloudboost.io?provider=heroku&app=${req.body.app}&userId=${userId}`,
          });

          return res.end();
        });
      }, err => res.status(500).end(err));
    }, err => res.status(500).end(err));
  });


  /*
  * This is Heroku Create Resource Fucntion
  */

  app.post('/heroku/resources', (req, res) => {
    const credentials = auth(req);

    if (!credentials || credentials.name !== keys.herokuUsername || credentials.pass !== keys.herokuPassword) {
      res.statusCode = 401;
      return res.end('Access denied');
    }

    // geenrate the userId,
    const user = {};
    user.email = `${global.utilService.generateRandomString()}@heroku.com`;
    user.emailVerified = true;
    user.password = global.utilService.generateRandomString();
    user.name = 'Heroku';
    user.isAdmin = false;
    user.isActive = true;
    user.provider = 'heroku';

    if (!req.body.plan) { return res.status(400).end('Plan ID is null'); }


    let planId = 2;

    if (req.body.plan.toString() === 'launch') {
      planId = 2;
    }

    if (req.body.plan.toString() === 'bootstrap') {
      planId = 3;
    }

    if (req.body.plan.toString() === 'scale') {
      planId = 4;
    }

    if (req.body.plan.toString() === 'unicorn') {
      planId = 5;
    }


    if (planId < 2 && planId > 5) {
      return res.status(400).end('Invalid Plan ID');
    }

    return global.userService.register(user)
      .then((registeredUser) => {
        global.projectService.createProject('Heroku App', registeredUser.id, {
          provider: 'heroku',
        }).then((project) => {
          if (!project) {
            return res.status(400).send('Error : Project not created');
          }

          return global.paymentProcessService.createThirdPartySale(project.appId, planId)
            .then(() => res.status(200).json({
              id: project.appId,
              config: {
                CLOUDBOOST_URL: 'https://api.cloudboost.io',
                CLOUDBOOST_PORTAL: 'https://dashboard.cloudboost.io',
                CLOUDBOOST_APP_ID: project.appId,
                CLOUDBOOST_CLIENT_KEY: project.keys.js,
                CLOUDBOOST_MASTER_KEY: project.keys.master,
              },
            }), error => res.status(500).end(error));
        }, (error) => {
          winston.error({
            error: String(error),
            stack: new Error().stack,
          });
          return res.status(500).send(error);
        });
      }, (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        return res.status(500).send(error);
      });
  });


  /*
  * Delete a resource.
  */
  app.delete('/heroku/resources/:id', (req, res) => {
    const credentials = auth(req);

    if (!credentials || credentials.name !== keys.herokuUsername || credentials.pass !== keys.herokuPassword) {
      res.statusCode = 401;
      return res.end('Access denied');
    }

    return global.projectService.deleteAppAsAdmin(req.params.id)
      .then(() => res.status(200).end(), error => res.status(500).end(error));
  });


  /*
  * Update a plan.
  */
  app.put('/heroku/resources/:id', (req, res) => {
    const credentials = auth(req);

    if (!req.body.plan) { return res.status(400).end('Plan ID is null'); }


    let planId = 2;

    if (req.body.plan.toString() === 'launch') {
      planId = 2;
    }

    if (req.body.plan.toString() === 'bootstrap') {
      planId = 3;
    }

    if (req.body.plan.toString() === 'scale') {
      planId = 4;
    }

    if (req.body.plan.toString() === 'unicorn') {
      planId = 5;
    }


    if (planId < 2 && planId > 5) {
      return res.status(400).end('Invalid Plan ID');
    }

    if (!credentials || credentials.name !== keys.herokuUsername || credentials.pass !== keys.herokuPassword) {
      res.statusCode = 401;
      return res.end('Access denied');
    }
    return global.paymentProcessService.createThirdPartySale(req.params.id, planId)
      .then(() => res.status(200).end(), error => res.status(500).end(error));
  });

  return app;
};
