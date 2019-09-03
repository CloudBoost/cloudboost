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

const getTable = async (req, res) => {
    const { appId, tableName } = req.params;
    const { sdk = 'REST' } = req.body;
    const appKey = req.body.key || req.params.key;

    apiTracker.log(appId, 'App / Table / Get', req.url, sdk);

    if (tableName === '_getAll') {
    // to get all tables authorize on app level;
        try {
            const isAuthorized = await appService.isClientAuthorized(appId, appKey, 'app', null);
            if (isAuthorized) {
                const tables = await appService.getAllTables(appId);
                return res.status(200).send(tables);
            }
            return res.status(401).send({
                status: 'Unauthorized',
            });
        } catch (error) {
            winston.error(error);
            return res.status(500).send({
                status: 'Server Error',
                message: error,
            });
        }
    } else {
        try {
            const table = await appService.getTable(appId, tableName);
            const isAuthorized = await appService.isClientAuthorized(appId, appKey, 'table', table);
            if (isAuthorized) {
                return res.status(200).send(table);
            }
            return res.status(401).send({
                status: 'Unauthorized',
            });
        } catch (error) {
            winston.error(error);
            return res.status(500).send('Error');
        }
    }
};

const deleteApp = async (req, res) => { // delete the app and all of its data.
    const { appId } = req.params;
    const body = req.body || {};
    const { sdk = 'REST', deleteReason, secureKey: parsedSecureKey } = body;
    apiTracker.log(appId, 'App / Delete', req.url, sdk);

    if (config.secureKey === parsedSecureKey) {
    // delete all code here.
        try {
            const deletedApp = await appService.deleteApp(appId, deleteReason);
            return res.status(200).json({
                status: 'Success',
                deletedApp,
            });
        } catch (error) {
            winston.error(error);
            return res.status(500).send({
                status: 'Error',
                error,
            });
        }
    } else {
        return res.status(401).send({
            status: 'Unauthorized',
        });
    }
};

const deleteTable = async (req, res) => { // delete the app and all of its data.
    const { appId, tableName } = req.params;
    const sdk = req.body.sdk || 'REST';
    const appKey = req.body.key || req.params.key;
    apiTracker.log(appId, 'App / Table / Delete', req.url, sdk);
    try {
    // this method is to delete a particular collection from an app.
        const isAuthorized = await appService.isClientAuthorized(appId, appKey, 'app', null);
        // to delete table authorize on app level
        if (isAuthorized) {
            const table = await appService.deleteTable(appId, tableName);
            return res.status(200).send(table);
        }
        return res.status(401).send({
            status: 'Unauthorized',
        });
    } catch (error) {
        winston.error(error);
        return res.status(500).send('Cannot delete table.');
    }
};

