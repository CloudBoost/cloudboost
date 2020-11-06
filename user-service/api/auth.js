const url = require('url');
const randomString = require('random-string');
const q = require('q');
const keys = require('../config/keys');
const middlewares = require('../config/middlewares');

const fullUrl = (req) => {
  let { protocol } = req;
  if (!keys.config) {
    protocol = 'https';
  }
  return url.format({
    protocol,
    host: req.get('host'),
  });
};

// setup passport
module.exports = (app, passport) => {
  // routes
  /**
   * Used if user registering while choosing a plan as well
   */
  app.post('/user/register', async (req, res, next) => {
    const data = req.body || {};
    try {
      if (data.name && data.password && data.email && data.appName && data.token) {
        const user = await global.projectService.processingSignup(data);
        if (!user) {
          return res.status(500).send('Error: Something went wrong, please try again.');
        }

        const newsListId = 'b0419808f9';
        global.mailChimpService.addSubscriber(newsListId, user.email);
        return req.login(user, (err) => {
          if (err) {
            return next(err);
          }

          // delete user.emailVerificationCode;
          delete user.password; // delete this code form response for security
          global.notificationService.slackNotification(data);
          global.mailService.sendSlackInviteMail(user);
          global.mailService.sendSignupMail(user);
          global.notificationService.linkUserId(user.email, user._id);
          return res.status(200).json(user);
        });
      }
      return res.status(400).send('Submitted form is incomplete. Please complete all details required.');
    } catch (error) {
      if (error !== null) {
        return res.status(500).send(error);
      }
      return res.status(500).send('Error occured. Please try again later.');
    }
  });

  /**
   * Used if user is registering without choosing a plan
   */
  app.post('/user/signup', async (req, res, next) => {
    const data = req.body || {};
    try {
      if (data.email && data.password) {
        const user = await global.userService.register(data);
        if (!user) {
          return res.status(500).send('Error: Something went wrong');
        }

        const newsListId = 'b0419808f9';
        global.mailChimpService.addSubscriber(newsListId, user.email);

        if (data.isAdmin) {
          return req.login(user, (err) => {
            if (err) {
              return next(err);
            }

            // delete user.emailVerificationCode;
            delete user.password; // delete this code form response for security
            global.mailService.sendSlackInviteMail(user);
            global.notificationService.slackNotification(data);
            return res.status(200).json(user);
          });
        }
        global.notificationService.slackNotification(data);
        global.mailService.sendSignupMail(user);
        global.mailService.sendSlackInviteMail(user);
        global.notificationService.linkUserId(user.email, user._id);
        return res.status(200).json(user);
      }
      return res.status(400).send('Bad Request');
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.post('/user/activate', async (req, res, next) => {
    const data = req.body || {};
    try {
      const user = await global.userService.activate(data.code);
      // send activated email.
      global.mailService.sendActivationMail(user);

      return req.login(user, (err) => {
        if (err) {
          return next(err);
        }


        // delete user.emailVerificationCode;
        delete user.password; // delete this code form response for security

        return res.status(200).json(user);
      });
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.post('/user/resendverification', (req, res) => {
    const data = req.body || {};

    global.userService.getAccountByEmail(data.email).then((user) => {
      global.mailService.sendSignupMail(user);
      return res.send(200);
    }, error => res.send(500, error));
  });

  app.post('/user/ResetPassword', (req, res) => {
    const data = req.body || {};

    global.userService.requestResetPassword(data.email).then((user) => {
      // send activated email.
      global.mailService.sendResetPasswordMail(user);
      return res.status(200).json(user);
    }, error => res.send(500, error));
  });

  app.post('/user/updatePassword', (req, res) => {
    const data = req.body || {};

    global.userService.resetPassword(data.code, data.password).then((user) => {
      // send activated email
      global.mailService.sendUpdatePasswordMail(user);
      return res.status(200).send('You have changed password successfully!');
    }, error => res.send(500, error));
  });


  app.post('/user/logout', (req, res) => {
    req.logout();
    return res.status(200).json({});
  });

  app.post('/user/signin', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err || !user) {
        return res.status(500).send(info);
      }

      return req.login(user, async (err1) => {
        if (err1) {
          return next(err1);
        }
        try {
          await global.userService.updateUserLastLogin(user._doc._id);
          const code = randomString();
          const userId = await global.userService.updateOauthAcess(user._doc._id, code);
          const foundUser = await global.userService.getUserBy({ _id: userId });
          delete foundUser._doc.emailVerificationCode;
          delete foundUser._doc.password; // delete this code form response for security
          delete foundUser._doc.salt;
          return res.status(200).send(foundUser);
        } catch (error) {
          return res.status(500).send(error);
        }
      });
    })(req, res, next);
  });

  app.get('/user', middlewares.checkAuth, async (req, res) => {
    const serverUrl = fullUrl(req);

    const currentUserId = req.user.id;
    const responseJson = {};
    try {
      if (currentUserId) {
        const [user, payments] = await q.all([
          global.userService.getAccountById(currentUserId),
          global.paymentProcessService.getPaymentsByUserId(currentUserId),
        ]);
        delete user.password;
        delete user.salt;
        delete user.emailVerificationCode;

        responseJson.user = user;
        responseJson.payments = payments;
        const file = (user && user.fileId) ? await global.fileService.getFileById(user.fileId) : null;
        if (file) {
          // Wrapping for consistency in UI
          const fileObject = {};
          fileObject.id = file._id;
          fileObject.name = file.filename;
          fileObject.url = `${serverUrl}/file/${responseJson.user.fileId}`;

          const wrapper = {};
          wrapper.document = fileObject;

          responseJson.file = wrapper;
        } else {
          responseJson.file = null;
        }
        return res.status(200).json(responseJson);
      }
      return res.status(401).send('Unauthorized');
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.post('/user/update', middlewares.checkAuth, async (req, res) => {
    const data = req.body || {};
    const currentUserId = req.user.id;
    try {
      if (currentUserId) {
        const user = await global.userService.updateUserProfile(currentUserId, data.name, data.oldPassword, data.newPassword);
        if (!user) {
          return res.status(400).send('Error : User not updated');
        }
        if (data.oldPassword !== data.newPassword) {
          // send activated email.
          // global.mandrillService.sendPasswordResetSuccessful(user);
          global.mailService.sendUpdatePasswordMail(user);
        }
        if (user) {
          delete user._doc.password;
        }
        return res.status(200).json(user);
      }
      return res.send(401);
    } catch (error) {
      return res.send(500, error);
    }
  });

  app.post('/user/list', middlewares.checkAuth, async (req, res) => {
    const data = req.body || {};
    const currentUserId = req.user.id;

    try {
      if (currentUserId) {
        if (data.IdArray && data.IdArray.length > 0) {
          const usersList = await global.userService.getUserListByIds(data.IdArray);
          if (usersList && usersList.length > 0) {
            for (let i = 0; i < usersList.length; ++i) {
              if (usersList[i].password) {
                delete usersList[i]._doc.password;
              }
              if (usersList[i].emailVerificationCode) {
                delete usersList[i]._doc.emailVerificationCode;
              }
              if (usersList[i].salt) {
                delete usersList[i]._doc.salt;
              }
              if (usersList[i].provider) {
                delete usersList[i]._doc.provider;
              }
            }
          }

          return res.status(200).json(usersList);
        }
        return res.status(200).json(null);
      }
      return res.send(401);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.post('/user/list/bykeyword', middlewares.checkAuth, async (req, res) => {
    const data = req.body || {};
    const currentUserId = req.user.id;

    try {
      if (currentUserId) {
        const usersList = await global.userService.getUserListByKeyword(data.keyword);
        if (usersList && usersList.length > 0) {
          for (let i = 0; i < usersList.length; ++i) {
            if (usersList[i].password) {
              delete usersList[i]._doc.password;
            }
            if (usersList[i].emailVerificationCode) {
              delete usersList[i]._doc.emailVerificationCode;
            }
            if (usersList[i].salt) {
              delete usersList[i]._doc.salt;
            }
            if (usersList[i].provider) {
              delete usersList[i]._doc.provider;
            }
          }
        }
        return res.status(200).json(usersList);
      }
      return res.send(401);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.put('/user/list/:skip/:limit', middlewares.checkAuth, async (req, res) => {
    const currentUserId = req.user.id;
    const { skip, limit } = req.params;

    const data = req.body || {};
    const { skipUserIds } = data;

    try {
      if (currentUserId) {
        const usersList = await global.userService.getUserBySkipLimit(skip, limit, skipUserIds);
        if (usersList && usersList.length > 0) {
          for (let i = 0; i < usersList.length; ++i) {
            if (usersList[i].password) {
              delete usersList[i]._doc.password;
            }
            if (usersList[i].emailVerificationCode) {
              delete usersList[i]._doc.emailVerificationCode;
            }
            if (usersList[i].salt) {
              delete usersList[i]._doc.salt;
            }
            if (usersList[i].provider) {
              delete usersList[i]._doc.provider;
            }
          }
        }
        return res.status(200).json(usersList);
      }
      return res.send(401);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.get('/user/active/:userId/:isActive', middlewares.checkAuth, async (req, res) => {
    const currentUserId = req.user.id;
    const { userId, isActive } = req.params;

    try {
      if (currentUserId) {
        if (currentUserId !== userId) {
          const user = await global.userService.updateUserActive(currentUserId, userId, isActive);
          if (user) {
            if (user.password) {
              delete user._doc.password;
            }
            if (user.emailVerificationCode) {
              delete user._doc.emailVerificationCode;
            }
            if (user.salt) {
              delete user._doc.salt;
            }
            if (user.provider) {
              delete user._doc.provider;
            }
          }
          return res.status(200).json(user);
        }
        return res.status(500).send('You can\'t perform this action');
      }
      return res.status(401).send('Unauthorized');
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.get('/user/changerole/:userId/:isAdmin', middlewares.checkAuth, async (req, res) => {
    const currentUserId = req.user.id;
    const { userId, isAdmin } = req.params;

    try {
      if (currentUserId) {
        if (currentUserId !== userId) {
          const user = await global.userService.updateUserRole(currentUserId, userId, isAdmin);
          if (user) {
            if (user.password) {
              delete user._doc.password;
            }
            if (user.emailVerificationCode) {
              delete user._doc.emailVerificationCode;
            }
            if (user.salt) {
              delete user._doc.salt;
            }
            if (user.provider) {
              delete user._doc.provider;
            }
          }
          return res.status(200).json(user);
        }
        return res.status(500).send('You can\'t perform this action');
      }
      return res.send(401);
    } catch (error) {
      return res.status(500).send(error);
    }
  });


  app.post('/user/byadmin', middlewares.checkAuth, async (req, res) => {
    const currentUserId = req.user.id;
    const data = req.body || {};

    try {
      if (currentUserId) {
        const user = await global.userService.getUserByEmailByAdmin(currentUserId, data.email);
        if (user) {
          if (user.password) {
            delete user._doc.password;
          }
          if (user.emailVerificationCode) {
            delete user._doc.emailVerificationCode;
          }
          if (user.salt) {
            delete user._doc.salt;
          }
          if (user.provider) {
            delete user._doc.provider;
          }
        }
        return res.status(200).json(user);
      }
      return res.status(401).send('unauthorized');
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.post('/oauth/token', async (req, res) => {
    if (!req.body.code && !req.query.code) {
      res.status(404).send('User Needs Authorisation');
    }
    try {
      const code = req.query.code || req.body.code;
      const user = await global.userService.getUserBy({ oauth_code: code });
      if (user) {
        const access_token = user._id; // eslint-disable-line
        const { email } = user;
        res.status(200).json({ access_token, email });
      } else {
        res.status(401).json('Token expired please login again');
      }
    } catch (err) {
      res.status(404).json(err);
    }
  });
  return app;
};
