
const winston = require('winston');
const Q = require('q');
const keys = require('../config/keys.js');
const util = require('./utilService');
const slack = require('slack-notify')(keys.slackWebHook); // eslint-disable-line
const Sales = require('../model/sales.js');

module.exports = {

  saveSalesRequest(data, requested) {
    const deferred = Q.defer();

    try {
      const self = this;

      if (util.isEmailValid(data.salesEmail)) {
        self.get(data.salesEmail, requested).then((lead) => {
          if (lead) {
            deferred.reject('Already Requested');
          } else {
            const newLead = new Sales();
            newLead.firstName = data.firstName;
            newLead.lastName = data.lastName;
            newLead.salesEmail = data.salesEmail;
            newLead.jobTitle = data.jobTitle;
            newLead.company = data.company;
            newLead.companySize = data.companySize;
            newLead.phoneNo = data.phoneNo;
            newLead.selectCountry = data.selectCountry;
            newLead.interestedFor = data.interestedFor;
            newLead.wantToSubscribe = data.wantToSubscribe;
            newLead.requested = requested;
            newLead.save((err, savedLead) => {
              if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(savedLead);
              }
            });
          }
        });
      } else {
        deferred.reject('Emailid invalid..');
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  get(email, requested) {
    const deferred = Q.defer();

    try {
      Sales.findOne({
        salesEmail: email,
        requested,
      }, (err, lead) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(lead);
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

  sendSlackNotification(lead, requested, resource) {
    let resourceLink = '';

    if (resource) {
      resourceLink = `\nFile Type: ${resource.type}\nFile Name: ${resource.title}`;
    }

    let iconUrl = '';
    let username = '';

    if (requested === 'whitepaper') {
      iconUrl = 'https://www.dropbox.com/s/ghp113v80buynf2/64.png?dl=0&raw=1&r=1';
      username = 'Whitepaper Request';
    }

    if (requested === 'Demo') {
      iconUrl = 'https://www.dropbox.com/s/mer9vp10a0d67s8/80.png?dl=0&r=1&raw=1';
      username = 'Demo Request';
    }

    slack.send({
      iconUrl,
      channel: '#cb-sales',
      username,
      attachments: [
        {
          fallback: requested,
          color: '#36a64f',
          fields: [
            {
              value: getLeadsFormatted(lead) + resourceLink,
              short: false,
            },
          ],
        },
      ],
    }, (err) => {
      winston.error({
        error: String(err),
        stack: new Error().stack,
      });
    });

    function getLeadsFormatted(newLead) {
      // eslint-disable-next-line max-len
      return `First Name: ${newLead.firstName}\nLast Name: ${newLead.lastName}\nEmail: ${newLead.salesEmail}\nJob Title: ${newLead.jobTitle}\nCompany: ${newLead.company}\nCompany Size: ${newLead.companySize}\nPhone No.: ${newLead.phoneNo}\nCountry: ${newLead.selectCountry}\nWhy interested: ${newLead.interestedFor}`;
    }
  },
};
