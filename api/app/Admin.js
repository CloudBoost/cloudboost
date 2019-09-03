/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
const winston = require('winston');
const config = require('../../config/config');
const appService = require('../../services/app');

module.exports = (app) => {
    // Change MasterKey/ClientKey
    app.put('/admin/:appId/clientkey', async (req, res) => {
        const { appId } = req.params;
        const { value } = req.body;

        if (config.secureKey === req.body.secureKey) {
            try {
                const response = await appService.changeAppClientKey(appId, value);
                return res.status(200).json(response);
            } catch (error) {
                winston.error(error);
                return res.status(500).send('Error');
            }
        } else {
            return res.status(401).send('Unauthorized');
        }
    });

    // Change MasterKey/ClientKey
    app.put('/admin/:appId/masterkey', async (req, res) => {
        const { appId } = req.params;
        const { value, secureKey } = req.body;

        if (config.secureKey === secureKey) {
            try {
                const responseJson = await appService.changeAppMasterKey(appId, value);
                return res.status(200).json(responseJson);
            } catch (error) {
                winston.error(error);
                return res.status(500).send('Error');
            }
        } else {
            return res.status(401).send('Unauthorized');
        }
    });

    /**
    * @description : Adds a user to its specefic database as a read/write admin
    * @param:
    * - Param appID : Database Name
    * - Param secureKey: Secure key of System
    * @return:
    * - Success : User data (username,password)
    * - Error : Error Data( 'Server Error' : status 500 )
    */
    app.post('/admin/dbaccess/enable/:appId', async (req, res) => {
        if (config.secureKey === req.body.secureKey) {
            try {
                const userData = await appService.createDatabaseUser(req.params.appId);
                return res.status(200).json({
                    user: userData,
                });
            } catch (error) {
                winston.error(error);
                return res.status(500).send('Error');
            }
        } else {
            return res.status(401).send('Unauthorized');
        }
    });
};
