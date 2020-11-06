const cloudboostUrl = require('./config').cloudboostUrl;

const testAuth = (z, bundle) => {
	const promise = z.request({
		url: `${cloudboostUrl}/app/token`,
		method: 'POST',
		body: {
			appId: bundle.authData.appId,
			appKey: bundle.authData.appKey
		}
	});

	// This method can return any truthy value to indicate the credentials are valid.
	// Raise an error to show
	return promise.then((response) => {
		if (response.status === 401) {
			throw new z.errors.HaltedError('The token provided is invalid');
		}
		bundle.authData = Object.assign({}, bundle.authData, response.json);
		return response;
	});
};

module.exports = {
	type: 'custom',
	// "test" could also be a function
	test: testAuth,
	connectionLabel: '{{appName}}',
	fields: [{
			key: 'appId',
			label: 'App ID',
			type: 'string',
			required: true
		},
		{
			key: 'appKey',
			label: 'App Secret Key',
			type: 'string',
			required: true
		}
	]
};