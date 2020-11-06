/* eslint-disable no-param-reassign, no-shadow
 */

const winston = require('winston');
const Q = require('q');
const _ = require('underscore');
const request = require('request');
const randomString = require('random-string');
const keys = require('../config/keys');
const Project = require('../model/project');
const User = require('../model/user');

const utils = require('../helpers/utils');

module.exports = {

  processingSignup(data) {
    const deferred = Q.defer();

    const _self = this;
    let regStep = null;
    let user = {};
    let userId = '';

    global.userService.register(data)
      .then((registeredUser) => {
        regStep = 'userCompleted';
        userId = String(registeredUser.id);
        user = registeredUser;

        return _self.createProject(data.appName, userId, null, data.planId);
      })
      .then((createdProject) => {
        regStep = 'appCompleted';

        const paymentData = {
          email: data.email,
          token: data.token,
          billingAddr: data.billingAddr,
          planId: data.planId,
          annual: data.annual,
          userId: user._id,
          newUser: true,
          couponCode: data.couponCode,
        };

        return global.paymentProcessService.createSale(user._id, createdProject.appId, paymentData);
      })
      .then(() => {
        regStep = 'saleCompleted';
        deferred.resolve(user);
      }, (err) => {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });

        return _handlingSignupErrors(data, regStep, User)
          .then(() => {
            deferred.reject(err);
          }, (error) => {
            deferred.reject(error);
          });
      });

    return deferred.promise;
  },

  createApp(name, userId, cloudProvider, _paymentData) {
    const deferred = Q.defer();

    const _self = this;
    let regStep = null;
    let PROJECT = {};
    const paymentData = _paymentData || { planId: 1 };

    _self.createProject(name, userId, cloudProvider, paymentData.planId)
      .then((createdProject) => {
        let salesData = {};
        regStep = 'appCompleted';
        PROJECT = createdProject;

        if (paymentData.token) {
          salesData = {
            token: paymentData.token,
            billingAddr: paymentData.billingAddr,
            planId: paymentData.planId,
            annual: paymentData.annual || false,
            userId,
            newUser: paymentData.newUser || false,
          };
          return global.paymentProcessService.createSale(userId, createdProject.appId, salesData);
        }
        if (paymentData.customer) {
          salesData = {
            customer: paymentData.customer,
            billingAddr: paymentData.billingAddr || {},
            planId: paymentData.planId,
            annual: paymentData.annual || false,
            userId,
            newUser: paymentData.newUser || false,
          };

          return global.paymentProcessService.createSale(userId, createdProject.appId, salesData);
        }
        return createdProject;
      })
      .then(() => {
        regStep = 'saleCompleted';
        deferred.resolve(PROJECT);
      }, (err) => {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        // if sale failed and app is created then remove the app in backgound
        if (regStep === 'appCompleted' && PROJECT.appId) {
          _self.delete(PROJECT.appId, userId);
        }
        deferred.reject(err);
      });

    return deferred.promise;
  },

  createProject(name, userId, cloudProvider, planId) {
    const _self = this;

    const deferred = Q.defer();

    try {
      let appId;
      const newAppPlanId = planId || 1;

      generateNonExistingAppId().then((newAppId) => {
        appId = newAppId;
        return _createAppFromDS(appId);
      }).then((_project) => {
        const project = JSON.parse(_project);
        // Adding default developer
        const developers = [];
        const newDeveloper = {};
        newDeveloper.userId = userId;
        newDeveloper.role = 'Admin';
        developers.push(newDeveloper);
        // End Adding default developer

        const appendJson = {
          _userId: userId,
          name,
          developers,
          planId: newAppPlanId,
          disabled: false,
          lastActive: Date.now(),
          deleted: false,
          deleteReason: 'Active',
        };

        if (cloudProvider && cloudProvider.provider) {
          appendJson.provider = cloudProvider.provider;
        }

        if (cloudProvider && cloudProvider.providerProperties) {
          appendJson.providerProperties = cloudProvider.providerProperties;
        }

        return _self.findOneAndUpdateProject(project._id, appendJson);
      }).then((newProject) => {
        deferred.resolve(newProject);
        _createPlanInAnalytics(appId, newAppPlanId);
      }, (error) => {
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
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

  projectList(userId) {
    const deferred = Q.defer();

    try {
      Project.find({
        developers: {
          $elemMatch: {
            userId,
          },
        },
        deleted: false,
      }, (err, list) => {
        if (err) {
          deferred.reject(err);
        }
        deferred.resolve(list);
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

  getProjectByUserIdAndQuery(userId, query) {
    const deferred = Q.defer();

    if (!query) {
      query = {};
    }

    query.developers = {
      $elemMatch: {
        userId,
      },
    };

    try {
      Project.findOne(query, (err, project) => {
        if (err) {
          deferred.reject(err);
        }
        deferred.resolve(project);
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

  getProjectsByUserIdAndQuery(userId, query) {
    const deferred = Q.defer();

    if (!query) {
      query = {};
    }

    query.developers = {
      $elemMatch: {
        userId,
      },
    };

    try {
      Project.find(query, (err, projects) => {
        if (err) {
          deferred.reject(err);
        }
        deferred.resolve(projects);
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

  editProject(userId, id, name) {
    const deferred = Q.defer();

    try {
      const _self = this;

      _self.getProject(id).then((project) => {
        if (!project) {
          deferred.reject('Error : Cannot update project right now.');
        } else if (project) {
          Project.findOne({
            name,
          }, (err, projectSameName) => {
            if (err) {
              deferred.reject('Error on edit project');
            }

            if (projectSameName) {
              return deferred.reject('You cannot have two apps with the same name.');
            }
            /** *Start editing** */
            if (project && checkValidUser(project, userId, 'Admin')) {
              project.name = name;

              return project.save((err, saved) => {
                if (err) {
                  deferred.reject(err);
                }
                if (!saved) {
                  deferred.reject('Cannot save the app right now.');
                } else {
                  deferred.resolve(saved._doc);
                }
              });
            }
            return deferred.reject('Unauthorized');
            /** *End Start editing** */
          });
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

  getProject(appId) {
    const deferred = Q.defer();

    try {
      Project.findOne({
        appId,
      }, (err, project) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(project);
        }
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

  projectStatus(appId) {
    const deferred = Q.defer();

    try {
      Project.findOne({
        appId,
      }, (err, project) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(project);
        }
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
  activeApp(appId) {
    const deferred = Q.defer();

    try {
      Project.findOne({
        appId,
      }, (err, project) => {
        if (err) {
          deferred.reject(err);
        }
        if (!project) {
          deferred.reject('project not found');
        } else {
          project.lastActive = Date.now();
          project.save((err, project) => {
            if (err) return deferred.reject(err);
            if (!project) return deferred.reject('Unable to save after setting lastActive');

            return deferred.resolve(project.name);
          });
        }
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
  notifyInactiveApps() {
    const deferred = Q.defer();

    try {
      const inactiveApps = [];
      Project.find({
        deleted: false,
      }, (err, projects) => {
        if (err) {
          deferred.reject(err);
        }
        if (!projects) {
          deferred.reject('error in getting projects');
        } else {
          let { length } = projects;
          if (length === 0) deferred.resolve(inactiveApps);
          projects.forEach((project) => {
            length--;
            // 60 days = 5184000000

            if (Date.now() - project._doc.lastActive > 5184000000) {
              inactiveApps.push(project._doc.appId);
              User.findById(project._doc._userId, (err, user) => {
                if (err) deferred.reject(err);
                else {
                  const mailName = 'inactiveApp';
                  const emailTo = user._doc.email;
                  const subject = `Your app ${project._doc.name} is Inactive.`;
                  const appname = project._doc.name;
                  const accountsURL = keys.accountsUrl;
                  const variableArray = [
                    {
                      domClass: 'username',
                      content: user._doc.name,
                      contentType: 'text',
                    }, {
                      domClass: 'appname',
                      content: appname,
                      contentType: 'text',
                    }, {
                      domClass: 'link',
                      content: `<a href='${accountsURL}/reactivate/${project._doc.appId}' class='btn-primary'>Activate your account</a>`,
                      contentType: 'html',
                    },
                  ];
                  global.mailService.sendMail(mailName, emailTo, subject, variableArray).then(() => {
                    if (length === 0) deferred.resolve(inactiveApps);
                  }, (err) => {
                    deferred.reject(err);
                  });
                }
              });
            } else if (length === 0) deferred.resolve(inactiveApps);
          });
        }
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
  deleteInactiveApps(deleteReason) {
    const deferred = Q.defer();

    try {
      const inactiveApps = [];
      Project.find({
        deleted: false,
      }, (err, projects) => {
        if (err) {
          deferred.reject(err);
        }
        if (!projects) {
          deferred.reject('error in getting projects');
        } else {
          let { length } = projects;
          if (length === 0) deferred.resolve([]);
          projects.forEach((project) => {
            length--;
            // 90 days = 7776000000
            if (Date.now() - project._doc.lastActive > 7776000000) {
              inactiveApps.push(project._doc.appId);
              User.findById(project._doc._userId, (err, user) => {
                if (err) deferred.reject(err);
                else {
                  const mailName = 'deleteApp';
                  const emailTo = user._doc.email;
                  const subject = `Your app ${project._doc.name} is Deleted.`;

                  const variableArray = [
                    {
                      domClass: 'username',
                      content: user._doc.name,
                      contentType: 'text',
                    }, {
                      domClass: 'appname',
                      content: project._doc.name,
                      contentType: 'text',
                    },
                  ];
                  global.mailService.sendMail(mailName, emailTo, subject, variableArray).then(() => {
                    utils._request('delete', `${keys.dataServiceUrl}/app/${project._doc.appId}`, {
                      secureKey: keys.secureKey,
                      deleteReason,
                    });
                    if (length === 0) deferred.resolve(inactiveApps);
                  },
                  (err) => {
                    deferred.reject(err);
                  });
                }
              });
            } else if (length === 0) deferred.resolve(inactiveApps);
          });
        }
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

  findOneAndUpdateProject(projectId, newJson) {
    const deffered = Q.defer();

    try {
      Project.findOneAndUpdate({
        _id: projectId,
      }, {
        $set: newJson,
      }, {
        new: true,
      }, (err, project) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!project) {
          return deffered.reject(null);
        }
        if (project && project.planId) {
          _createPlanInAnalytics(project.appId, project.planId);
        }
        return deffered.resolve(project);
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
  updateProjectBy(query, newJson) {
    const deffered = Q.defer();

    try {
      Project.findOneAndUpdate(query, {
        $set: newJson,
      }, {
        new: true,
      }, (err, project) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!project) {
          return deffered.reject(null);
        }

        return deffered.resolve(project);
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
  updatePlanByAppId(appId, planId) {
    const deffered = Q.defer();

    try {
      Project.findOneAndUpdate({
        appId,
      }, {
        $set: {
          planId,
        },
      }, {
        new: true,
      }, (err, project) => {
        if (err) {
          return deffered.reject(err);
        }
        if (!project) {
          return deffered.reject('Project not found');
        }
        return deffered.resolve(project);
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

  deleteProjectBy(query) {
    const deferred = Q.defer();

    try {
      Project.findOne(query, (err, foundProj) => {
        if (err) {
          deferred.reject(err);
        } else if (foundProj) {
          _deleteAppFromDS(foundProj.appId).then((resp) => {
            deferred.resolve(resp);
          }, (error) => {
            deferred.reject(error);
          });
        } else {
          deferred.reject('Project not found with specified user');
        }
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

  delete(appId, userId) {
    const deferred = Q.defer();

    try {
      Project.findOne({
        appId,
        developers: {
          $elemMatch: {
            userId,
            role: 'Admin',
          },
        },
      }, (err, foundProj) => {
        if (err) {
          deferred.reject(err);
        } else if (foundProj) {
          _deleteAppFromDS(appId).then((resp) => {
            // stop plan once the app is deleted
            global.notificationService.deletedAppNotification(foundProj, userId);
            global.paymentProcessService.stopRecurring(appId, userId);

            deferred.resolve(resp);
          }, (error) => {
            deferred.reject(error);
          });
        } else {
          deferred.reject('Project not found with specified user');
        }
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

  /**
     * This fucntion is used to deprovision an app from 3rd party cloud services like
     * azure, amazon, heroku, etc.
     *
     */

  deleteAppAsAdmin(appId) {
    const deferred = Q.defer();

    try {
      Project.findOne({
        appId,
      }, (err, foundProj) => {
        if (err) {
          deferred.reject(err);
        } else if (foundProj) {
          _deleteAppFromDS(appId).then((resp) => {
            deferred.resolve(resp);
          }, (error) => {
            deferred.reject(error);
          });
        } else {
          deferred.reject('Project not found.');
        }
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

  allProjectList() {
    const deferred = Q.defer();

    try {
      Project.find({}, (err, list) => {
        if (err) {
          deferred.reject(err);
        }
        deferred.resolve(list);
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
  getProjectBy(query) {
    const deferred = Q.defer();

    try {
      Project.find(query, (err, list) => {
        if (err) {
          return deferred.reject(err);
        }
        if (!list || list.length === 0) {
          return deferred.resolve(null);
        }

        return deferred.resolve(list);
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
  changeAppMasterKey(currentUserId, appId, value) {
    // if value is null. Key will automatically be generated.


    const deferred = Q.defer();

    try {
      const self = this;

      const authUser = {
        appId,
        developers: {
          $elemMatch: {
            userId: currentUserId,
            role: 'Admin',
          },
        },
      };

      self.getProjectBy(authUser).then((docs) => {
        if (!docs || docs.length === 0) {
          const invalidDeferred = Q.defer();
          invalidDeferred.reject('Invalid User or project not found.');
          return invalidDeferred.promise;
        }

        return _changeMasterKeyFromDS(appId, value);
      }).then((resp) => {
        deferred.resolve(resp);
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
  changeAppClientKey(currentUserId, appId, value) {
    // if value is null. Key will automatically be generated.


    const deferred = Q.defer();

    try {
      const self = this;

      const authUser = {
        appId,
        developers: {
          $elemMatch: {
            userId: currentUserId,
            role: 'Admin',
          },
        },
      };

      self.getProjectBy(authUser).then((docs) => {
        if (!docs || docs.length === 0) {
          const invalidDeferred = Q.defer();
          invalidDeferred.reject('Invalid User or project not found.');
          return invalidDeferred.promise;
        }
        return _changeClientKeyFromDS(appId, value);
      }).then((resp) => {
        deferred.resolve(resp);
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
  removeDeveloper(currentUserId, appId, userId) {
    const deferred = Q.defer();

    try {
      const self = this;

      Project.findOne({
        appId,
        developers: {
          $elemMatch: {
            userId,
          },
        },
      }, (err, foundProj) => {
        if (err) {
          deferred.reject(err);
        } else if (!foundProj) {
          deferred.reject('Project not found with given userId');
        } else if (currentUserId === userId || checkValidUser(foundProj, currentUserId, 'Admin')) {
          // User can delete himself or can delete others when he is a Admin
          processRemoveDeveloper(foundProj, userId, currentUserId, self).then((data) => {
            deferred.resolve(data);
          }, (error) => {
            deferred.reject(error);
          });
        } else {
          deferred.reject('Unauthorized!');
        }
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
  removeInvitee(currentUserId, appId, email) {
    const deferred = Q.defer();

    try {
      Project.findOne({
        appId,
        invited: {
          $elemMatch: {
            email,
          },
        },
      }, (err, foundProj) => {
        if (err) {
          deferred.reject(err);
        } else if (!foundProj) {
          deferred.reject('Project not found with given Email');
        } else {
          global.userService.getAccountByEmail(email).then((foundUser) => {
            if (checkValidUser(foundProj, currentUserId, 'Admin') || foundUser._id.toString() === currentUserId) {
              // User can delete himself or can delete others when he is a Admin
              processRemoveInvitee(foundProj, email).then((data) => {
                deferred.resolve(data);
              }, (error) => {
                deferred.reject(error);
              });
            } else {
              deferred.reject('Unauthorized');
            }
          }, () => {
            deferred.reject('Cannot Perform this task now');
          });
        }
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

  inviteUser(appId, email) {
    const deferred = Q.defer();

    try {
      Project.findOne({
        appId,
      }, (err, project) => {
        if (err) {
          deferred.reject(err);
        }
        if (!project) {
          deferred.reject('App not found!.');
        } else {
          global.userService.getAccountByEmail(email).then((foundUser) => {
            if (foundUser) {
              if (!checkValidUser(project, foundUser._id, null)) {
                processInviteUser(project, email, foundUser).then((data) => {
                  deferred.resolve(data);
                }, (error) => {
                  deferred.reject(error);
                });
              } else {
                deferred.reject('Already a Developer to this App!');
              }
            } else { // There is no user with this email in cloudboost
              processInviteUser(project, email, foundUser).then((data) => {
                deferred.resolve(data);
              }, (error) => {
                deferred.reject(error);
              });
            }
          }, (usererror) => {
            deferred.reject(usererror);
          });
        }
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
  addDeveloper(currentUserId, appId, email) {
    const deferred = Q.defer();

    try {
      Project.findOne({
        appId,
      }, (err, project) => {
        if (err) {
          deferred.reject(err);
        }
        if (!project) {
          deferred.reject('App not found!.');
        } else if (!checkValidUser(project, currentUserId, null)) {
          // Adding developer
          const newDeveloper = {};
          newDeveloper.userId = currentUserId;
          newDeveloper.role = 'User';

          project.developers.push(newDeveloper);
          // End Adding developer

          let notificationId = null;
          if (project.invited && project.invited.length > 0) {
            for (let i = 0; i < project.invited.length; ++i) {
              if (project.invited[i].email === email) {
                notificationId = project.invited[i].notificationId; // eslint-disable-line
                project.invited.splice(i, 1);
              }
            }
          }

          project.save((err, savedProject) => {
            if (err) {
              deferred.reject(err);
            }
            if (!savedProject) {
              deferred.reject('Cannot save the app right now.');
            } else {
              deferred.resolve(savedProject);
              if (notificationId) {
                global.notificationService.removeNotificationById(notificationId);
              }
            }
          });
        } else {
          deferred.resolve('Already added!');
        }
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

  changeDeveloperRole(currentUserId, appId, requestedUserId, newRole) {
    const deferred = Q.defer();

    try {
      Project.findOne({
        appId,
      }, (err, project) => {
        if (err) {
          return deferred.reject(err);
        }

        if (!project) {
          return deferred.reject('App not found!.');
        }

        if (checkValidUser(project, currentUserId, 'Admin')) {
          const tempDeveloperArray = [].concat(project.developers || []);
          for (let i = 0; i < tempDeveloperArray.length; ++i) {
            if (tempDeveloperArray[i].userId === requestedUserId) {
              tempDeveloperArray[i].role = newRole;
              break;
            }
          }

          // Check atleast one admin will be there
          const atleastOneAdmin = _.find(tempDeveloperArray, eachObj => eachObj.role === 'Admin');

          if (atleastOneAdmin) {
            project.developers = tempDeveloperArray;
            project.markModified('developers');

            return project.save((err, savedProject) => {
              if (err) {
                deferred.reject(err);
              }
              if (!savedProject) {
                deferred.reject('Cannot save the project for change developer role.');
              } else {
                deferred.resolve(savedProject);
              }
            });
          }
          return deferred.reject('Atleast one admin should be there for an app.');
        }
        return deferred.resolve('Only Admin can change role!');
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

function generateNonExistingAppId() {
  const deferred = Q.defer();

  try {
    let appId = randomString({
      length: 12,
      numeric: false,
      letters: true,
      special: false,
    });
    appId = appId.toLowerCase();

    global.projectService.getProject(appId).then((existedProject) => {
      if (!existedProject) {
        return deferred.resolve(appId);
      }

      return generateNonExistingAppId();
    }).then(deferred.resolve, deferred.reject);
  } catch (err) {
    winston.error({
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }

  return deferred.promise;
}

function processRemoveDeveloper(foundProj, userId, currentUserId, self) {
  const deferred = Q.defer();

  try {
    const tempArray = foundProj.developers;

    for (let i = 0; i < foundProj.developers.length; ++i) {
      if (foundProj.developers[i].userId === userId) {
        tempArray.splice(i, 1);
      }
    }

    // Find Atleast one admin
    const atleastOneAdmin = _.find(foundProj.developers, eachObj => eachObj.role === 'Admin');

    if (tempArray.length > 0 && atleastOneAdmin) {
      foundProj.developers = tempArray;
      foundProj.save((err, project) => {
        if (err) {
          deferred.reject(err);
        }
        if (!project) {
          deferred.reject('Cannot save the app right now.');
        } else {
          deferred.resolve(project);
        }
      });
    } else {
      self.delete(foundProj.appId, currentUserId).then((resp) => {
        deferred.resolve(resp);
      }, (error) => {
        deferred.reject(error);
      });
    }
  } catch (err) {
    winston.error({
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }

  return deferred.promise;
}

function processRemoveInvitee(foundProj, email) {
  const deferred = Q.defer();

  try {
    const tempArray = foundProj.invited;
    let notificationId = null;

    if (tempArray && tempArray.length > 0) {
      for (let i = 0; i < tempArray.length; ++i) {
        if (tempArray[i].email === email) {
          notificationId = tempArray[i].notificationId; //eslint-disable-line
          tempArray.splice(i, 1);
        }
      }
    }

    foundProj.invited = tempArray;
    foundProj.save((err, project) => {
      if (err) {
        deferred.reject(err);
      }
      if (!project) {
        deferred.reject('Cannot save the app right now.');
      } else {
        deferred.resolve(project);
        if (notificationId) {
          global.notificationService.removeNotificationById(notificationId);
        }
      }
    });
  } catch (err) {
    winston.error({
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }

  return deferred.promise;
}

function processInviteUser(project, email, foundUser) {
  const deferred = Q.defer();

  try {
    const alreadyInvited = _.first(_.where(project.invited, {
      email,
    }));

    // Invitation
    if (!alreadyInvited) {
      const notificationType = 'confirm';
      const type = 'twoaction';
      const text = `You have been invited to collaborate on <span style='font-weight:bold;'>${project.name}</span>.`;
      const meta = {
        notificationType: 'addDeveloper',
        cancelButton: {
          text: 'Decline',
          method: 'post',
          external: false,
          url: `/app/${project.appId}/removeinvitee`,
          payload: {
            email,
          },
        },
        acceptButton: {
          text: 'Accept',
          method: 'get',
          external: false,
          url: `/app/${project.appId}/adddeveloper/${email}`,
        },
      };
      let userIdOREmail = null;
      if (foundUser && foundUser._id) {
        userIdOREmail = foundUser._id;
      } else {
        userIdOREmail = email;
      }

      global.notificationService.createNotification(project.appId, userIdOREmail, notificationType, type, text, meta)
        .then((notificationId) => {
          const inviteeObj = {
            email,
            notificationId: notificationId._id,
          };

          project.invited.push(inviteeObj);

          project.save((err, savedProject) => {
            if (err) {
              deferred.reject(err);
            }
            if (!savedProject) {
              deferred.reject('Cannot save the app right now.');
            } else {
              deferred.resolve('successfully Invited!');
              // global.mandrillService.inviteDeveloper(email,savedProject.name);

              const mailName = 'invitedeveloper';
              const emailTo = email;
              const subject = "You're invited to collaborate";

              const variableArray = [{
                domClass: 'projectname',
                content: savedProject.name,
                contentType: 'text',
              },
              {
                domClass: 'link',
                content: `<a href='${keys.accountsUrl}/signup?invited=true' class='btn-primary'>Go to Dashboard</a>`,
                contentType: 'html',
              },
              ];

              global.mailService.sendMail(mailName, emailTo, subject, variableArray);
            }
          });
        }, (error) => {
          deferred.reject(error);
        });
    } else {
      deferred.reject('Already Invited!');
    }
  } catch (err) {
    winston.error({
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }

  return deferred.promise;
}

function checkValidUser(app, userId, role) {
  try {
    if (app.developers && app.developers.length > 0) {
      return _.find(app.developers, (eachObj) => {
        if (eachObj.userId === userId) {
          if (role && eachObj.role === role) {
            return true;
          }
          if (role && eachObj.role !== role) {
            return false;
          }
          if (!role) {
            return true;
          }
        }
        return false;
      });
    }
    return false;
  } catch (err) {
    winston.error({
      error: String(err),
      stack: new Error().stack,
    });
    return false;
  }
}

/** *********************Pinging Data Services******************************** */

function _createAppFromDS(appId) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = keys.secureKey;
    postData = JSON.stringify(postData);

    const url = `${keys.dataServiceUrl}/app/${appId}`;
    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || body === 'Error' || response.statusCode === 401) {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        deferred.reject(err);
      } else {
        try {
          JSON.parse(body);
          deferred.resolve(body);
        } catch (e) {
          deferred.reject(e);
        }
      }
    });
  } catch (err) {
    winston.error({
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }

  return deferred.promise;
}

function _deleteAppFromDS(appId) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = keys.secureKey;
    postData = JSON.stringify(postData);

    request.del({
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      url: `${keys.dataServiceUrl}/app/${appId}`,
      body: postData,
    }, (error, response) => {
      if (response) {
        try {
          const respData = JSON.parse(response.body);
          if (respData.status === 'Success') {
            deferred.resolve('Successfully deleted');
          } else {
            deferred.reject('Unable to delete!');
          }
        } catch (e) {
          deferred.reject(e);
        }
      } else {
        deferred.reject('Unable to delete!');
      }
    });
  } catch (err) {
    winston.error({
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }

  return deferred.promise;
}

function _changeClientKeyFromDS(appId, value) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = keys.secureKey;
    postData.value = value;
    postData = JSON.stringify(postData);

    const url = `${keys.dataServiceUrl}/admin/${appId}/clientkey`;
    request.put(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || body === 'Error') {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.resolve(body);
        }
      }
    });
  } catch (err) {
    winston.error({
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }

  return deferred.promise;
}

function _changeMasterKeyFromDS(appId, value) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = keys.secureKey;
    postData.value = value;
    postData = JSON.stringify(postData);

    const url = `${keys.dataServiceUrl}/admin/${appId}/masterkey`;
    request.put(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || body === 'Error') {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.resolve(body);
        }
      }
    });
  } catch (err) {
    winston.error({
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }

  return deferred.promise;
}

function _createPlanInAnalytics(appId, planId) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = keys.secureKey;
    postData.planId = planId;
    postData = JSON.stringify(postData);

    const url = `${keys.analyticsServiceUrl}/plan/${appId}`;

    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,

    }, (err, response, body) => {
      if (err || response.statusCode === 500 || response.statusCode === 400 || response.statusCode === 401 || body === 'Error') {
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject(e);
        }
      }
    });
  } catch (err) {
    winston.error({
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }
  return deferred.promise;
}

/* ======================================= ****** ===================================== */
function _handlingSignupErrors(data, regStep, User) {
  const deferred = Q.defer();

  if (regStep === 'userCompleted') {
    _removeCreatedUser(data, User).then(() => {
      deferred.resolve('deletedUser');
    }, (err) => {
      deferred.reject(err);
    });
  } else if (regStep === 'appCompleted') {
    _removeCreatedProject(data, User).then(() => {
      deferred.resolve('deletedProject');
    }, (err) => {
      deferred.reject(err);
    });
  } else if (regStep === 'saleCompleted') {
    _stopAddedRecurringInAnalytics(data, User).then(() => {
      deferred.resolve('deletedSale');
    }, (err) => {
      deferred.reject(err);
    });
  } else {
    deferred.resolve();
  }

  return deferred.promise;
}

function _removeCreatedUser(data, User) {
  const deferred = Q.defer();

  global.userService.getAccountByEmail(data.email).then((user) => {
    const userId = user._id;

    return User.remove({
      _id: userId,
    });
  }).then(() => {
    deferred.resolve();
  }, (err) => {
    deferred.reject(err);
  });

  return deferred.promise;
}

function _removeCreatedProject(data, User) {
  const deferred = Q.defer();

  global.userService.getAccountByEmail(data.email)
    .then(user => global.projectService.deleteProjectBy({
      _userId: user._id,
      name: data.appName,
    }))
    .then(() => _removeCreatedUser(data, User))
    .then(() => {
      deferred.resolve('deletedUser');
    }, (err) => {
      deferred.reject(err);
    });

  return deferred.promise;
}

function _stopAddedRecurringInAnalytics(data, User) {
  const deferred = Q.defer();


  global.userService.getAccountByEmail(data.email)
    .then(user => global.projectService.getProjectByUserIdAndQuery(user.user._id, {
      name: data.appName,
    }))
    .then(project => global.paymentProcessService
      .stopRecurring(project.appId, project._userId))
    .then(() => _removeCreatedProject(data, User))
    .then(() => _removeCreatedUser(data, User))
    .then(() => {
      deferred.resolve();
    }, (err) => {
      deferred.reject(err);
    });

  return deferred.promise;
}
