const config = require('../config');
const CB = require('@sauban/cloudboost');

const removeObject = (z, bundle) => {
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
		return obj.delete().then(deleted => CB.toJSON(deleted));
	});
};

module.exports = {
	key: 'DeleteObject',
	noun: 'Remove object by ID',

	display: {
		label: 'Remove Cloudboost Object',
		description: 'Remove a cloudboost object by ID.'
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
        }
		],
		perform: removeObject,
		sample: {
            id: '_039GDsdYT'
        }
	}
};