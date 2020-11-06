/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const winston = require('winston');
const { MongoAdapter } = require('mongo-adapter');
const config = require('../../config/config');

module.exports = (app) => {
  // get file from gridfs
  app.get('/appfile/:appId/icon', async (req, res) => {
    const { appId } = req.params;
    const fileName = appId;

    try {
      const file = await MongoAdapter.getFile({
        client: config.mongoClient,
        appId,
        fileName,
      });

      if (!file) {
        return res.send();
      }
      // eslint-disable-next-line no-underscore-dangle
      const fileStream = MongoAdapter.getFileStreamById({
        client: config.mongoClient,
        appId,
        fileId: file._id,
      });

      res.set('Content-Type', file.contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.set('Content-Disposition', `attachment: filename="${file.filename}`);

      fileStream.on('error', (error) => {
        winston.error(error);
        res.send(500, `Got error while processing stream ${error.message}`);
        res.end();
      });

      fileStream.on('end', () => {
        res.end();
      });

      return fileStream.pipe(res);
    } catch (error) {
      winston.error(error);
      return res.status(500).send(error);
    }
  });
};
