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
describe('column trigger', function(){
    
    let apiMock = nock(config.cloudboostUrl);

    zapier.tools.env.inject();

    const authData = {
        appId: process.env.APP_ID,
        appKey: process.env.APP_KEY
    };

    afterEach(() => {
        nock.cleanAll();
    });

    // Make sure there's an open column to fetch here!
    it('should get a column', (done) => {
        const bundle = {
            inputData: {
                table: tableSample.name
            },
            authData
        };

        apiMock.post(`/app/${authData.appId}/${bundle.inputData.table}`)
                .reply(200, tableSample);

        appTester(App.triggers.column.operation.perform, bundle)
            .then((response) => {
                response.should.be.an.instanceOf(Array);
                const columns = tableSample.columns;
                const firstElem = response[0];
                columns[0].should.have.property('name');
                firstElem.should.have.property('name');
                firstElem.name.should.eql(columns[0].name);
                done();
            })
            .catch(done);
    });

});

