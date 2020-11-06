const sample = require('../samples/sample_table');
const config = require('../config');

const triggerTable = (z, bundle) => {
  const { authData } = bundle;
  const responsePromise = z.request({
    method: 'POST',
    url: `${config.cloudboostUrl}/app/${authData.appId}/_getAll`,
    body: {
      key: authData.appKey
    }
  });
  return responsePromise
    .then(response => JSON.parse(response.content));
};

module.exports = {
  key: 'table',
  noun: 'Table',

  display: {
    label: 'Get Table',
    description: 'Triggers on a new table.'
  },

  operation: {
    inputFields: [],
    perform: triggerTable,

    sample: sample
  }
};
