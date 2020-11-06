'use strict';
const should = require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

const nock = require('nock');
const config = require('../../config');

const objectCreate = require('../../samples/object_sample');



//These are automated tests for the Issue create and Issue Trigger.
//They will run every time the `zapier test` command is executed.
describe('Object creates', function(){
    
    let apiMock = nock(config.cloudboostUrl);

    zapier.tools.env.inject();
   
    const authData = {
        appId: process.env.APP_ID,
        appKey: process.env.APP_KEY
    };
    
    afterEach(() => {
        nock.cleanAll();
    });

    it('should create an object', (done) => {
        const bundle = {
            authData,
            inputData: {
                table: objectCreate._tableName,
                sender_email: 'ssaas'
            }
        };

        apiMock.put('/data/' + authData.appId + '/' + bundle.inputData.table)
                .reply(200, objectCreate);

        appTester(App.creates.InsertObject.operation.perform, bundle)
            .then(() => done())
            .catch(done);
    });
});

