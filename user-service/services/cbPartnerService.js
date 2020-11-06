

const winston = require('winston');
const Q = require('q');
const keys = require('../config/keys');
const slack = require('slack-notify')(keys.slackWebHook); // eslint-disable-line
const CbPartner = require('../model/cbpartner');

module.exports = {
  save(data) {
    const deferred = Q.defer();

    try {
      CbPartner.findOne({
        companyEmail: data.companyEmail,
      })
        .then((partner) => {
          if (partner) {
            return deferred.reject({
              Error: 'This Business email already subscribed to cloudboost.',
            });
          }
          const cbPartner = new CbPartner();
          cbPartner.companyName = data.companyName;
          cbPartner.companyDescription = data.companyDescription;
          cbPartner.personName = data.personName;
          cbPartner.companyEmail = data.companyEmail;
          cbPartner.companyContact = data.companyContact;
          cbPartner.personMobile = data.personMobile;
          cbPartner.companyAddress = data.companyAddress;
          cbPartner.companyWebsite = data.companyWebsite;
          cbPartner.companyCountry = data.companyCountry;
          cbPartner.appSpecilizedIn = data.appSpecilizedIn;
          cbPartner.companySize = data.companySize;
          cbPartner.createdAt = new Date();

          return cbPartner.save();
        })
        .then((cbPartner) => {
          const partnersListId = '4c5ae5e681';
          global.mailChimpService.addSubscriber(partnersListId, data.companyEmail);
          global.mailService.sendTextMail(keys.adminEmailAddress,
            keys.adminEmailAddress, 'CloudBoost Partner Application', JSON.stringify(cbPartner));
          deferred.resolve({
            message: 'Success',
            id: cbPartner._id,
          });
        })
        .catch(err => deferred.reject(err));
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  getById(partnerId) {
    const deferred = Q.defer();

    try {
      CbPartner.findById(partnerId, (err, partner) => {
        if (err) {
          return deferred.reject(err);
        }
        if (!partner) {
          return deferred.reject('Incorrect ID');
        }

        return deferred.resolve(partner._doc);
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

  getList(_skip, _limit) {
    const deferred = Q.defer();
    let skip = _skip;
    let limit = _limit;
    try {
      if (!skip) {
        skip = 0;
      }

      if (!limit) {
        limit = 9999999;
      }

      if (skip) {
        skip = parseInt(skip, 10);
      }

      if (limit) {
        limit = parseInt(limit, 10);
      }

      CbPartner.find({}).skip(skip).limit(limit).sort({
        createdAt: -1,
      })
        .exec((err, partnerList) => {
          if (err) {
            return deferred.reject(err);
          }

          return deferred.resolve(partnerList);
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

  sendSlackNotification(data) {
    // eslint-disable-next-line max-len
    const getTextFormatted = obj => `Company Name: ${obj.companyName}\nCompany Description: ${obj.companyDescription}\nPerson Name: ${obj.personName}\nCompany Email: ${obj.companyEmail}\nCompany Contact: ${obj.companyContact}\nPerson Mobile: ${obj.personMobile}\nCompany Address: ${obj.companyAddress}\nCompany Website: ${obj.companyWebsite}\nCompany Country: ${obj.companyCountry}\nApp Specilized In: ${obj.appSpecilizedIn}\ncompanySize: ${obj.companySize}`;
    slack.send({
      icon_url: 'https://png.icons8.com/collaboration/dusk/64',
      channel: '#sales',
      username: 'PARTNER SIGNED UP',
      attachments: [{
        fallback: "Partner's details",
        pretext: "Partner's details",
        color: '#36a64f',
        fields: [{
          value: getTextFormatted(data),
          short: false,
        }],
      }],
    });
  },
};
