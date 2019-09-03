/* eslint global-require: 0 */
const _ = require('underscore');
const winston = require('winston');
const pjson = require('./package.json');
const cloudOjectApi = require('./api/tables/CloudObjects.js');
const cloudUserApi = require('./api/tables/CloudUser.js');
const cloudRoleApi = require('./api/tables/CloudRole.js');
const cloudAppApi = require('./api/app/App.js');
const cloudAdminApi = require('./api/app/Admin.js');
const appSettingsApi = require('./api/app/AppSettings.js');
const appFilesApi = require('./api/app/AppFiles');
const cloudFilesApi = require('./api/file/CloudFiles.js');
const serverApi = require('./api/server/Server.js');
const cloudEmailApi = require('./api/email/CloudEmail.js');
const pageApi = require('./api/pages/Page.js');
const authApi = require('./api/auth/Auth.js');
// const cronExpireApi = require('./cron/expire.js');

const appGet = app => app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        status: 200,
        version: pjson.version,
        message: "This is CloudBoost API. If you're looking for the dashboard. It should be running on port 1440.",
    }));
});

const appFilesGet = app => app.get('/getFile/:filename', (req, res) => { // for getting any file from resources/
    res.sendFile(`resources/${req.params.filename}`, {
        root: __dirname,
    });
});

const notFound = app => app.use((req, res) => {
    res.status(404).json({
        status: 404,
        message: 'The endpoint was not found. Please check again.',
    });
});

module.exports = (app) => {
    _.reduce([
        appGet,
        appFilesGet,
        cloudOjectApi,
        cloudUserApi,
        cloudRoleApi,
        cloudAppApi,
        cloudAdminApi,
        appSettingsApi,
        appFilesApi,
        cloudFilesApi,
        serverApi,
        cloudEmailApi,
        pageApi,
        authApi,
        notFound,
    ], (acc, fn) => {
        fn(acc);
        return acc;
    }, app);

    require('./cron/expire.js');
    winston.info('+++++++++++ API Status : OK ++++++++++++++++++');
};
