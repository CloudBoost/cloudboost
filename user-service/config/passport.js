
const winston = require('winston');
const LocalStrategy = require('passport-local').Strategy;
const AzureStoreStrategy = require('passport-azure-store').Strategy;

const User = require('../model/user');
const UserService = require('../services/userService.js');

module.exports = function (app, passport) {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, ((email, password, done) => {
    try {
      User.findOne({
        email,
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'Incorrect email.',
          });
        }

        if (!UserService.validatePassword(password, user.password, user.salt)) {
          return done(null, false, {
            message: 'Incorrect password.',
          });
        }
        return done(null, user);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  })));

  passport.use(new AzureStoreStrategy({
    secret: 'azure-cloudboost',
    check_expiration: true,
  }, ((req, azureInfo, done) => {
    try {
      User.findOne({
        'azure.subscription_id': azureInfo.subscription_id,
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'Incorrect subscription Id.',
          });
        }
        return done(null, user);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  })));

  // Serialize the user id to push into the session
  passport.serializeUser((user, callback) => {
    try {
      callback(null, {
        id: user._id,
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  });

  // Deserialize the login / user object based on a pre-serialized token
  // which is the user id / email
  passport.deserializeUser((user, callback) => {
    try {
      User.findById(user.id, callback);
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
};
