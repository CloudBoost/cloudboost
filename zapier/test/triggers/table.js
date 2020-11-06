'use strict';
const should = require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

const nock = require('nock');
const config = require('../../config');

const tableSample = require('../../samples/sample_table');

//These are automated tests for the Issue create and Issue Trigger.
//They will run every time the `zapier test` command is executed.
describe('table trigger', function(){
    
    let apiMock = nock(config.cloudboostUrl);

    zapier.tools.env.inject();

    const authData = {
        appId: process.env.APP_ID,
        appKey: process.env.APP_KEY
    };

    afterEach(() => {
        nock.cleanAll();
    });

    // Make sure there's an open table to fetch here!
    it('should get a table', (done) => {
        const bundle = {
            inputData: {},
            authData
        };

        apiMock.post('/app/' + authData.appId + '/_getAll')
                .reply(200, [tableSample]);

        appTester(App.triggers.table.operation.perform, bundle)
            .then((response) => {
                response.should.be.an.instanceOf(Array);
                const firstElem = response[0];
                firstElem.should.have.property('name', tableSample.name);
                done();
            })
            .catch(done);
    });

});

