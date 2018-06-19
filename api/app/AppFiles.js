/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var mongoService = require('../../databases/mongo');

module.exports = function(app) {

    //get file from gridfs
    app.get('/appfile/:appId/icon', function(req, res) {

        

        var appId = req.params.appId;
        var fileName = appId;

        mongoService.document.getFile(appId, fileName).then(function(file) {
            if (!file) 
                res.send();

            var fileStream = mongoService.document.getFileStreamById(appId, file._id);
            res.set('Content-Type', file.contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');

            fileStream.on("error", function(err) {
                res.send(500, "Got error while processing stream " + err.message);
                res.end();
            });

            fileStream.on('end', function() {
                res.end();
            });

            fileStream.pipe(res);

        }, function(error) {
            return res.status(500).send(error);
        });

    });
};
