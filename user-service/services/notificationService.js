

const winston = require('winston');
const Q = require('q');
const axios = require('axios');
const keys = require('../config/keys.js');
const Notification = require('../model/notification');

module.exports = {

  createNotification(appId, email, notificationType, type, text, meta) {
    const deferred = Q.defer();

    try {
      const notification = new Notification();

      notification.user = email;
      notification.appId = appId;
      notification.notificationType = notificationType;
      notification.type = type;
      notification.text = text;
      notification.seen = false;
      notification.timestamp = new Date().getTime();
      notification.meta = meta || {};

      notification.save((err, notificationObj) => {
        if (err) {
          deferred.reject(err);
        }
        if (!notificationObj) {
          deferred.reject('Cannot save the notification right now.');
        } else {
          deferred.resolve(notificationObj);
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
  getNotifications(userId, _skip, _limit) {
    const deferred = Q.defer();
    let skip = _skip;
    let limit = _limit;

    try {
      skip = parseInt(skip, 10);
      limit = parseInt(limit, 10);

      Notification.find({ user: userId }).sort({ timestamp: -1 }).skip(skip).limit(limit)
        .exec((err, notificatonList) => {
          if (err) {
            deferred.reject(err);
          }
          if (notificatonList && notificatonList.length > 0) {
            deferred.resolve(notificatonList);
          } else {
            deferred.resolve(null);
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
  linkUserId(email, userId) {
    const deferred = Q.defer();

    try {
      Notification.findOneAndUpdate({
        user: email,
      }, {
        $set: {
          user: userId,
        },
      }, {
        new: true,
      }, (err, savedNotification) => {
        if (err) {
          deferred.reject(err);
        }
        if (savedNotification) {
          deferred.resolve(savedNotification);
        } else {
          deferred.resolve(null);
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
  updateNotificationsSeen(userId) {
    const deferred = Q.defer();

    try {
      Notification.update(
        {
          user: userId,
          seen: false
        },
        {
          meta: {}, // Because meta is "required" in Notification scheme
          seen: true
        },
        { multi: true }, // Updating every item that passed the above critiria.
        (err, updateResult) => {
          if (err) {
            deferred.reject(err);
          }
          if (updateResult && updateResult.ok === 1) {
            deferred.resolve({ message: 'success' });
          } else {
            deferred.resolve(null);
          }
        }
      );
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },
  removeNotificationById(notifyId) {
    const deferred = Q.defer();

    try {
      Notification.remove({
        _id: notifyId,
      }, (err) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve({ message: 'Success.' });
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
  slackNotification(data) {
    if (keys.slackWebHook) {
      axios({
        url: keys.slackWebHook,
        method: 'post',
        withCredentials: false,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: {
          channel: '#sales',
          username: 'Cloudboost signup bot',
          icon_emoji: ':speaking_head_in_silhouette:',
          text: 'Ahoy everyone!\n We have a new customer on cloudboost!',
          attachments: [
            {
              fields: [
                {
                  title: 'Company Name',
                  value: data.companyName,
                  short: false,
                }, {
                  title: 'Email',
                  value: data.email,
                  short: false,
                }, {
                  title: 'Company Size',
                  value: data.companySize,
                  short: false,
                }, {
                  title: 'Name',
                  value: data.name,
                  short: false,
                }, {
                  title: 'Job role',
                  value: data.jobRole,
                  short: false,
                }, {
                  title: 'Phone Number',
                  value: data.phoneNumber,
                  short: false,
                }, {
                  title: 'Reference',
                  value: data.reference,
                  short: false,
                },
              ],
            },
          ],

        },
      }).then(() => {
      }, (err) => {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
      });
    }
  },
  subscriptionCancelledNotification(data) {
    const notificationType = 'inform';
    const type = 'subscription-cancelled';
    const text = `Your app <span style='font-weight:bold;'>${data.appName}'s</span> subscription plan is cancelled`;
    this.createNotification(data.appId, data.userId, notificationType, type, text);
  },
  deletedAppNotification(data, userId) {
    const notificationType = 'inform';
    const type = 'delete-app';
    const text = `Your app <span style='font-weight:bold;'>${data.name}</span> is deleted permanently.`;
    this.createNotification(data.appId, userId, notificationType, type, text);
  },
};
