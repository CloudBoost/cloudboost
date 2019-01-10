/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
/* eslint-disable */

const winston = require('winston');
const crypto = require('crypto');
const q = require('q');
const _ = require('underscore');
const Collections = require('../database-connect/collections.js');

const config = require('../config/config');
const mongoService = require('../databases/mongo');
const customService = require('../services/cloudObjects');
const appService = require('../services/app');
const mailService = require('../services/mail');

const cipher_alg = 'aes-256-ctr';
const userService = {

  login(appId, username, password, accessList, isMasterKey, encryption_key) {
    const deferred = q.defer();

    try {
      customService.findOne(appId, Collections.User, {
        username,
      }, null, null, null, accessList, isMasterKey).then((user) => {
        if (!user) {
          deferred.reject('Invalid Username');
          return;
        }

        let encryptedPassword;
        let isAuthenticatedUser = false;
        if (encryption_key && encryption_key.iv && encryption_key.key) {
          encryptedPassword = encryptText(cipher_alg, encryption_key.key, encryption_key.iv, password);
        } else {
          encryptedPassword = crypto.pbkdf2Sync(password, config.secureKey, 10000, 64, 'sha1').toString('base64');
        }
        if (encryptedPassword === user.password) {
          isAuthenticatedUser = true;
        }

        appService.getAllSettings(appId).then((appSettings) => {
          const auth = _.first(_.where(appSettings, {
            category: 'auth',
          }));
          let signupEmailSettingsFound = false;
          let allowOnlyVerifiedLogins = false;

          if (auth && auth.settings && auth.settings.signupEmail) {
            signupEmailSettingsFound = true;
            if (auth.settings.signupEmail.allowOnlyVerifiedLogins) {
              allowOnlyVerifiedLogins = true;
            }
          }

          if (isAuthenticatedUser) {
            if (signupEmailSettingsFound && allowOnlyVerifiedLogins) {
              if (user.verified) {
                deferred.resolve(user);
              } else {
                deferred.reject('User is not verified');
              }
            } else {
              deferred.resolve(user);
            }
          } else {
            deferred.reject('User is not authenticated');
          }
        }, (error) => {
          deferred.reject(error);
        });
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  changePassword(appId, userId, oldPassword, newPassword, accessList, isMasterKey, encryption_key) {
    const deferred = q.defer();

    try {
      customService.findOne(appId, Collections.User, {
        _id: userId,
      }, null, null, null, accessList, isMasterKey).then((user) => {
        if (!user) {
          deferred.reject('Invalid User');
          return;
        }
        let encryptedPassword;
        if (encryption_key && encryption_key.iv && encryption_key.key) {
          encryptedPassword = encryptText(cipher_alg, encryption_key.key, encryption_key.iv, oldPassword);
        } else {
          encryptedPassword = crypto.pbkdf2Sync(oldPassword, config.secureKey, 10000, 64, 'sha1').toString('base64');
        }
        if (encryptedPassword === user.password) { // authenticate user.
          if (encryption_key && encryption_key.iv && encryption_key.key) {
            user.password = encryptText(cipher_alg, encryption_key.key, encryption_key.iv, newPassword);
          } else {
            user.password = crypto.pbkdf2Sync(newPassword, config.secureKey, 10000, 64, 'sha1').toString('base64');
          }
          mongoService.document.save(appId, [{
            document: user,
          }]).then(() => {
            deferred.resolve(user); // returns no. of items matched
          }, (error) => {
            deferred.reject(error);
          });
        } else {
          deferred.reject('Invalid Old Password');
        }
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  /* Desc   : Reset Password
	  Params : appId, email, accessList, masterKey
	  Returns: Promise
			   Resolve->Mail Sent successfully
			   Reject->Error on find User or No user or sendResetPassword()
	*/
  resetPassword(appId, email, accessList, isMasterKey) {
    const deferred = q.defer();

    try {
      customService.findOne(appId, Collections.User, {
        email,
      }, null, null, null, accessList, isMasterKey).then((user) => {
        if (!user) {
          return deferred.reject(`User with email ${email} not found.`);
        }


        // Send an email to reset user password here.
        const passwordResetKey = crypto.createHmac('sha256', config.secureKey)
          .update(user.password)
          .digest('hex');

        mailService.sendResetPasswordMail(appId, email, user, passwordResetKey).then((resp) => {
          deferred.resolve(resp);
        }, (error) => {
          deferred.reject(error);
        });
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  resetUserPassword(appId, username, newPassword, resetKey, accessList, isMasterKey, encryption_key) {
    const deferred = q.defer();

    try {
      customService.findOne(appId, Collections.User, {
        username,
      }, null, null, null, accessList, true).then((user) => {
        if (!user) {
          deferred.reject(`User with username ${username} not found.`);
          return;
        }
        // Send an email to reset user password here.
        const passwordResetKey = crypto.createHmac('sha256', config.secureKey)
          .update(user.password)
          .digest('hex');

        if (passwordResetKey === resetKey) {
          if (encryption_key && encryption_key.iv && encryption_key.key) {
            user.password = encryptText(cipher_alg, encryption_key.key, encryption_key.iv, newPassword);
          } else {
            user.password = crypto.pbkdf2Sync(newPassword, config.secureKey, 10000, 64, 'sha1').toString('base64');
          }
          mongoService.document.save(appId, [{
            document: user,
          }])
            .then(() => {
              deferred.resolve(); // returns no. of items matched
            }, (error) => {
              deferred.reject(error);
            });
        } else {
          deferred.reject('Reset Key is invalid.');
        }
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

  signup(appId, document, accessList, isMasterKey, encryption_key) {
    const deferred = q.defer();
    try {
      customService.findOne(appId, Collections.User, {
        username: document.username,
      }, null, null, null, accessList, isMasterKey).then((user) => {
        if (user) {
          deferred.reject('Username already exists');
          return;
        }

        customService.save(appId, Collections.User, document, accessList, isMasterKey, null, encryption_key).then((user) => {
          // Send an email to activate account.
          const cipher = crypto.createCipher('aes192', config.secureKey);
          let activateKey = cipher.update(user._id, 'utf8', 'hex');
          activateKey += cipher.final('hex');

          const promises = [];
          promises.push(appService.getAllSettings(appId));
          promises.push(mailService.sendSignupMail(appId, user, activateKey));

          q.all(promises).then((list) => {
            const auth = _.first(_.where(list[0], {
              category: 'auth',
            }));
            let signupEmailSettingsFound = false;
            let allowOnlyVerifiedLogins = false;

            if (auth && auth.settings && auth.settings.signupEmail) {
              signupEmailSettingsFound = true;
              if (auth.settings.signupEmail.allowOnlyVerifiedLogins) {
                allowOnlyVerifiedLogins = true;
              }
            }

            if (signupEmailSettingsFound && allowOnlyVerifiedLogins) {
              if (user.verified) {
                deferred.resolve(user);
              } else {
                deferred.resolve(null);
              }
            } else {
              deferred.resolve(user);
            }
          }, (error) => {
            deferred.reject(error);
          });
        }, (error) => {
          deferred.reject(error);
        });
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

  verifyActivateCode(appId, activateCode, accessList) {
    const deferred = q.defer();

    try {
      const decipher = crypto.createDecipher('aes192', config.secureKey);
      let userId = decipher.update(activateCode, 'hex', 'utf8');
      userId += decipher.final('utf8');

      const isMasterKey = true;
      const collectionName = 'User';
      const query = {
        _id: userId,
      };
      const select = null;
      const sort = null;
      const skip = null;


      customService.findOne(appId, collectionName, query, select, sort, skip, accessList, isMasterKey)
        .then((user) => {
          if (user) {
            user.verified = true;
            user._modifiedColumns = ['verified'];
            user._isModified = true;

            customService.save(appId, collectionName, user, accessList, isMasterKey).then((user) => {
              deferred.resolve(user);
            }, (error) => {
              deferred.reject(error);
            });
          } else {
            deferred.resolve('Not a valid activation code');
          }
        }, (error) => {
          deferred.reject(error);
        });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

  addToRole(appId, userId, roleId, accessList, isMasterKey) {
    const deferred = q.defer();

    try {
      // Get the role
      customService.find(appId, Collections.Role, {
        _id: roleId,
      }, null, null, 1, 0, accessList, isMasterKey).then((role) => {
        if (role && role.length > 0) {
          role = role[0];
        }


        if (!role) {
          deferred.reject('Role does not exists');
          return;
        }
        // get the user.
        customService.find(appId, Collections.User, {
          _id: userId,
        }, null, null, 1, 0, accessList, isMasterKey).then((user) => {
          if (user.length && user.length > 0) {
            user = user[0];
          }

          if (!user) {
            deferred.reject('User not found.');
            return;
          }
          user._id = user._id.toString();

          // check if user is already in role.
          if (!user.roles) {
            user.roles = [];
          }

          const userRoleIds = [];

          if (user.roles && user.roles.length > 0) {
            for (let i = 0; i < user.roles.length; ++i) {
              userRoleIds.push(user.roles[i]._id);
            }
          }

          if (userRoleIds.indexOf(roleId) === -1) { // does not belong to this role.
            // add role to the user and save it in DB
            role._id = role._id.toString();
            user.roles.push(role);

            user._isModified = true;
            if (!user._modifiedColumns) {
              user._modifiedColumns = [];
            }
            user._modifiedColumns.push('roles');

            customService.save(appId, Collections.User, user, accessList).then((user) => {
              deferred.resolve(user);
            }, (error) => {
              deferred.reject(error);
            });
          } else {
            deferred.resolve(user);
          }
        }, (error) => {
          deferred.reject(error);
        });
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

  removeFromRole(appId, userId, roleId, accessList, isMasterKey) {
    const deferred = q.defer();

    try {
      // Get role
      customService.find(appId, Collections.Role, {
        _id: roleId,
      }, null, null, 1, 0, accessList, isMasterKey).then((role) => {
        if (!role) {
          deferred.reject('Role does not exists');
          return;
        }
        // get the user.
        customService.find(appId, Collections.User, {
          _id: userId,
        }, null, null, 1, 0, accessList, isMasterKey).then((user) => {
          if (user && user.length > 0) {
            user = user[0];
          }

          if (!user) {
            deferred.reject('User not found.');
            return;
          }
          // check if user is already in role.
          if (!user.roles) {
            user.roles = [];
          }
          const userRoleIds = [];

          if (user.roles && user.roles.length > 0) {
            for (let i = 0; i < user.roles.length; ++i) {
              userRoleIds.push(user.roles[i]._id);
            }
          }

          if (userRoleIds.indexOf(roleId) > -1) { // the role is present with the user
            user.roles.splice(userRoleIds.indexOf(roleId), 1); // remove role from the user.

            user._isModified = true;
            if (!user._modifiedColumns) {
              user._modifiedColumns = [];
            }
            user._modifiedColumns.push('roles');

            customService.save(appId, Collections.User, user, accessList).then((user) => {
              deferred.resolve(user);
            }, (error) => {
              deferred.reject(error);
            });
          } else {
            deferred.resolve(user);
          }
        }, (error) => {
          deferred.reject(error);
        });
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },
};

module.exports = userService;

// to encrypt data
function encryptText(cipher_alg, key, iv, text) {
  const cipher = crypto.createCipheriv(cipher_alg, key.toString('hex').slice(0, 32), iv.toString('hex').slice(0, 16));
  let result = cipher.update(text, 'utf8', 'hex');
  result += cipher.final('hex');
  return result;
}

// to decrypt data
// eslint-disable-next-line
function decryptText(cipher_alg, key, iv, text) {
  const decipher = crypto.createDecipheriv(cipher_alg, key.toString('hex').slice(0, 32), iv.toString('hex').slice(0, 16));
  let result = decipher.update(text, 'hex');
  result += decipher.final();
  return result;
}
