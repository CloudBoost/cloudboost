const config = require('../config');
const CB = require('@sauban/cloudboost');

const createObject = (z, bundle) => {
	CB.CloudApp.init(config.cloudboostUrl, bundle.authData.appId, bundle.authData.appKey, {
		disableRealtime: true
	});
	CB.masterKey = bundle.authData.appKey;
	CB.jsKey = bundle.authData.appKey;
	var newObject = new CB.CloudObject(bundle.inputData.table);
	Object.keys(bundle.inputData)
		.filter(key => key !== 'table' && key !== '_isModified')
		.forEach(column => {
			newObject.set(column, bundle.inputData[column]);
		});
	return newObject.save().then(saved => CB.toJSON(saved))
		.catch(err => {
			z.console.log('New object error ', err);
			throw new z.errors.HaltedError('Error creating object');
		});
};

const matchingFields = {
	'Number': 'number',
	'URL': 'string',
	'Text': 'text',
	'Email': 'string',
	'EncryptedText': 'string',
	'DateTime': 'datetime',
	'Boolean': 'boolean',
	'File': 'file',
	'Object': 'object'
};

const exemptByName = {
	'createdAt': true,
	'expires': true,
	'updatedAt': true,
	'Id': true
}

const helperTexts = {
	'URL': 'Value must be a valid URL e.g http://www.exmaple.com',
	'Email': 'Value must be a valid email address e.g user@example.com'
}

const objectFields = (z, bundle) => {
	
	if (!(bundle.inputData.table)) {
		return [];
	}

	const tableName = bundle.inputData.table;
	const responsePromise = z.request({
		method: 'POST',
		url: `${config.cloudboostUrl}/app/${bundle.authData.appId}/${tableName}`,
		body: {
			key: bundle.authData.appKey
		}
	});
	return responsePromise
		.then(response => {
			return response.json ? response.json.columns
				.filter(col => !!matchingFields[col.dataType] && !exemptByName[col.name])
				.map((col, index) => {
					let opts = {
						key: col.name,
						label: col.name,
						type: matchingFields[col.dataType],
						required: col.required
					}

					if (helperTexts[col.dataType]) {
						opts.helpText = helperTexts[col.dataType];
					}

					if (col.dataType === 'Object') {
						delete opts.type;
						opts.dict = true;
					}

					return opts;
				}) : [];
		});
};


module.exports = {
	key: 'InsertObject',
	noun: 'InsertObject',

	display: {
		label: 'Create Cloudboost Object',
		description: 'Insert a new cloudboost object.'
	},

	operation: {
		inputFields: [{
				key: 'table',
				label: 'Table',
				required: true,
				dynamic: 'table.name.name'
			},
			objectFields
		],
		perform: createObject,
		sample: {
			id: '_039GDsdYT'
		}
	}
};