/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
const winston = require('winston');
const customHelper = require('../../helpers/custom.js');
const integrationService = require('../../services/integrationService');

const apiTracker = require('../../database-connect/apiTracker');
const customService = require('../../services/cloudObjects');
const appService = require('../../services/app');

const deleteApi = async (req, res) => { // delete a document matching the <objectId>
  const { appId, tableName: collectionName } = req.params;
  const { document, sdk = 'REST' } = req.body;
  const appKey = req.body.key || req.param('key');

  apiTracker.log(appId, 'Object / Delete', req.url, sdk);

  try {
    const isMasterKey = await appService.isMasterKey(appId, appKey);
    const result = await customService.delete(
      appId,
      collectionName,
      document,
      customHelper.getAccessList(req),
      isMasterKey,
    );
    integrationService.integrationNotification(appId, document, collectionName, 'Delete');
    res.json(result);
  } catch (error) {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    res.status(400).send(error);
  }
};

// get document(s) object based on query and various parameters
const getData = async (req, res) => {
  const { appId, tableName: collectionName } = req.params;
  const {
    query,
    select,
    sort,
    limit,
    skip,
    sdk = 'REST',
  } = req.body;
  const appKey = req.body.key || req.param('key');

  apiTracker.log(appId, 'Object / Find', req.url, sdk);

  try {
    const isMasterKey = await appService.isMasterKey(appId, appKey);
    const results = await customService.find(
      appId,
      collectionName,
      query,
      select,
      sort,
      limit,
      skip,
      customHelper.getAccessList(req),
      isMasterKey,
    );
    res.json(results);
  } catch (error) {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    res.status(400).send(error);
  }
};

const count = async (req, res) => { // get document(s) object based on query and various parameters
  const { appId, tableName: collectionName } = req.params;
  const {
    query,
    limit,
    skip,
    sdk = 'REST',
  } = req.body;
  const appKey = req.body.key || req.param('key');

  apiTracker.log(appId, 'Object / Count', req.url, sdk);

  try {
    const isMasterKey = await appService.isMasterKey(appId, appKey);
    const result = await customService.count(
      appId,
      collectionName,
      query,
      limit,
      skip,
      customHelper.getAccessList(req),
      isMasterKey,
    );
    res.json(result);
  } catch (error) {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    res.status(400).send(error);
  }
};

// get document(s) object based on query and various parameters
const distinct = async (req, res) => {
  const { appId, tableName: collectionName } = req.params;
  const {
    onKey,
    query,
    limit,
    skip,
    sdk = 'REST',
    select,
    sort,
  } = req.body;
  const appKey = req.body.key || req.param('key');

  apiTracker.log(appId, 'Object / Distinct', req.url, sdk);

  try {
    const isMasterKey = await appService.isMasterKey(appId, appKey);
    const results = await customService.distinct(
      appId,
      collectionName,
      onKey,
      query,
      select,
      sort,
      limit,
      skip,
      customHelper.getAccessList(req),
      isMasterKey,
    );
    res.json(results);
  } catch (error) {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    res.status(400).send(error);
  }
};

const findOne = async (req, res) => { // get a single document matching the search query
  const { appId, tableName: collectionName } = req.params;
  const {
    query,
    select,
    sort,
    skip,
    sdk = 'REST',
  } = req.body;
  const appKey = req.body.key || req.param('key');

  apiTracker.log(appId, 'Object / FindOne', req.url, sdk);

  try {
    const isMasterKey = await appService.isMasterKey(appId, appKey);
    const results = await customService.findOne(
      appId,
      collectionName,
      query,
      select,
      sort,
      skip,
      customHelper.getAccessList(req),
      isMasterKey,
    );
    res.json(results);
  } catch (error) {
    winston.error({
      error: String(error),
      stack: new Error().stack,
    });
    res.status(400).send(error);
  }
};

const updateTable = async (req, res) => { // save a new document into <tableName> of app
  if (req.body && req.body.method === 'DELETE') {
    /** ****************DELETE API******************** */
    deleteApi(req, res);
    /** ****************DELETE API******************** */
  } else {
    /** ****************SAVE API******************** */

    const { appId, tableName: collectionName } = req.params;
    const appKey = req.body.key || req.params.key;
    const { document } = req.body;
    const sdk = req.body.sdk || 'REST';
    const tableEvent = document._id // eslint-disable-line no-underscore-dangle
      ? 'Update' : 'Create';
    /** ****************SAVE API******************** */
    try {
      apiTracker.log(appId, 'Object / Save', req.url, sdk);
      const isMasterKey = await appService.isMasterKey(appId, appKey);
      const application = await appService.getApp(appId);
      const result = await customService.save(
        appId,
        collectionName,
        document,
        customHelper.getAccessList(req),
        isMasterKey,
        null,
        application.keys.encryption_key,
      );
      integrationService.integrationNotification(appId, document, collectionName, tableEvent);
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send(error);
    }
  }
};

module.exports = (app) => {
  app.put('/data/:appId/:tableName', updateTable);

  app.get('/data/:appId/:tableName/find', getData);
  app.post('/data/:appId/:tableName/find', getData);

  app.get('/data/:appId/:tableName/count', count);
  app.post('/data/:appId/:tableName/count', count);

  app.get('/data/:appId/:tableName/distinct', distinct);
  app.post('/data/:appId/:tableName/distinct', distinct);

  app.get('/data/:appId/:tableName/findOne', findOne);
  app.post('/data/:appId/:tableName/findOne', findOne);

  app.delete('/data/:appId/:tableName', deleteApi);
};
