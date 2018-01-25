var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;    // Using Assert style
var expect = chai.expect;    // Using Expect style
var should = chai.should();
var server = require('../api/email/CloudEmail');
chai.use(chaiHttp);

describe('CloudEmail API', () => {

  const appId = 'dfkcytsfffqs'  // Add your appId here to test.
  const key = '262d5969-e56f-47d2-9b4d-4bcbda06dda0'   // Get key from your DASHBOARD-UI
  describe('should send emails successfully', () => {

    it('sent emails successfully, status should be "Success"', done => {
      let postObject = {
        key: key,
        emailBody: 'test',
        emailSubject: 'test',
        query: ''
      }
      chai.request('http://localhost:4730')
        .post('/email/' + appId + '/campaign')
        .send(postObject)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done(console.log(res.type));
        });
    });
  });

  describe('should fail to send Email', () => {
    it('appID is not defined, status message should be "The endpoint was not found"', done => {
      let postObject = {
        key: key,
        emailBody: 'test',
        emailSubject: 'test',
        query: ''
      }
      chai.request('http://localhost:4730')
        .post('/email/campaign')
        .send(postObject)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done(console.log(res.text));
        });
    });
  });

  describe('should fail to send Email  ', () => {

    it('appKey is not defined, status should be "Unauthorized"', done => {
      let postObject = {
        emailBody: 'test',
        emailSubject: 'test',
        query: ''
      }
      chai.request('http://localhost:4730')
        .post('/email/' + appId + '/campaign')
        .send(postObject)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done(console.log(res.text));
        });
    });
  });

});