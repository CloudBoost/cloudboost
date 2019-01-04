/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const mongoService = require('../../databases/mongo');

module.exports = function (app) {
  // get file from gridfs
  app.get('/appfile/:appId/icon', (req, res) => {
    const appId = req.params.appId;
    const fileName = appId;

    mongoService.document.getFile(appId, fileName).then((file) => {
      if (!file) res.send();

      const fileStream = mongoService.document.getFileStreamById(appId, file._id);
      res.set('Content-Type', file.contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.set('Content-Disposition', `attachment; filename="${file.filename}"`);

      fileStream.on('error', (err) => {
        res.send(500, `Got error while processing stream ${err.message}`);
        res.end();
      });

      fileStream.on('end', () => {
        res.end();
      });

      fileStream.pipe(res);
    }, error => res.status(500).send(error));
  });
};
