const config = require('../config');
const CB = require('@sauban/cloudboost');

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

const exemptInput = {
	app: true,
	object_id: true,
	table: true
}

const editObject = (z, bundle) => {
	const {
		table,
		object_id
	} = bundle.inputData;


	CB.CloudApp.init(config.cloudboostUrl, bundle.authData.appId, bundle.authData.appKey, {
		disableRealtime: true
	});

	CB.masterKey = bundle.authData.appKey;
	CB.jsKey = bundle.authData.appKey;
	var query = new CB.CloudQuery(table);

	return query.findById(object_id).then((obj) => {
		Object.keys(bundle.inputData)
			.filter(key => !exemptInput[key])
			.forEach(key => {
				if(bundle.inputData[key] && bundle.inputData[key] != obj.get(key)){
					obj.set(key, bundle.inputData[key]);
				}
			});
		return obj.save().then(saved => CB.toJSON(saved));
	});
};

const objectFields = (z, bundle) => {
	const {
		table,
		object_id
	} = bundle.inputData;

	if (!(table && object_id)) {
		return [];
	}

	const responsePromise = z.request({
		method: 'POST',
		url: `${config.cloudboostUrl}/app/${bundle.authData.appId}/${table}`,
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
							type: matchingFields[col.dataType]
						}

					if(helperTexts[col.dataType]){
						opts.helpText = helperTexts[col.dataType];
					}

					if(col.dataType === 'Object'){
						delete opts.type;
						opts.dict = true;
					}

					return opts;
				}) : [];
        });
};

module.exports = {
	key: 'UpdateObject',
	noun: 'update object',

	display: {
		label: 'Update Cloudboost Object',
		description: 'Update a cloudboost object by ID.'
	},

	operation: {
		inputFields: [
			{
				key: 'table',
				label: 'Table',
				required: true,
				dynamic: 'table.name.name'
			},
			{
				key: 'object_id',
				label: 'Object ID',
				required: true,
				dynamic: 'object_list.id.id'
			},
			objectFields
		],
		perform: editObject,
		sample: {
			id: '_039GDsdYT'
		}
	}
};