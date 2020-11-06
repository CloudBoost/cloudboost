const config = require('../config');
const CB = require('@sauban/cloudboost');

const getObject = (z, bundle) => {
    const { table, object_id } = bundle.inputData;
    CB.CloudApp.init(config.cloudboostUrl, bundle.authData.appId, bundle.authData.appKey, {disableRealtime : true});
    CB.masterKey = bundle.authData.appKey;
    CB.jsKey = bundle.authData.appKey;
    var query = new CB.CloudQuery(table);
    query.equalTo('id', object_id);
    return query.find().then(records => CB.toJSON(records));
};

module.exports = {
	key: 'FetchObject',
	noun: 'Existing Object',

	display: {
		label: 'Get Cloudboost Object',
		description: 'Get a cloudboost object by ID.'
	},

	operation: {
		inputFields: [
            {
				key: 'table',
				label: 'Select table',
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
		perform: getObject,
		sample: {
            id: '_039GDsdYT'
        }
	}
};