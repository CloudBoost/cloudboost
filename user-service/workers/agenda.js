const agenda = require('../config/agenda');
const keys = require('../config/keys');
const Project = require('../model/project');

module.exports = function () {
  agenda.define('forwardCustomerDetails', (job, done) => {
    const { appId, disabledReason } = job.attrs.data;
    Project.findOne({
      appId,
      disabled: true,
    })
      .populate('_userId')
      .then((app) => {
        if (app) {
          global.mailService.forwardCustomerDetails({
            userEmail: app._userId.email,
            userName: app._userId.name,
            appId,
            appName: app.name,
            disabledReason,
          });
        }
        done();
      })
      .catch(done);
  });

  agenda.define('disableApp', (job, done) => {
    const { appId, disabledReason, toBeDeleted } = job.attrs.data;
    Project.update({
      appId,
      disabled: false,
    }, {
      $set: {
        disabled: true,
        disabledReason,
      },
    }, (err) => {
      if (err) {
        return done(err);
      }

      if (toBeDeleted) {
        const datein30 = new Date();
        datein30.setDate(datein30.getDate() + 30);
        return keys.agenda.schedule(datein30, 'removeApp', {
          appId,
          query: {
            appId,
            disabled: true,
          },
        });
      }

      return done();
    });
  });

  agenda.define('removeApp', (job, done) => {
    const { appId } = job.attrs.data;
    global.projectService.deleteProjectBy({
      appId,
    })
      .then(() => {
        global.paymentCardService.deleteSalesFromAnalytics(appId, {
          appId,
        });
        done();
      }, done);
  });

  agenda.define('sendPaymentReminder', (job, done) => {
    const {
      appId,
      userEmail,
      userName,
      appName
    } = job.attrs.data;
    const mailName = 'inactiveApp';
    const subject = `Your app ${appName} is Inactive.`;
    const accountsURL = keys.accountsUrl;
    const variableArray = [
      {
        domClass: 'username',
        content: userName,
        contentType: 'text',
      }, {
        domClass: 'appname',
        content: appName,
        contentType: 'text',
      }, {
        domClass: 'link',
        content: `<a href='${accountsURL}/reactivate/${appId}' class='btn-primary'>Activate App</a>`,
        contentType: 'html',
      },
    ];
    global.mailService.sendMail(mailName, userEmail, subject, variableArray).then(() => done(), done);
  });

  agenda.define('deleteInactiveApp', (job, done) => {
    const deleteReason = job.attrs.data.deleteReason || 'Inactive for 60days';
    global.projectService.deleteInactiveApps(deleteReason).then((inactiveApps) => {
      inactiveApps.forEach((app) => {
        if (app.keys.encryption_key) {
          delete app.keys.encryption_key; // eslint-disable-line
        }
      });
      return done();
    }, done);
  });

  agenda.define('deactivateApp', (job, done) => {
    global.projectService.notifyInactiveApps().then((inactiveApps) => {
      inactiveApps.forEach((app) => {
        if (app.keys.encryption_key) {
          delete app.keys.encryption_key; // eslint-disable-line
        }
      });
      return done();
    }, done);
  });

  keys.agenda = agenda;
  agenda.start();
  return agenda;
};
