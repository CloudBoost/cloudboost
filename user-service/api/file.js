
const url = require('url');
const Busboy = require('busboy');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const middlewares = require('../config/middlewares');

module.exports = function (app) {
  Grid.mongo = mongoose.mongo;
  const gfs = new Grid(mongoose.connection.db);

  // routes
  app.get('/file/:id', (req, res) => {
    const fileId = req.params.id;
    if (fileId) {
      return global.fileService.getFileById(fileId)
        .then((file) => {
          res.set('Content-Type', file.contentType);
          res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
          const readstream = gfs.createReadStream({
            _id: file._id,
          });

          readstream.on('error', (err) => {
            res.send(500, `Got error while processing stream ${err.message}`);
            res.end();
          });

          readstream.pipe(res);
        }, error => res.send(500, error));
    }
    return res.send(500, 'Found no file id in the url');
  });

  app.post('/file', middlewares.checkAuth, (req, res) => {
    const currentUserId = req.user.id;
    const serverUrl = fullUrl(req);
    let fileHolder;

    const busboy = new Busboy({
      headers: req.headers,
    });

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      global.userService.getAccountById(currentUserId).then((user) => {
        if (user && user.fileId) {
          global.fileService.deleteFileById(user.fileId);
        }
        return global.fileService.putFile(file, filename, mimetype);
      }).then((savedFile) => {
        fileHolder = savedFile;
        return global.userService.updateUserProfilePic(currentUserId, savedFile._id.toString());
      }).then(() => {
        // Wrapping for consistency in UI
        const fileObject = {};
        fileObject.id = fileHolder._id;
        fileObject.name = fileHolder.filename;
        fileObject.url = `${serverUrl}/file/${fileHolder._id.toString()}`;

        const wrapper = {};
        wrapper.document = fileObject;

        return res.status(200).send(wrapper);
      }, error => res.status(500).send(error));
    });

    req.pipe(busboy);
  });

  app.delete('/file/:id', middlewares.checkAuth, (req, res) => {
    const currentUserId = req.user.id;
    const fileId = req.params.id;

    if (currentUserId && fileId) {
      return global.fileService.deleteFileById(fileId)
        .then(() => global.userService.updateUserProfilePic(currentUserId, null))
        .then(() => res.status(200).send('Deleted Successfully'), error => res.send(500, error));
    }
    return res.status(401).send('unauthorized');
  });

  return app;
};

function fullUrl(req) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
  });
}
