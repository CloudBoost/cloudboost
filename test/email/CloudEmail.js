var window = window || null;
var request = require('request');
var SECURE_KEY = "37ac59f0-7eab-49b8-8bc9-e121b35ec2b6";
var URL = "http://localhost:4730";
var equal = require('deep-equal');
var util = require('./Util.js');
var testAppId = null;
var testKey = null;
var testMasterKey = null;

describe("CloudBoost Email API", function () {

   it('should send emails successfully', done => {
        this.timeout(100000);
        let params = {
            key: testMasterKey,
            emailBody: 'test12',
            emailSubject: 'test12',
            query: ''
        }

        request({
            url: URL + '/email/' + testAppId + '/campaign', //URL to hit
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: params //Set the body as a string
        }, function (error, response, json) {
            if (error) {
                done(error);
            } else {
                done();
            }
        });

    });


});