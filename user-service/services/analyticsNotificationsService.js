

const winston = require('winston');
const Q = require('q');
const _ = require('underscore');
const pricingPlans = require('../config/pricingPlans.js')();

module.exports = {

  updateUserOver80(appId) {
    const deferred = Q.defer();

    try {
      let project = null;

      global.projectService.getProject(appId).then((projectObj) => {
        project = projectObj;

        const adminUser = _.first(_.where(project.developers, { role: 'Admin' }));
        return global.userService.getAccountById(adminUser.userId);
      }).then((userObj) => {
        const presentPlan = _.first(_.where(pricingPlans.plans, { id: project.planId }));

        const notificationType = 'payment';
        const type = 'upgrade-app';
        // eslint-disable-next-line
        const text = `Your app <span style='font-weight:bold;'>${project.name}</span> has reached 80% of its current plan. Upgrade to next plan now.`;
        const meta = {
          notificationType: 'payment',
          acceptButton: {
            text: 'Upgrade',
            appId: project.appId,
            planId: project.planId,
          },
        };
        global.notificationService.createNotification(appId, userObj._id, notificationType, type, text, meta);


        try {
          if (userObj.name && userObj.email && project.name && presentPlan && presentPlan.planName) {
            const mailName = 'over80limit';
            const emailTo = userObj.email;
            const subject = `Your app ${project.name} reached 80% of its API calls`;

            const variableArray = [
              {
                domClass: 'username',
                content: userObj.name,
                contentType: 'text',
              }, {
                domClass: 'appname',
                content: project.name,
                contentType: 'text',
              }, {
                domClass: 'planname',
                content: presentPlan.planName,
                contentType: 'text',
              },
            ];

            global.mailService.sendMail(mailName, emailTo, subject, variableArray);
          }
        } catch (e) {
          winston.error(e);
        }

        deferred.resolve({ message: 'success' });
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
  updateUserOver100(appId) {
    const deferred = Q.defer();

    try {
      let project = null;

      global.projectService.getProject(appId).then((projectObj) => {
        project = projectObj;

        const adminUser = _.first(_.where(project.developers, { role: 'Admin' }));
        return global.userService.getAccountById(adminUser.userId);
      }).then((userObj) => {
        const presentPlan = _.first(_.where(pricingPlans.plans, { id: project.planId }));

        const notificationType = 'payment';
        const type = 'oneaction';
        // eslint-disable-next-line
        const text = `Your app <span style='font-weight:bold;'>${project.name}</span> has been over the limit of its current plan. Upgrade to next plan now.`;
        const meta = {
          notificationType: 'payment',
          acceptButton: {
            text: 'Upgrade',
            appId: project.appId,
            planId: project.planId,
          },
        };
        global.notificationService.createNotification(appId, userObj._id, notificationType, type, text, meta);

        const mailName = 'overlimit';
        const emailTo = userObj.email;
        const subject = `Your app${project.name}reached its API limit`;

        const variableArray = [
          {
            domClass: 'username',
            content: userObj.name,
            contentType: 'text',
          }, {
            domClass: 'appname',
            content: project.name,
            contentType: 'text',
          }, {
            domClass: 'planname',
            content: presentPlan.planName,
            contentType: 'text',
          },
        ];

        global.mailService.sendMail(mailName, emailTo, subject, variableArray);


        deferred.resolve({ message: 'success' });
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