module.exports = (app) => {
    /**
   * @description Middleware used for zapier application auth using app ID and app secret key
   * @param {*} req
   * @param {Object} req.body
   * @param {String} req.body.appId
   * @param {String} req.body.appKey
   * @param {*} res
   */

    app.post('/app/token', async (req, res) => {
        const { appId, appKey } = req.body;
        try {
            const isValid = await appService.isMasterKey(appId, appKey);
            if (isValid) {
                const appData = appService.getApp(appId);
                if (appData) {
                    return res.status(200).json({
                        appName: appData.name,
                    });
                }
                return res.status(401).send('App not found');
            }
            return res.status(401).send('Invalid access keys provided');
        } catch (error) {
            winston.error(error);
            return res.status(401).send('Invalid keys');
        }
    });

    // create a new app.
    app.post('/app/:appId', async (req, res) => {
        const { appId } = req.params;
        const { sdk = 'REST', secureKey: parsedSecureKey } = req.body;
        try {
            apiTracker.log(appId, 'App / Create', req.url, sdk);
            if (config.secureKey === parsedSecureKey) {
                const appData = await appService.createApp(appId);
                await appService.createDefaultTables(appId);
                delete appData.keys.encryption_key;
                return res.status(200).send(appData);
            }
            return res.status(401).send('Unauthorized');
        } catch (error) {
            winston.error(error);
            return res.status(500).json({
                error,
            });
        }
    });

    // delete app.
    app.delete('/app/:appId', deleteApp);
    app.put('/app/:appId', deleteApp);

    // delete a table.
    app.delete('/app/:appId/:tableName', deleteTable);

    // create a table.
    app.put('/app/:appId/:tableName', isAppDisabled, async (req, res) => {
        if (req.body && req.body.method === 'DELETE') {
            /** *************************DELETE***************************** */
            return deleteTable(req, res);
            /** *************************DELETE***************************** */
        }
        /** *************************UPDATE***************************** */

        const { appId, tableName } = req.params;
        const body = req.body || {};
        const { sdk = 'REST' } = body;
        const appKey = body.key || req.params.key;
        apiTracker.log(appId, 'App / Table / Create', req.url, sdk);
        if (config.mongoDisconnected) {
            return res.status(500).send('Storage / Cache Backend are temporarily down.');
        }
        try {
            // check if table already exists
            const table = await appService.getTable(appId, tableName);
            /**
      * authorize client for table level,
      * if table found then authorize on table level
      * else on app level for creating new table.
      */
            const authorizationLevel = table ? 'table' : 'app';
            const isAuthorized = await appService.isClientAuthorized(appId,
                appKey,
                authorizationLevel,
                table);
            if (isAuthorized) {
                const updatedTable = await appService.upsertTable(appId,
                    tableName,
                    body.data.columns,
                    body.data);
                return res.status(200).send(updatedTable);
            }
            return res.status(401).send({
                status: 'Unauthorized',
            });
        } catch (error) {
            winston.error(error);
            return res.status(500).send(error);
        }
    });

    // get a table.
    app.post('/app/:appId/:tableName', isAppDisabled, getTable);
    app.get('/app/:appId/:tableName', isAppDisabled, getTable);

    // Export Database for :appID
    app.post('/backup/:appId/exportdb', async (req, res) => {
        const { key: appKey } = req.body;
        const { appId } = req.params;
        try {
            const isMasterKey = await appService.isMasterKey(appId, appKey);
            if (isMasterKey) {
                const exportData = await appService.exportDatabase(appId);
                res.writeHead(200, {
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': `attachment; filename=dump${new Date()}.json`,
                });
                res.end(JSON.stringify(exportData));
            } else {
                res.status(401).send({
                    status: 'Unauthorized',
                });
            }
        } catch (error) {
            winston.error(error);
            res.status(500).send('Error');
        }
    });

    // Import Database for :appID
    app.post('/backup/:appId/importdb', async (req, res) => {
        const { key: appKey } = req.body;
        const { appId } = req.params;
        try {
            const isMasterKey = await appService.isMasterKey(appId, appKey);
            if (isMasterKey) {
                const file = req.files && req.files.file ? req.files.file.data : null;
                if (file) {
                    const data = await appService.importDatabase(appId, file);
                    if (data) {
                        return res.status(200).json({
                            success: true,
                        });
                    }
                    return res.status(500).json({
                        success: false,
                    });
                }
                return res.status(401).send({
                    status: 'Unauthorized',
                });
            }
            return res.status(401).send({
                status: 'Unauthorized',
            });
        } catch (error) {
            winston.error(error);
            return res.status(500).send('Cannot retrieve security keys.');
        }
    });

    // Export Table for :appID
    app.post('/export/:appId/:tableName', async (req, res) => {
        const { key: appKey, exportType } = req.body;
        const { appId, tableName } = req.params;
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
        const expType = exportType.toLowerCase();
        try {
            const isMasterKey = await appService.isMasterKey(appId, appKey);
            const data = await otherService.exportTable(appId,
                tableName, expType, isMasterKey, accessList);
            if (expType === 'json') {
                return res.status(200).json(data);
            }
            return res.status(200).send(data);
        } catch (error) {
            winston.error(error);
            return res.status(500).send('Cannot retrieve security keys.');
        }
    });

    // Import Table for :appID
    app.post('/import/:appId', async (req, res) => {
        const {
            key: appKey,
            tableName,
            fileName,
            fileId,
        } = req.body;

        const { appId } = req.params;
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
        if (fileExt !== '.csv' && fileExt !== '.json' && fileExt !== '.xls' && fileExt !== '.xlsx') {
            return res.status(400).send(`${fileExt} is not allowed`);
        }
        try {
            const isMasterKey = await appService.isMasterKey(appId, appKey);
            const result = await otherService.importTable(req, isMasterKey);
            return res.status(200).json(result);
        } catch (error) {
            winston.error(error);
            return res.status(500).send(error);
        }
    });
};
