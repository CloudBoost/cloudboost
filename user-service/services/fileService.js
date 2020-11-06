

const winston = require('winston');
const Q = require('q');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');

Grid.mongo = mongoose.mongo;
const gfs = new Grid(mongoose.connection.db);

module.exports = {
  putFile(file, filename, mimetype) {
    const deferred = Q.defer();

    try {
      // streaming to gridfs
      // filename to store in mongodb
      const writestream = gfs.createWriteStream({
        filename,
        mode: 'w',
        content_type: mimetype,
      });
      file.pipe(writestream);

      writestream.on('close', (_file) => {
        deferred.resolve(_file);
      });

      writestream.on('error', (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  getFileById(fileId) {
    const deferred = Q.defer();

    try {
      gfs.findOne({
        _id: fileId,
      }, (err, file) => {
        if (err) {
          return deferred.reject(err);
        }
        if (!file) {
          return deferred.reject(null);
        }

        return deferred.resolve(file);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  deleteFileById(fileId) {
    const deferred = Q.defer();

    try {
      gfs.exist({
        _id: fileId,
      }, (err, file) => {
        if (err) {
          return deferred.reject(err);
        }
        if (!file) {
          return deferred.reject(null);
        }
        return gfs.remove({
          _id: fileId,
        }, (err1) => {
          if (err) {
            return deferred.reject(err1);
          }

          return deferred.resolve('Success');
        });
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },
};
