/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
const path = require('path');
const winston = require('winston');
const apiTracker = require('../../database-connect/apiTracker');
const config = require('../../config/config');
const appService = require('../../services/app');
const otherService = require('../../services/other');
const customHelper = require('../../helpers/custom.js');
const isAppDisabled = require('../../middlewares/isAppDisabled');

module.exports = function (app) {
  /**
     * @description Middleware used for zapier application auth using app ID and app secret key
     * @param {*} req
     * @param {Object} req.body
     * @param {String} req.body.appId
     * @param {String} req.body.appKey
     * @param {*} res
     */

  app.post('/app/token', (req, res) => {
    const appId = req.body.appId;
    const appKey = req.body.appKey;

    appService.isMasterKey(appId, appKey).then((isValid) => {
      if (isValid) {
        return appService.getApp(appId).then(app => res.status(200).json({
          appName: app.name,
        }), () => res.status(401).send('App not found'));
      }
      return res.status(401).send('Invalid access keys provided');
    }, () => res.status(401).send('Invalid keys'));
  });

  // create a new app.
  app.post('/app/:appId', (req, res) => {
    try {
      const appId = req.params.appId;

      const sdk = req.body.sdk || 'REST';

      if (config.secureKey === req.body.secureKey) {
        appService.createApp(appId).then((app) => {
          appService.createDefaultTables(appId).then(() => {
            delete app.keys.encryption_key;
            res.status(200).send(app);
          }, (err) => {
            res.status(500).send(err);
          });
        }, (err) => {
          winston.error({
            error: err,
          });
          res.status(500).send(err);
        });
      } else {
        res.status(401).send('Unauthorized');
      }

      apiTracker.log(appId, 'App / Create', req.url, sdk);
    } catch (e) {
      winston.error({
        error: e,
      });
      return res.status(500).json({
        error: e,
      });
    }
  });

  // delete app.
  app.delete('/app/:appId', _deleteApp);
  app.put('/app/:appId', _deleteApp);

  function _deleteApp(req, res) { // delete the app and all of its data.
    const appId = req.params.appId;
    const sdk = req.body.sdk || 'REST';

    const body = req.body || {};
    const deleteReason = body.deleteReason;
    if (config.secureKey === body.secureKey) {
      // delete all code here.
      appService.deleteApp(appId, deleteReason).then(() => res.status(200).send({
        status: 'Success',
      }), () => res.status(500).send({
        status: 'Error',
      }));
    } else {
      return res.status(401).send({
        status: 'Unauthorized',
      });
    }

    apiTracker.log(appId, 'App / Delete', req.url, sdk);
  }

  // delete a table.
  app.delete('/app/:appId/:tableName', _deleteTable);

  function _deleteTable(req, res) { // delete the app and all of its data.
    try {
      // this method is to delete a particular collection from an app.

      var appId = req.params.appId;
      const tableName = req.params.tableName;
      var sdk = req.body.sdk || 'REST';

      const appKey = req.body.key || req.params.key;

      // to delete table authorize on app level
      appService.isClientAuthorized(appId, appKey, 'app', null).then((isAuthorized) => {
        if (isAuthorized) {
          appService.deleteTable(appId, tableName).then((table) => {
            res.status(200).send(table);
          }, (error) => {
            winston.error({
              error,
            });

            res.status(500).send('Cannot delete table at this point in time. Please try again later.');
          });
        } else {
          return res.status(401).send({
            status: 'Unauthorized',
          });
        }
      }, error => res.status(401).send({
        status: 'Unauthorized',
        message: error,
      }));
    } catch (e) {
      return res.status(500).send('Cannot delete table.');
    }

    apiTracker.log(appId, 'App / Table / Delete', req.url, sdk);
  }

  // create a table.
  app.put('/app/:appId/:tableName', isAppDisabled, (req, res) => {
    if (req.body && req.body.method == 'DELETE') {
      /** *************************DELETE***************************** */
      _deleteTable(req, res);
      /** *************************DELETE***************************** */
    } else {
      /** *************************UPDATE***************************** */

      const appId = req.params.appId;
      const tableName = req.params.tableName;
      const body = req.body || {};
      const sdk = req.body.sdk || 'REST';
      const appKey = req.body.key || req.params.key;

      if (config.mongoDisconnected) {
        return res.status(500).send('Storage / Cache Backend are temporarily down.');
      }

      // check if table already exists
      appService.getTable(appId, tableName).then((table) => {
        // authorize client for table level, if table found then authorize on table level else on app level for creating new table.
        const authorizationLevel = table ? 'table' : 'app';
        appService.isClientAuthorized(appId, appKey, authorizationLevel, table).then((isAuthorized) => {
          if (isAuthorized) {
            appService.upsertTable(appId, tableName, body.data.columns, body.data).then(table => res.status(200).send(table), err => res.status(500).send(err));
          } else {
            return res.status(401).send({
              status: 'Unauthorized',
            });
          }
        }, error => res.status(401).send({
          status: 'Unauthorized',
          message: error,
        }));
      }, err => res.status(500).send(err));

      apiTracker.log(appId, 'App / Table / Create', req.url, sdk);
    }
  });

  // get a table.
  app.post('/app/:appId/:tableName', isAppDisabled, _getTable);
  app.get('/app/:appId/:tableName', isAppDisabled, _getTable);

  // global.app.get('/app/:appId/:tableName', _getColumn);

  function _getTable(req, res) {
    const appId = req.params.appId;
    const tableName = req.params.tableName;
    const sdk = req.body.sdk || 'REST';
    const appKey = req.body.key || req.params.key;

    if (tableName === '_getAll') {
      // to get all tables authorize on app level;
      appService.isClientAuthorized(appId, appKey, 'app', null).then((isAuthorized) => {
        if (isAuthorized) {
          appService.getAllTables(appId).then(tables => res.status(200).send(tables), (err) => {
            winston.error({
              error: err,
            });
            return res.status(500).send('Error');
          });
        } else {
          return res.status(401).send({
            status: 'Unauthorized',
          });
        }
      }, error => res.status(401).send({
        status: 'Unauthorized',
        message: error,
      }));
    } else {
      appService.getTable(appId, tableName).then((table) => {
        // to get a tables authorize on table level;
        appService.isClientAuthorized(appId, appKey, 'table', table).then((isAuthorized) => {
          if (isAuthorized) {
            return res.status(200).send(table);
          } return res.status(401).send({
            status: 'Unauthorized',
          });
        }, error => res.status(401).send({
          status: 'Unauthorized',
          message: error,
        }));
      }, (err) => {
        winston.error({
          error: err,
        });
        return res.status(500).send('Error');
      });
    }

    apiTracker.log(appId, 'App / Table / Get', req.url, sdk);
  }

  // Export Database for :appID
  app.post('/backup/:appId/exportdb', (req, res) => {
    const appKey = req.body.key;
    const appId = req.params.appId;

    appService.isMasterKey(appId, appKey).then((isMasterKey) => {
      if (isMasterKey) {
        appService.exportDatabase(appId).then((data) => {
          res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename=dump${new Date()}.json`,
          });
          res.end(JSON.stringify(data));
        }, (err) => {
          winston.error({
            error: err,
          });
          res.status(500).send('Error');
        });
      } else {
        res.status(401).send({
          status: 'Unauthorized',
        });
      }
    }, (err) => {
      winston.error({
        error: err,
      });
      return res.status(500).send('Cannot retrieve security keys.');
    });
  });

  // Import Database for :appID
  app.post('/backup/:appId/importdb', (req, res) => {
    const appKey = req.body.key;
    const appId = req.params.appId;
    appService.isMasterKey(appId, appKey).then((isMasterKey) => {
      if (isMasterKey) {
        let file;
        if (req.files && req.files.file) {
          file = req.files.file.data;
        }
        if (file) {
          appService.importDatabase(appId, file).then((data) => {
            if (data) {
              res.status(200).json({
                Success: true,
              });
            } else {
              res.status(500).json({
                success: false,
              });
            }
          }, (err) => {
            winston.error({
              error: err,
            });
            res.status(500).send('Error');
          });
        }
      } else {
        res.status(401).send({
          status: 'Unauthorized',
        });
      }
    }, (err) => {
      winston.error({
        error: err,
      });
      return res.status(500).send('Cannot retrieve security keys.');
    });
  });

  // Export Table for :appID
  app.post('/export/:appId/:tableName', (req, res) => {
    const appKey = req.body.key;
    const appId = req.params.appId;
    const tableName = req.params.tableName;
    const exportType = req.body.exportType;
    const accessList = customHelper.getAccessList(req);
    if (!appKey) {
      res.status(400).send('key is missing');
    }
    if (!appId) {
      res.status(400).send('appId is missing');
    }
    if (!tableName) {
      res.status(400).send('tableName is missing');
    }
    if (!exportType) {
      res.status(400).send('exportType is missing');
    }
    appService.isMasterKey(appId, appKey).then((isMasterKey) => {
      otherService.exportTable(appId, tableName, exportType.toLowerCase(), isMasterKey, accessList).then((data) => {
        if (exportType.toLowerCase() === 'json') {
          res.status(200).json(data);
        } else {
          res.status(200).send(data);
        }
      }, (err) => {
        res.status(500).send(err);
      });
    }, (err) => {
      winston.error({
        error: err,
      });
      return res.status(500).send('Cannot retrieve security keys.');
    });
  });

  // Import Table for :appID
  app.post('/import/:appId', (req, res) => {
    const appKey = req.body.key;
    const appId = req.params.appId;
    const fileId = req.body.fileId;
    const tableName = req.body.tableName;
    const fileName = req.body.fileName;
    const fileExt = path.extname(fileName);

    if (!appKey) {
      return res.status(400).send('key is missing');
    }
    if (!appId) {
      return res.status(400).send('appId is missing');
    }
    if (!tableName) {
      return res.status(400).send('tableName is missing');
    }
    if (!fileId) {
      return res.status(400).send('fileId is missing');
    }
    if (fileExt != '.csv' && fileExt != '.json' && fileExt != '.xls' && fileExt != '.xlsx') {
      return res.status(400).send(`${fileExt} is not allowed`);
    }
    appService.isMasterKey(appId, appKey).then((isMasterKey) => {
      otherService.importTable(req, isMasterKey).then(result => res.status(200).json(result), error => res.status(500).send(error));
    }, () => res.status(500).send('Cannot retrieve security keys.'));
  });
};
