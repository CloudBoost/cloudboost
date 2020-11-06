const config = require('../config');
const CB = require('@sauban/cloudboost');

const queryObject = (z, bundle) => {
    const { selected_columns, table, search_value } = bundle.inputData;
    CB.CloudApp.init(config.cloudboostUrl, bundle.authData.appId, bundle.authData.appKey, {disableRealtime : true});
    CB.masterKey = bundle.authData.appKey;
    CB.jsKey = bundle.authData.appKey;
    var query = new CB.CloudQuery(table);
    query.search(search_value);

    if(selected_columns && selected_columns.length){
        query.selectColumn(selected_columns);
    }
    
    return query.find().then(records =>  CB.toJSON(records));
}

module.exports = {
	key: 'QueryObject',
	noun: 'QueryObject',

	display: {
		label: 'Query Cloudboost Object',
		description: 'Query cloudboost objects in a table.'
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
                key: 'search_value',
                label: 'Search value',
                helpText: 'The value to find in the selected table column',
                required: true
            },
            {
                key: 'selected_columns',
                label: 'Select columns',
                required: false,
                dynamic: 'column.name.name',
                list: true
            }
		],
		perform: queryObject,
		sample: {
            id: '_039GDsdYT'
        }
	}
};