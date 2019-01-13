/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const winston = require('winston');
const mongoService = require('../../databases/mongo');

module.exports = (app) => {
  // get file from gridfs
  app.get('/appfile/:appId/icon', async (req, res) => {
    const { appId } = req.params;
    const fileName = appId;

    try {
      const file = await mongoService.document.getFile(appId, fileName);
      if (!file) {
        return res.send();
      }
      // eslint-disable-next-line no-underscore-dangle
      const fileStream = mongoService.document.getFileStreamById(appId, file._id);
      res.set('Content-Type', file.contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.set('Content-Disposition', `attachment: filename="${file.filename}`);

      fileStream.on('error', (err) => {
        res.send(500, `Got error while processing stream ${err.message}`);
        res.end();
      });

      fileStream.on('end', () => {
        res.end();
      });

      return fileStream.pipe(res);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      return res.status(500).send(error);
    }
  });
};
