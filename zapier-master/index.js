const authentication = require('./authentication');

const tableTrigger = require('./triggers/table');
const columnTrigger = require('./triggers/column');
const objectTrigger = require('./triggers/new_object');
const objectListTrigger = require('./triggers/object_list');

const removeObjectAction = require('./actions/delete_object');
const updateObjectAction = require('./actions/edit_object_id');
const fetchObjectAction = require('./actions/get_object_by_id');
const createObjectAction = require('./actions/new_object');
const queryObjectAction = require('./actions/query_objects');

// Now we can roll up all our behaviors in an App.
const App = {
  // This is just shorthand to reference the installed dependencies you have. Zapier will
  // need to know these before we can upload
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication: authentication,

  // If you want your resource to show up, you better include it here!
  resources: {},

  // If you want your trigger to show up, you better include it here!
  triggers: {
    [tableTrigger.key]: tableTrigger,
    [columnTrigger.key]: columnTrigger,
    [objectTrigger.key]: objectTrigger,
    [objectListTrigger.key]: objectListTrigger
  },

  // If you want your searches to show up, you better include it here!
  searches: {
    [queryObjectAction.key]: queryObjectAction,
    [fetchObjectAction.key]: fetchObjectAction
  },

  // If you want your creates to show up, you better include it here!
  creates: {
    [createObjectAction.key]: createObjectAction,
    [updateObjectAction.key]: updateObjectAction,
    [removeObjectAction.key]: removeObjectAction
  }
};

// Finally, export the app.
module.exports = App;
