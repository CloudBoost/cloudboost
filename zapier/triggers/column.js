const sample = require('../samples/sample_column');
const config = require('../config');

const triggerColumn = (z, bundle) => {
	const tableName = bundle.inputData.table;
	const responsePromise = z.request({
		method: 'POST',
		url: `${config.cloudboostUrl}/app/${bundle.authData.appId}/${tableName}`,
		body: {
			key: bundle.authData.appKey
		}
	});
	return responsePromise
		.then(response => JSON.parse(response.content).columns.map((col, index) => Object.assign({id: `_${++index}0${col.name}`}, col)));
};

module.exports = {
	key: 'column',
	noun: 'Column',

	display: {
		label: 'New Column',
		description: 'Triggers on a new column in a selected table and app.'
	},

	operation: {
		inputFields: [
			{
				key: 'table',
				label: 'Table',
				required: true,
				dynamic: 'table.name.name'
			}
		],
		perform: triggerColumn,

		sample: sample
	}
};