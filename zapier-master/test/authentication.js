'use strict';
require('should');

const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);

const nock = require('nock');

const config = require('../config');

describe('Custom authentication', function () {

	// Put your test TEST_EMAIL and TEST_PASSWORD in a .env file.
	// The inject method will load them and make them available to use in your
	// tests.
	zapier.tools.env.inject();

	let cloudApiMock = nock(config.cloudboostUrl);
	let authData = {
		appId: process.env.APP_ID,
		appKey: process.env.APP_KEY
	};

	afterEach(() => {
        nock.cleanAll();
    });

	it('should authenticate', (done) => {
		// Try changing the values of username or password to see how the test method behaves
		const bundle = {
			authData
		};

		cloudApiMock.post('/app/token', authData).reply(200, {
			appName: 'appName'
		});

		appTester(App.authentication.test, bundle)
			.then((response) => {
				response.status.should.eql(200);
				done();
			})
			.catch(done);
	});

});