/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const customHelper = require('../../helpers/custom.js');
const integrationService = require('../../services/integrationService');

const apiTracker = require('../../database-connect/apiTracker');
const customService = require('../../services/cloudObjects');
const appService = require('../../services/app');

module.exports = function (app) {
  app.put('/data/:appId/:tableName', (req, res) => { // save a new document into <tableName> of app
    if (req.body && req.body.method == 'DELETE') {
      /** ****************DELETE API******************** */
      _deleteApi(req, res);
      /** ****************DELETE API******************** */
    } else {
      /** ****************SAVE API******************** */

      const appId = req.params.appId;
      const document = req.body.document;
      const collectionName = req.params.tableName;
      const appKey = req.body.key || req.params.key;
      const sdk = req.body.sdk || 'REST';
      let table_event = '';

      if (document._id) {
        table_event = 'Update';
      } else {
        table_event = 'Create';
      }
      appService.isMasterKey(appId, appKey).then((isMasterKey) => {
        appService.getApp(appId).then((application) => {
          customService.save(appId, collectionName, document, customHelper.getAccessList(req), isMasterKey, null, application.keys.encryption_key).then((result) => {
            integrationService.integrationNotification(appId, document, collectionName, table_event);
            res.status(200).send(result);
          }, (error) => {
            res.status(400).send(error);
          });
        }, () => {
          res.status(400).send('App not found.');
        });
      });

      apiTracker.log(appId, 'Object / Save', req.url, sdk);
      /** ****************SAVE API******************** */
    }
  });

  app.get('/data/:appId/:tableName/find', _getData);
  app.post('/data/:appId/:tableName/find', _getData);

  app.get('/data/:appId/:tableName/count', _count);
  app.post('/data/:appId/:tableName/count', _count);

  app.get('/data/:appId/:tableName/distinct', _distinct);
  app.post('/data/:appId/:tableName/distinct', _distinct);

  app.get('/data/:appId/:tableName/findOne', _findOne);
  app.post('/data/:appId/:tableName/findOne', _findOne);

  app.delete('/data/:appId/:tableName', _deleteApi);

  function _deleteApi(req, res) { // delete a document matching the <objectId>
    const appId = req.params.appId;
    const collectionName = req.params.tableName;
    const document = req.body.document;
    const appKey = req.body.key || req.param('key');
    const sdk = req.body.sdk || 'REST';

    appService.isMasterKey(appId, appKey).then(isMasterKey => customService.delete(appId, collectionName, document, customHelper.getAccessList(req), isMasterKey)).then((result) => {
      integrationService.integrationNotification(appId, document, collectionName, 'Delete');
      res.json(result);
    }, (error) => {
      res.status(400).send(error);
    });

    apiTracker.log(appId, 'Object / Delete', req.url, sdk);
  }
};

function _getData(req, res) { // get document(s) object based on query and various parameters
  const appId = req.params.appId;
  const collectionName = req.params.tableName;
  const query = req.body.query;
  const select = req.body.select;
  const sort = req.body.sort;
  const limit = req.body.limit;
  const skip = req.body.skip;
  const appKey = req.body.key || req.param('key');
  const sdk = req.body.sdk || 'REST';

  appService.isMasterKey(appId, appKey).then(isMasterKey => customService.find(appId, collectionName, query, select, sort, limit, skip, customHelper.getAccessList(req), isMasterKey)).then((results) => {
    res.json(results);
  }, (error) => {
    res.status(400).send(error);
  });

  apiTracker.log(appId, 'Object / Find', req.url, sdk);
}

function _count(req, res) { // get document(s) object based on query and various parameters
  const appId = req.params.appId;
  const collectionName = req.params.tableName;
  const query = req.body.query;
  const limit = req.body.limit;
  const skip = req.body.skip;
  const appKey = req.body.key || req.param('key');
  const sdk = req.body.sdk || 'REST';

  appService.isMasterKey(appId, appKey).then(isMasterKey => customService.count(appId, collectionName, query, limit, skip, customHelper.getAccessList(req), isMasterKey)).then((result) => {
    res.json(result);
  }, (error) => {
    res.status(400).send(error);
  });

  apiTracker.log(appId, 'Object / Count', req.url, sdk);
}

function _distinct(req, res) { // get document(s) object based on query and various parameters
  const appId = req.params.appId;
  const collectionName = req.params.tableName;
  const onKey = req.body.onKey;
  const query = req.body.query;
  const select = req.body.select;
  const sort = req.body.sort;
  const limit = req.body.limit;
  const skip = req.body.skip;
  const appKey = req.body.key || req.param('key');
  const sdk = req.body.sdk || 'REST';

  appService.isMasterKey(appId, appKey).then(isMasterKey => customService.distinct(appId, collectionName, onKey, query, select, sort, limit, skip, customHelper.getAccessList(req), isMasterKey)).then((results) => {
    res.json(results);
  }, (error) => {
    res.status(400).send(error);
  });

  apiTracker.log(appId, 'Object / Distinct', req.url, sdk);
}

function _findOne(req, res) { // get a single document matching the search query
  const appId = req.params.appId;
  const collectionName = req.params.tableName;
  const query = req.body.query;
  const select = req.body.select;
  const sort = req.body.sort;
  const skip = req.body.skip;
  const appKey = req.body.key || req.param('key');
  const sdk = req.body.sdk || 'REST';

  appService.isMasterKey(appId, appKey).then(isMasterKey => customService.findOne(appId, collectionName, query, select, sort, skip, customHelper.getAccessList(req), isMasterKey)).then((result) => {
    res.json(result);
  }, (error) => {
    res.status(400).send(error);
  });

  apiTracker.log(appId, 'Object / FindOne', req.url, sdk);
}
