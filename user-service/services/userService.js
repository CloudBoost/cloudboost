/* eslint-disable
 */

const winston = require('winston');
const crypto = require('crypto');
const Q = require('q');
const util = require('./utilService');
const User = require('../model/user');

module.exports = {
  makeSalt() {
    try {
      return crypto.randomBytes(16).toString('base64');
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  },

  encryptPassword(password, salt) {
    try {
      if (!password || !salt) return '';
      salt = new Buffer(salt, 'base64');
      return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha1').toString('base64');
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  },

  validatePassword(password, encryptedPass, salt) {
    try {
      if (!password || !salt) return false;
      salt = new Buffer(salt, 'base64');
      return encryptedPass === crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha1').toString('base64');
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  },

  getAccountByEmail(email) {
    const deffered = Q.defer();

    try {
      if (util.isEmailValid(email)) {
        User.findOne({
          email,
        }, (err, user) => {
          if (err) {
            return deffered.reject(err);
          }
          if (!user) {
            return deffered.resolve(null);
          }

          return deffered.resolve(user);
        });
      } else {
        return deffered.reject('Emailid invalid..');
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }
    return deffered.promise;
  },

  activate(code) {
    const deffered = Q.defer();

    try {
      User.find({
        emailVerificationCode: code,
      }, (err, user) => {
        if (err) {
          return deffered.reject(err);
        }
        if (user.length === 0) {
          return deffered.reject('Activation Code Invalid.');
        }

        for (let i = 0; i < user.length; i++) {
          user[i].emailVerified = true;

          user[i].save((err, user) => {
            if (err) {
              deffered.reject(err);
            } else {
              deffered.resolve(user);
            }
          });
        }
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },

  requestResetPassword(email) {
    const deffered = Q.defer();

    try {
      if (util.isEmailValid(email)) {
        User.findOne({
          email,
        }, (err, user) => {
          if (err) {
            return deffered.reject(err);
          }
          if (!user) {
            return deffered.reject('Email doesnot belong to any user.');
          }

          user.emailVerificationCode = util.generateRandomString();

          user.save((err, user) => {
            if (err) {
              deffered.reject(err);
            } else {
              deffered.resolve(user);
            }
          });
        });
      } else {
        deffered.reject('Email invalid..');
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },

  resetPassword(code, password) {
    const deffered = Q.defer();

    try {
      const self = this;

      User.findOne({
        emailVerificationCode: code,
      }, (err, user) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!user) {
          return deffered.reject('Email does not belong to any user.');
        }

        if (password) {
          user.salt = self.makeSalt();
          user.password = self.encryptPassword(password, user.salt);
        }

        user.save((err, user) => {
          if (err) {
            deffered.reject(err);
          } else {
            deffered.resolve(user);
          }
        });
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },

  getAccountById(id) {
    const deffered = Q.defer();

    try {
      User.findById(id, (err, user) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!user) {
          return deffered.reject('Incorrect ID');
        }

        return deffered.resolve(user._doc);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },

  register(data) {
    const deffered = Q.defer();
    try {
      if (util.isEmailValid(data.email)) {
        const self = this;

        self.getAccountByEmail(data.email).then((user) => {
          if (user) {
            return deffered.reject('A user with this email already exists.');
          }

          if (data.isAdmin) {
            self.isNewServer().then((res) => {
              // create a new user
              self.createUser(data).then((user) => {
                deffered.resolve(user);

                // Create Beacons For New Users
                if (user) {
                  global.beaconService.createBeacon(user._doc._id.toString());
                }
              }, (error) => {
                deffered.reject(error);
              });
            }, (err) => {
              deffered.reject(err);
            });
          } else {
            // create a new user
            self.createUser(data).then((user) => {
              deffered.resolve(user);

              // Create Beacons For New Users
              if (user) {
                global.beaconService.createBeacon(user._doc._id.toString());
              }
            }, (error) => {
              deffered.reject(error);
            });
          }
        }, (error) => {
          deffered.reject(error);
        });
      } else {
        deffered.reject('Emailid invalid..');
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },

  createUser(data) {
    const deffered = Q.defer();

    try {
      const self = this;

      const user = new User();
      user.email = data.email;
      user.name = data.name || null;
      user.isAdmin = data.isAdmin;
      user.isActive = true;
      user.provider = data.provider || 'local';
      user.companyName = data.companyName || null;
      user.companySize = data.companySize || null;
      user.phoneNumber = data.phoneNumber || null;
      user.reference = data.reference || null;
      user.jobRole = data.jobRole || null;
      user.oauth_code = null;

      if (data.emailVerified) {
        user.emailVerified = data.emailVerified;
      } else if (data.isAdmin) {
        user.emailVerified = true;
      } else {
        user.emailVerified = false;
      }

      if (data.provider !== 'azure') {
        user.emailVerificationCode = util.generateRandomString();
      }

      if (data.provider !== 'heroku') {
        user.emailVerificationCode = util.generateRandomString();
      }

      if (data.provider === 'azure' && data.azure) {
        user.azure = data.azure;
      }

      user.createdAt = new Date();

      if (data.password) {
        user.salt = self.makeSalt();
        user.password = self.encryptPassword(data.password, user.salt);
      }

      user.save((err) => {
        if (err) {
          deffered.reject(err);
        } else {
          if (data.isAdmin) {
            global.cbServerService.upsertSettings(user._id, null, false);
            global.notificationService.linkUserId(user.email, user._id);
          }
          deffered.resolve(user);
        }
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },
  updateUserProfilePic(userId, fileId) {
    const deffered = Q.defer();

    try {
      User.findOneAndUpdate({
        _id: userId,
      }, {
        $set: {
          fileId,
        },
      }, {
        new: true,
      }, (err, user) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!user) {
          return deffered.reject(null);
        }
        return deffered.resolve(user);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },
  updateUserActive(currentUserId, userId, isActive) {
    const deffered = Q.defer();

    try {
      User.findOne({
        _id: currentUserId,
      }, (err, user) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!user) {
          return deffered.reject('Unauthorized');
        }
        if (user && user.isAdmin) {
          User.findOneAndUpdate({
            _id: userId,
          }, {
            $set: {
              isActive,
            },
          }, {
            new: true,
          }, (err, user) => {
            if (err) {
              return deffered.reject(err);
            }
            if (!user) {
              return deffered.reject(null);
            }
            return deffered.resolve(user);
          });
        } else {
          return deffered.reject("You can't perform this action!");
        }
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },
  updateUserLastLogin(userId) {
    const deffered = Q.defer();
    const newDate = new Date();

    User.update({
      _id: userId,
    }, {
      $set: {
        lastLogin: newDate,
      },
    }, (err, mod) => {
      if (err) {
        return deffered.reject(err);
      }
      if (!mod) {
        return deffered.reject(null);
      }
      return deffered.resolve(userId);
    });

    return deffered.promise;
  },
  updateUserRole(currentUserId, userId, isAdmin) {
    const deffered = Q.defer();

    try {
      User.findOne({
        _id: currentUserId,
      }, (err, user) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!user) {
          return deffered.reject('Unauthorized');
        }
        if (user && user.isAdmin) {
          User.findOneAndUpdate({
            _id: userId,
          }, {
            $set: {
              isAdmin,
            },
          }, {
            new: true,
          }, (err, user) => {
            if (err) {
              return deffered.reject(err);
            }
            if (!user) {
              return deffered.reject(null);
            }
            return deffered.resolve(user);
          });
        } else {
          return deffered.reject("You can't perform this action!");
        }
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },
  updateOauthAcess(userId, code) {
    const deffered = Q.defer();

    User.update({
      _id: userId,
    }, {
      $set: {
        oauth_code: code,
      },
    }, (err, mod) => {
      if (err) {
        return deffered.reject(err);
      }
      if (!mod) {
        return deffered.reject(null);
      }

      return deffered.resolve(userId);
    });

    return deffered.promise;
  },
  updateUserProfile(userId, name, oldPassword, newPassword) {
    const self = this;

    const deffered = Q.defer();

    try {
      self.getAccountById(userId).then((user) => {
        const updated_user = {};

        if (oldPassword && newPassword) {
          if (!self.validatePassword(oldPassword, user.password, user.salt)) {
            return deffered.reject('Password is Incorrect');
          }
          updated_user.salt = self.makeSalt();
          updated_user.password = self.encryptPassword(newPassword, updated_user.salt);
        }
        if (name) {
          updated_user.name = name;
        }

        User.findOneAndUpdate({
          _id: userId,
        }, {
          $set: updated_user,
        }, {
          new: true,
        }, (err, user) => {
          if (err) {
            return deffered.reject(err);
          }
          if (!user) {
            return deffered.reject(null);
          }
          return deffered.resolve(user);
        });
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },

  getUserList() {
    const deffered = Q.defer();

    try {
      User.find({}, (err, users) => {
        if (err) {
          return deffered.reject(err);
        }
        if (users.length === 0) {
          return deffered.reject(null);
        }

        return deffered.resolve(users);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },

  getUserListByIds(IdsArray) {
    const deffered = Q.defer();

    try {
      User.find({
        _id: {
          $in: IdsArray,
        },
      }, (err, usersList) => {
        if (err) {
          return deffered.reject(err);
        }
        if (usersList.length === 0) {
          return deffered.reject(null);
        }

        return deffered.resolve(usersList);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },

  isNewServer() {
    const deffered = Q.defer();

    try {
      User.find({}, (err, users) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!users || users.length === 0) {
          return deffered.resolve(true);
        }

        return deffered.resolve(false);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },
  getUserBySkipLimit(skip, limit, skipUserIds) {
    const deffered = Q.defer();

    try {
      skip = parseInt(skip, 10);
      limit = parseInt(limit, 10);

      User.find({
        _id: {
          $nin: skipUserIds,
        },
      }).skip(skip).limit(limit).exec((err, users) => {
        if (err) {
          return deffered.reject(err);
        }
        if (users.length === 0) {
          return deffered.resolve(null);
        }

        return deffered.resolve(users);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },
  delete(currentUserId, userId) {
    const deffered = Q.defer();

    try {
      User.findOne({
        _id: currentUserId,
      }, (err, user) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!user) {
          return deffered.reject('Unauthorized');
        }
        if (user && user.isAdmin) {
          User.remove({
            _id: userId,
          }, (err) => {
            if (err) {
              return deffered.reject(err);
            }
            return deffered.resolve('Success');
          });
        } else {
          return deffered.reject("You can't perform this action!");
        }
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },

  getUserByEmailByAdmin(adminId, email) {
    const deffered = Q.defer();

    try {
      User.findOne({
        _id: adminId,
      }, (err, user) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!user) {
          return deffered.reject('Unauthorized');
        }
        if (user && user.isAdmin) {
          User.findOne({
            email,
          }, (err, user) => {
            if (err) {
              return deffered.reject(err);
            }
            if (!user) {
              return deffered.reject('Incorrect Email');
            }

            return deffered.resolve(user);
          });
        } else {
          return deffered.reject("You can't perform this action!");
        }
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }
    return deffered.promise;
  },
  getUserListByKeyword(email) {
    const deffered = Q.defer();

    try {
      User.find({
        email,
      }, (err, userList) => {
        if (err) {
          return deffered.reject(err);
        }
        if (userList.length === 0) {
          return deffered.resolve(null);
        }
        return deffered.resolve(userList);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },

  getUserBy(query) {
    const deffered = Q.defer();

    try {
      User.findOne(query, (err, user) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!user) {
          return deffered.resolve(null);
        }

        return deffered.resolve(user);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },

  getAzureUserByTenantId(query, newJson) {
    const deffered = Q.defer();

    try {
      User.findOneAndUpdate(query, {
        $set: newJson,
      }, {
        new: true,
      }, (err, data) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!data) {
          return deffered.reject(null);
        }

        return deffered.resolve(data);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }

    return deffered.promise;
  },

  // -------------------------------------------Azure------------------------------------------------------

  getAccountByTenantId(tenantId) {
    const deffered = Q.defer();

    try {
      User.findOne({
        'azure.tenantId': tenantId,
      }, (err, user) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!user) {
          return deffered.resolve(null);
        }

        return deffered.resolve(user);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }
    return deffered.promise;
  },

  updateAccountByQuery(query, userData) {
    const deffered = Q.defer();

    try {
      User.findOneAndUpdate(query, {
        $set: userData,
      }, {
        new: true,
      }, (err, data) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!data) {
          return deffered.reject(null);
        }

        return deffered.resolve(data);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }
    return deffered.promise;
  },

  getAccountBySubscription(query) {
    const deffered = Q.defer();

    try {
      User.findOne(query, (err, user) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!user) {
          return deffered.resolve(null);
        }

        return deffered.resolve(user);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deffered.reject(err);
    }
    return deffered.promise;
  },


};
