

const winston = require('winston');
const Q = require('q');
const _ = require('underscore');
const request = require('request');
const pricingPlans = require('../config/pricingPlans.js')();
const keys = require('../config/keys.js');

module.exports = {

  createThirdPartySale(appId, planId) {
    const deferred = Q.defer();

    try {
      _createThirdPartySaleInAnalytics(appId, { planId })
        .then(() => global.projectService.updatePlanByAppId(appId, planId))
        .then(updatedProject => deferred.resolve(updatedProject))
        .catch(error => deferred.reject(error));
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  changePlan(userId, appId, _dataObj) {
    const deferred = Q.defer();
    const dataObj = _dataObj;
    try {
      global.userService.getAccountById(userId)
        .then(userObj => [global.projectService.getProject(appId), userObj])
        .spread((app, user) => {
          if (!app) {
            throw 'We can\'t find the application!';
          }
          dataObj.userId = userId;
          dataObj.userEmail = user.email;
          return [_changeSalePlanInAnalytics(appId, dataObj), user];
        })
        .spread((saleObject, user) => [global.projectService.updatePlanByAppId(appId, saleObject.planId), saleObject, user])
        .spread((updatedProject, saleObject, user) => {
          deferred.resolve(saleObject);
          const upgradedPlan = _.first(_.where(pricingPlans.plans, { id: saleObject.planId }));
          const notificationType = 'inform';
          const type = 'app-upgraded';
          // eslint-disable-next-line max-len
          const text = `Your app <span style='font-weight:bold;'>${updatedProject.name}</span> has been changed to <span style='font-weight:bold;'>${upgradedPlan.planName}</span>.`;
          global.notificationService.createNotification(appId, user._id, notificationType, type, text);

          const mailName = 'changeplan';
          const emailTo = user.email;
          const subject = "You've changed your app plan";

          const variableArray = [
            {
              domClass: 'username',
              content: user.name,
              contentType: 'text',
            }, {
              domClass: 'appname',
              content: updatedProject.name,
              contentType: 'text',
            }, {
              domClass: 'planname',
              content: saleObject.planName,
              contentType: 'text',
            },
          ];

          global.mailService.sendMail(mailName, emailTo, subject, variableArray);
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

  createSale(userId, appId, _dataObj) {
    const deferred = Q.defer();
    const dataObj = _dataObj;

    try {
      global.userService.getAccountById(userId)
        .then(userObj => [userObj, global.projectService.getProject(appId)])
        .spread((user, app) => {
          if (!app) {
            throw 'We can\'t find the application!';
          }
          dataObj.userId = userId;
          dataObj.userEmail = user.email;
          return [user, _createSaleInAnalytics(appId, dataObj)];
        })
        .spread((user, data) => [user, data, global.projectService.updatePlanByAppId(appId, data.planId)])
        .spread((user, saleObject, updatedProject) => {
          keys.agenda.cancel({ name: 'removeApp', 'data.appId': updatedProject.appId });
          deferred.resolve(saleObject);
          const upgradedPlan = _.first(_.where(pricingPlans.plans, { id: saleObject.planId }));
          const notificationType = 'inform';
          const type = 'app-upgraded';
          // eslint-disable-next-line max-len
          const text = `Your app <span style='font-weight:bold;'>${updatedProject.name}</span> has subscribed to <span style='font-weight:bold;'>${upgradedPlan.planName}</span>.`;
          global.notificationService.createNotification(appId, user._id, notificationType, type, text);

          const mailName = 'changeplan';
          const emailTo = user.email;
          const subject = 'Your new app plan';

          const variableArray = [
            {
              domClass: 'username',
              content: user.name,
              contentType: 'text',
            }, {
              domClass: 'appname',
              content: updatedProject.name,
              contentType: 'text',
            }, {
              domClass: 'planname',
              content: saleObject.planName,
              contentType: 'text',
            },
          ];

          global.mailService.sendMail(mailName, emailTo, subject, variableArray);
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

  stopRecurring(appId, userId) {
    const deferred = Q.defer();

    try {
      let project = null; // eslint-disable-line

      global.projectService.getProject(appId)
        .then((projectObj) => {
          project = projectObj;
          return _stopRecurringInAnalytics(appId, userId);
        })
        .then(() => global.projectService.updatePlanByAppId(appId, 1))
        .then((updatedProject) => {
          deferred.resolve({ message: 'Success' });
          sendCancelMailApp(userId, updatedProject);
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

  getPaymentsByUserId(userId) {
    const deferred = Q.defer();

    try {
      const url = `${keys.analyticsServiceUrl}/user/${userId}/payments`;
      request.get(url, {
        headers: {
          'content-type': 'application/json',
        },
      }, (err, response, body) => {
        if (err || response.statusCode >= 400) {
          deferred.reject(body);
        } else {
          try {
            const respBody = JSON.parse(body);
            deferred.resolve(respBody);
          } catch (e) {
            deferred.resolve();
          }
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

  getCustomer(appId, userId) {
    const deferred = Q.defer();

    try {
      let dataObj = {};
      dataObj.userId = userId;
      dataObj = JSON.stringify(dataObj);

      const url = `${keys.analyticsServiceUrl}/${appId}/customer/get`;
      request.post(url, {
        headers: {
          'content-type': 'application/json',
          'content-length': dataObj.length,
        },
        body: dataObj,
      }, (err, response, body) => {
        if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
          deferred.reject(err);
        } else {
          try {
            const respBody = JSON.parse(body);
            deferred.resolve(respBody);
          } catch (e) {
            deferred.resolve();
          }
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

  cancelPlanAndRefund(appId, userId) {
    const deferred = Q.defer();

    try {
      let dataObj = {
        userId,
        stopPreviousPlan: true,
      };
      dataObj.secureKey = keys.secureKey;
      dataObj = JSON.stringify(dataObj);
      const url = `${keys.analyticsServiceUrl}/${appId}/cancel`;
      request.post(url, {
        headers: {
          'content-type': 'application/json',
          'content-length': dataObj.length,
        },
        body: dataObj,
      }, (err, response, body) => {
        if (err || response.statusCode >= 400 || body === 'Error') {
          deferred.reject(err);
        } else {
          try {
            const respBody = JSON.parse(body);
            deferred.resolve(respBody);
          } catch (e) {
            deferred.resolve();
          }
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

  cancelPlanAfter(appId) {
    const deferred = Q.defer();

    try {
      const dataObj = JSON.stringify({
        cancel_at_period_end: true,
      });
      const url = `${keys.analyticsServiceUrl}/${appId}/subscription/update`;
      request.post(url, {
        headers: {
          'content-type': 'application/json',
          'content-length': dataObj.length,
        },
        body: dataObj,
      }, (err, response, body) => {
        if (err || response.statusCode >= 400) {
          deferred.reject(err || body);
        } else {
          try {
            const respBody = JSON.parse(body);
            deferred.resolve(respBody);
          } catch (e) {
            deferred.resolve();
          }
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

};

/** *********************Pinging Analytics Services******************************** */

function sendCancelMailApp(userId, updatedProject) {
  global.userService.getAccountById(userId)
    .then((userObj) => {
      const previousPlan = _.first(_.where(pricingPlans.plans, { id: updatedProject.planId }));

      const notificationType = 'inform';
      const type = 'app-payment-stopped';
      // eslint-disable-next-line max-len
      const text = `Your app <span style='font-weight:bold;'>${updatedProject.name}</span> has been cancelled for the <span style='font-weight:bold;'>${previousPlan.planName}</span>.`;
      global.notificationService.createNotification(updatedProject.appId, userObj._id, notificationType, type, text);

      const mailName = 'cancelplan';
      const emailTo = userObj.email;
      const subject = "You've canceled your plan";

      const variableArray = [
        {
          domClass: 'username',
          content: userObj.name,
          contentType: 'text',
        }, {
          domClass: 'appname',
          content: updatedProject.name,
          contentType: 'text',
        }, {
          domClass: 'planname',
          content: previousPlan.planName,
          contentType: 'text',
        },
      ];

      global.mailService.sendMail(mailName, emailTo, subject, variableArray);
    }, (error) => {
      winston.error({
        error: String(error),
        stack: new Error(String(error)).stack
      });
    });
}

function _createSaleInAnalytics(appId, _dataObj) {
  const deferred = Q.defer();
  let dataObj = _dataObj;
  try {
    dataObj.secureKey = keys.secureKey;
    dataObj = JSON.stringify(dataObj);

    const url = `${keys.analyticsServiceUrl}/${appId}/sale`;
    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': dataObj.length,
      },
      body: dataObj,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        winston.log('error', {
          error: String(err),
          stack: new Error().stack,
        });
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.resolve();
        }
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
}

function _changeSalePlanInAnalytics(appId, _dataObj) {
  const deferred = Q.defer();
  let dataObj = _dataObj;

  try {
    dataObj.secureKey = keys.secureKey;
    dataObj = JSON.stringify(dataObj);

    const url = `${keys.analyticsServiceUrl}/${appId}/sale/plan`;
    request.put(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': dataObj.length,
      },
      body: dataObj,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.resolve();
        }
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
}

function _createThirdPartySaleInAnalytics(appId, _dataObj) {
  const deferred = Q.defer();
  let dataObj = _dataObj;

  try {
    dataObj.secureKey = keys.secureKey;
    dataObj = JSON.stringify(dataObj);

    const url = `${keys.analyticsServiceUrl}/${appId}/thirdPartySale`;
    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': dataObj.length,
      },
      body: dataObj,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.resolve();
        }
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
}

function _stopRecurringInAnalytics(appId, userId) {
  const deferred = Q.defer();

  try {
    let dataObj = {};
    dataObj.secureKey = keys.secureKey;
    dataObj.userId = userId;
    dataObj = JSON.stringify(dataObj);

    const url = `${keys.analyticsServiceUrl}/${appId}/cancel`;

    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': dataObj.length,
      },
      body: dataObj,
    }, (err, response, body) => {
      if (err) {
        return deferred.reject(err);
      }
      // eslint-disable-next-line
      if (response && response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        deferred.reject(err);
      }

      try {
        const respBody = JSON.parse(body);
        return deferred.resolve(respBody);
      } catch (e) {
        return deferred.reject(e);
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
}
