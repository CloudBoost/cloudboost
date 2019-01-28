var appService = require('../services/app');

module.exports = function (req, res, next) {
    var appId = req.params.appId;
    appService.getApp(appId).then(function(app){
        if(app.disabled){
            return res.status(401).json({
                message: 'App is disabled',
                type: 'error'
            });
        } else {
            return next();
        }
    });
};