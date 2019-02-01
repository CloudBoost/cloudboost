/* eslint-disable no-redeclare, no-undef */
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

/* eslint no-use-before-define: 0, no-param-reassign: 0 */

const q = require('q');
const _ = require('underscore');
const Grid = require('gridfs-stream');
const winston = require('winston');

const mongodb = require('mongodb');
const config = require('../config/config');

const mongoUtil = require('../helpers/mongo');

const obj = {};

obj.document = {

  get(appId, collectionName, documentId, accessList, isMasterKey) { // returns the document that matches the _id with the documentId
    const _self = obj;

    const deferred = q.defer();
    try {
      _self.document.findOne(appId, collectionName, {
        _id: documentId,
      }, null, null, null, accessList, isMasterKey).then((doc) => {
        deferred.resolve(doc);
      }, (error) => {
        winston.log('error', error);
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

  _include(appId, include, docs) {
    // This function is for joins. :)
    const _self = obj;
    const join = [];
    const deferred = q.defer();
    try {
      // include and merge all the documents.
      const promises = [];
      include.sort();
      for (let i = 0; i < include.length; i++) {
        const [columnName] = include[i].split('.');
        join.push(columnName);
        for (let k = 1; k < include.length; k++) {
          if (columnName === include[k].split('.')[0]) {
            i += 1;
          } else {
            break;
          }
        }
        // include this column and merge.
        const idList = [];
        let collectionName = null;
        _.each(docs, (doc) => {
          if (doc[columnName] !== null) {
            // checks if the doc[columnName] is an list of relations or a relation
            if (Object.getPrototypeOf(doc[columnName]) === Object.prototype) {
              if (doc[columnName] && doc[columnName]._id) {
                if (doc[columnName]._type === 'file') {
                  collectionName = '_File';
                } else {
                  collectionName = doc[columnName]._tableName;
                }
                idList.push(doc[columnName]._id);
              }
            } else {
              for (let j = 0; j < doc[columnName].length; j++) {
                if (doc[columnName][j] && doc[columnName][j]._id) {
                  if (doc[columnName][j]._type === 'file') {
                    collectionName = '_File';
                  } else {
                    collectionName = doc[columnName][j]._tableName;
                  }
                  idList.push(doc[columnName][j]._id);
                }
              }
            }
          }
        }, null);

        // if(idList.length >0 && collectionName) {
        const qry = {};
        qry._id = {};
        qry._id.$in = idList;
        promises.push(_self.document.fetch_data(appId, collectionName, qry));
        // }
      }

      q.all(promises).then((arrayOfDocs) => {
        const pr = [];
        const rInclude = [];
        for (let i = 0; i < join.length; i++) {
          for (let k = 0; k < include.length; k++) {
            if (join[i] === include[k].split('.')[0]) rInclude.push(include[k]);
          }
          for (let k = 0; k < rInclude.length; k++) {
            rInclude[k] = rInclude[k].split('.').splice(1, 1).join('.');
          }
          for (let k = 0; k < rInclude.length; k++) {
            if (rInclude[k] === join[i] || rInclude[k] === '') {
              rInclude.splice(k, 1);
              k -= 1;
            }
          }
          if (rInclude.length > 0) {
            pr.push(_self.document._include(appId, rInclude, arrayOfDocs[i]));
          } else {
            const newPromise = q.defer();
            newPromise.resolve(arrayOfDocs[i]);
            pr.push(newPromise.promise);
          }
        }

        q.all(pr).then((_arrayOfDocs) => {
          for (let i = 0; i < docs.length; i++) {
            for (let j = 0; j < join.length; j++) {
              // if the doc contains an relation with a columnName.
              const relationalDoc = docs[i][join[j]];
              if (relationalDoc) {
                let rel = null;
                if (relationalDoc.constructor === Array) {
                  for (let m = 0; m < relationalDoc.length; m++) {
                    for (let k = 0; k < _arrayOfDocs[j].length; k++) {
                      if (_arrayOfDocs[j][k]._id.toString() === relationalDoc[m]._id.toString()) {
                        rel = _arrayOfDocs[j][k];
                        break;
                      }
                    }
                    if (rel) {
                      docs[i][include[j]][m] = rel;
                    }
                  }
                } else {
                  for (let k = 0; k < _arrayOfDocs[j].length; k++) {
                    if (_arrayOfDocs[j][k]._id.toString() === relationalDoc._id.toString()) {
                      rel = _arrayOfDocs[j][k];
                      break;
                    }
                  }

                  if (rel) {
                    docs[i][join[j]] = rel;
                  }
                }
              }
            }
          }

          docs = _deserialize(docs);
          deferred.resolve(docs);
        }, (error) => {
          winston.log('error', error);

          deferred.reject(error);
        });
      }, (error) => {
        winston.log('error', error);

        deferred.reject();
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

  fetch_data(appId, collectionName, qry) {
    const includeDeferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        includeDeferred.reject('Database Not Connected');
        return includeDeferred.promise;
      }

      if (!collectionName || !qry._id.$in) {
        includeDeferred.resolve([]);
        return includeDeferred.promise;
      }

      config.mongoClient.db(appId).collection(mongoUtil.collection.getId(appId, collectionName)).find(qry).toArray((err, includeDocs) => {
        if (err) {
          winston.log('error', err);
          includeDeferred.reject(err);
        } else {
          includeDeferred.resolve(includeDocs);
        }
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      includeDeferred.reject(err);
    }
    return includeDeferred.promise;
  },

  find(appId, collectionName, query, select, sort, limit, skip, accessList, isMasterKey) {
    const deferred = q.defer();
    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      const collection = config.mongoClient.db(appId).collection(mongoUtil.collection.getId(appId, collectionName));
      let include = [];
      /* query for expires */

      if (!query.$or) {
        query.$or = [
          {
            expires: null,
          }, {
            expires: {
              $gte: new Date(),
            },
          },
        ];
      } else {
        oldQuery = query.$or;
        if (oldQuery[0].$include) {
          if (oldQuery[0].$include.length > 0) {
            include = include.concat(oldQuery[0].$include);
          }
          delete oldQuery[0].$include;
          delete oldQuery[0].$includeList;
        }
        if (oldQuery[1]) {
          if (oldQuery[1].$include) {
            if (oldQuery[1].$include.length > 0) {
              include = include.concat(oldQuery[1].$include);
            }
            delete oldQuery[1].$include;
            delete oldQuery[1].$includeList;
          }
        }
        query.$and = [
          {
            $or: oldQuery,
          }, {
            $or: [
              {
                expires: null,
              }, {
                expires: {
                  $gte: new Date().getTime(),
                },
              },
            ],
          },
        ];
        delete query.$or;
      }

      if (!select || Object.keys(select).length === 0) {
        select = {};
      } else {
        // defult columns which should be selected.
        select.ACL = 1;
        select.createdAt = 1;
        select.updatedAt = 1;
        select._id = 1;
        select._tableName = 1;
        select._type = 1;
        select.expires = 1;
      }

      if (!sort) {
        sort = {};
      }
      // default sort added
      /*
        without sort if limit and skip are used,
        the records are returned out of order.
        To solve this default sort in ascending order of 'createdAt' is added
      */

      if (!sort.createdAt) sort.createdAt = 1;

      if (!limit || limit === -1) limit = 20;

      if (!isMasterKey) {
        // if its not master key then apply ACL.
        if (accessList.userId) {
          const aclQuery = [
            {
              $or: [
                {
                  'ACL.read.allow.user': 'all',
                }, {
                  'ACL.read.allow.user': accessList.userId,
                }, {
                  'ACL.read.allow.role': {
                    $in: accessList.roles,
                  },
                },
              ],
            }, {
              $and: [
                {
                  'ACL.read.deny.user': {
                    $ne: accessList.userId,
                  },
                }, {
                  'ACL.read.deny.role': {
                    $nin: accessList.roles,
                  },
                },
              ],
            },
          ];
          if (query.$and) query.$and.push({ $and: aclQuery });
          else query.$and = aclQuery;
        } else {
          query['ACL.read.allow.user'] = 'all';
        }
      }

      // check for include.
      if (query.$include) {
        if (query.$include.length > 0) {
          include = include.concat(query.$include);
        }
      }

      // delete $include and $includeList recursively
      query = _sanitizeQuery(query);

      let findQuery = collection.find(query).project(select);

      if (Object.keys(sort).length > 0) {
        findQuery = findQuery.sort(sort);
      }

      if (skip) {
        if (Object.keys(sort).length === 0) { // default sort it in desc order on createdAt
          findQuery = findQuery.sort({ createdAt: -1 });
        }
        findQuery = findQuery.skip(skip);
      }

      findQuery = findQuery.limit(limit);

      findQuery.toArray().then((docs) => {
        if (!include || include.length === 0) {
          docs = _deserialize(docs);
          deferred.resolve(docs);
        } else {
          obj.document._include(appId, include, docs)
            .then(deferred.resolve, deferred.reject);
        }
      }).catch(deferred.reject);
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  findOne(appId, collectionName, query, select, sort, skip, accessList, isMasterKey) {
    const mainPromise = q.defer();

    try {
      if (config.mongoDisconnected) {
        mainPromise.reject('Database Not Connected');
        return mainPromise.promise;
      }

      obj.document.find(appId, collectionName, query, select, sort, 1, skip, accessList, isMasterKey).then((list) => {
        if (Object.prototype.toString.call(list) === '[object Array]') {
          if (list.length === 0) {
            mainPromise.resolve(null);
          } else {
            mainPromise.resolve(list[0]);
          }
        }
      }, (error) => {
        winston.log('error', error);
        mainPromise.reject(null);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      mainPromise.reject(err);
    }

    return mainPromise.promise;
  },

  save(appId, documentArray) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      const promises = [];

      for (let i = 0; i < documentArray.length; i++) {
        promises.push(_save(appId, documentArray[i].document._tableName, documentArray[i].document));
      }
      q.allSettled(promises).then((docs) => {
        deferred.resolve(docs);
      }, (err) => {
        winston.log('error', err);
        deferred.reject(err);
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

  _update(appId, collectionName, document) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }


      const collection = config.mongoClient.db(appId).collection(mongoUtil.collection.getId(appId, collectionName));


      const documentId = document._id;

      const query = {};
      query._id = documentId;
      collection.update({
        _id: documentId,
      }, document, {
        upsert: true,
      }, (err, list) => {
        if (err) {
          winston.log('error', err);
          deferred.reject(err);
        } else if (list) {
          deferred.resolve(document);
        }
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

  count(appId, collectionName, query, limit, skip) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      if (skip) {
        skip = parseInt(skip, 10);
      }

      const collection = config.mongoClient.db(appId).collection(mongoUtil.collection.getId(appId, collectionName));

      // delete $include and $includeList recursively
      query = _sanitizeQuery(query);

      let findQuery = collection.find(query);
      if (skip) {
        findQuery = findQuery.skip(skip);
      }

      findQuery.count(query, (err, count) => {
        if (err) {
          winston.log('error', err);
          deferred.reject(err);
        } else {
          deferred.resolve(count);
        }
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

  distinct(appId, collectionName, onKey, query, select, sort, limit, skip) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      const collection = config.mongoClient.db(appId).collection(mongoUtil.collection.getId(appId, collectionName));

      let include = [];

      if (query.$include) {
        if (query.$include.length > 0) {
          include = include.concat(query.$include);
        }
      }

      // delete $include and $includeList recursively
      query = _sanitizeQuery(query);

      const keys = {};
      const indexForDot = onKey.indexOf('.');

      // if DOT in onKey
      //  keys = { beforeDot: { afterDot : "$beforeDot.afterDot"} }
      // else
      //  keys = { onKey : "$"+onKey }
      if (indexForDot !== -1) {
        // not using computed properties as it may not be available in server's nodejs version
        keys[onKey.slice(0, indexForDot)] = { };
        keys[onKey.slice(0, indexForDot)][onKey.slice(indexForDot + 1)] = `$${onKey}`;
      } else keys[onKey] = `$${onKey}`;

      if (!sort || Object.keys(sort).length === 0) sort = { createdAt: 1 };

      if (!query || Object.keys(query).length === 0) {
        query = {
          _id: {
            $exists: true,
          },
        };
      }

      const pipeline = [];
      pipeline.push({ $match: query });
      pipeline.push({ $sort: sort });

      // push the distinct aggregation.
      pipeline.push({
        $group: {
          _id: keys,
          document: {
            $first: '$$ROOT',
          },
        },
      });

      if (skip && skip !== 0) {
        pipeline.push({ $skip: skip });
      }

      if (limit && limit !== 0) {
        pipeline.push({ $limit: limit });
      }

      if (select && Object.keys(select).length > 0) {
        pipeline.push({
          $project: {
            document: select,
          },
        });
      }

      collection.aggregate(pipeline, (err, cursor) => {
        if (err) {
          deferred.reject(err);
        } else {
          let docs = [];
          cursor.toArray().then((res) => {
            // filter out
            for (let i = 0; i < res.length; i++) {
              docs.push(res[i].document);
            }
            // include.
            obj.document._include(appId, include, docs).then((docList) => {
              docs = _deserialize(docList);
              deferred.resolve(docs);
            }, (error) => {
              winston.log('error', {
                error: String(error),
                stack: new Error().stack,
              });
              deferred.reject(error);
            });
          }).catch((error) => {
            winston.log('error', {
              error: String(error),
              stack: new Error().stack,
            });
            deferred.reject(error);
          });
        }
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

  aggregate(appId, collectionName, pipeline, limit, skip, accessList, isMasterKey) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      const collection = config.mongoClient.db(appId).collection(mongoUtil.collection.getId(appId, collectionName));

      let query = {};
      if (pipeline.length > 0 && pipeline[0] && pipeline[0].$match) {
        query = pipeline[0].$match;
        pipeline.shift(); // remove first element.
      }

      if (!isMasterKey) {
        // if its not master key then apply ACL.
        if (accessList.userId) {
          const aclQuery = [
            {
              $or: [
                {
                  'ACL.read.allow.user': 'all',
                }, {
                  'ACL.read.allow.user': accessList.userId,
                }, {
                  'ACL.read.allow.role': {
                    $in: accessList.roles,
                  },
                },
              ],
            }, {
              $and: [
                {
                  'ACL.read.deny.user': {
                    $ne: accessList.userId,
                  },
                }, {
                  'ACL.read.deny.role': {
                    $nin: accessList.roles,
                  },
                },
              ],
            },
          ];
          if (query.$and) query.$and.push({ $and: aclQuery });
          else query.$and = aclQuery;
        } else {
          query['ACL.read.allow.user'] = 'all';
        }
      }

      if (!query.$or) {
        query.$or = [
          {
            expires: null,
          }, {
            expires: {
              $gte: new Date(),
            },
          },
        ];
      }

      pipeline.unshift({ $match: query }); // add item to the begining of the pipeline.

      if (skip && skip !== 0) {
        pipeline.push({ $skip: skip });
      }

      if (limit && limit !== 0) {
        pipeline.push({ $limit: limit });
      }

      collection.aggregate(pipeline, (err, res) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(res);
        }
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

  _insert(appId, collectionName, document) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      const collection = config.mongoClient.db(appId).collection(mongoUtil.collection.getId(appId, collectionName));

      collection.save(document, (err, doc) => {
        if (err) {
          winston.log('error', err);
          deferred.reject(err);
        } else {
          // elastic search code.
          document = doc;


          deferred.resolve(document);
        }
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

  delete(appId, collectionName, document) {
    const documentId = document._id;
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      if (!document._id) {
        deferred.reject('You cant delete an unsaved object');
      } else {
        const collection = config.mongoClient.db(appId).collection(mongoUtil.collection.getId(appId, collectionName));
        const query = {
          _id: documentId,
        };

        collection.remove(query, {
          w: 1, // returns the number of documents removed
        }, (err, doc) => {
          if (err || doc.result.n === 0) {
            if (doc.result.n === 0) {
              err = {
                code: 401,
                message: 'You do not have permission to delete',
              };
              winston.log('error', err);
              deferred.reject(err);
            }
          }
          if (err) {
            winston.log('error', err);
            deferred.reject(err);
          } else if (doc.result.n !== 0) {
            deferred.resolve(doc.result);
          } else {
            deferred.reject({ code: 500, message: 'Server Error' });
          }
        });
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  deleteByQuery(appId, collectionName, query) {
    const deferred = q.defer();

    try {
      if (config.mongoDisconnected) {
        deferred.reject('Database Not Connected');
        return deferred.promise;
      }

      const collection = config.mongoClient.db(appId).collection(mongoUtil.collection.getId(appId, collectionName));

      collection.remove(query, {
        w: 1, // returns the number of documents removed
      }, (err, doc) => {
        if (err) {
          winston.log('error', err);
          deferred.reject(err);
        }
        deferred.resolve(doc.result);
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
  /** ********************GRIDFS FILES************************************************************** */

  /* Desc   : Get file from gridfs
      Params : appId,filename
      Returns: Promise
               Resolve->file
               Reject->Error on findOne() or file not found(null)
    */
  getFile(appId, filename) {
    const deferred = q.defer();

    try {
      config.mongoClient.db(appId).collection('fs.files').findOne({
        filename,
      }, (err, file) => {
        if (err) {
          deferred.reject(err);
        }
        if (!file) {
          deferred.resolve(null);
        }
        deferred.resolve(file);
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
  /* Desc   : Get fileStream from gridfs
      Params : appId,fileId
      Returns: fileStream
    */
  getFileStreamById(appId, fileId) {
    try {
      const gfs = Grid(config.mongoClient.db(appId), mongodb);
      const readstream = gfs.createReadStream({ _id: fileId });
      return readstream;
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      return null;
    }
  },
  /* Desc   : Delete file from gridfs
      Params : appId,filename
      Returns: Promise
               Resolve->true
               Reject->Error on exist() or remove() or file does not exists
    */
  async deleteFileFromGridFs(appId, filename) {
    const deferred = q.defer();
    try {
      const found = await config.mongoClient.db(appId).collection('fs.files').findOne({
        filename,
      });
      if (found) {
        const id = found._id;
        config.mongoClient.db(appId).collection('fs').deleteMany({
          _id: id,
        }, (err) => {
          if (err) {
            // Unable to delete
            deferred.reject(err);
          } else {
            // Deleted
            deferred.resolve(true);
          }
          return deferred.resolve('Success');
        });
      } else {
        deferred.reject('File does not exist');
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },
  /* Desc   : Save filestream to gridfs
      Params : appId,fileStream,fileName,contentType
      Returns: Promise
               Resolve->fileObject
               Reject->Error on writing file
    */
  saveFileStream(appId, fileStream, fileName, contentType) {
    const deferred = q.defer();
    try {
      const bucket = new mongodb.GridFSBucket(config.mongoClient.db(appId));
      const writeStream = bucket.openUploadStream(fileName, {
        contentType,
        w: 1,
      });
      fileStream.pipe(writeStream)
        .on('error', (err) => {
          deferred.reject(err);
          writeStream.destroy();
        })
        .on('finish', (file) => {
          deferred.resolve(file);
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
  /** ********************END OF GRIDFS FILES************************************************************** */
};

module.exports = obj;

/* Private functions */

function _sanitizeQuery(query) {
  if (query && query.$includeList) {
    delete query.$includeList;
  }

  if (query && query.$include) {
    delete query.$include;
  }

  if (query && query.$or && query.$or.length > 0) {
    for (let i = 0; i < query.$or.length; ++i) {
      query.$or[i] = _sanitizeQuery(query.$or[i]);
    }
  }

  if (query && query.$and && query.$and.length > 0) {
    for (let i = 0; i < query.$and.length; ++i) {
      query.$and[i] = _sanitizeQuery(query.$and[i]);
    }
  }

  return query;
}

function _save(appId, collectionName, document) {
  const deferredMain = q.defer();
  try {
    if (document._isModified) {
      delete document._isModified;
    }
    if (document._modifiedColumns) {
      delete document._modifiedColumns;
    }
    document = _serialize(document);
    // column key array to track sub documents.
    obj.document._update(appId, collectionName, document).then((doc) => {
      doc = _deserialize(doc);
      deferredMain.resolve(doc);
    }, (err) => {
      winston.log('error', err);
      deferredMain.reject(err);
    });
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }
  return deferredMain.promise;
}

function _serialize(document) {
  try {
    Object.keys(document).forEach((key) => {
      if (document[key]) {
        if (document[key].constructor === Object && document[key]._type) {
          if (document[key]._type === 'point') {
            const _obj = {};
            _obj.type = 'Point';
            _obj.coordinates = document[key].coordinates;
            document[key] = _obj;
          }
        }

        if (key === 'createdAt' || key === 'updatedAt' || key === 'expires') {
          if (typeof document[key] === 'string') {
            document[key] = new Date(document[key]);
          }
        }
      }
    });
    return document;
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    throw err;
  }
}
function _deserialize(docs) {
  try {
    if (docs.length > 0) {
      for (let i = 0; i < docs.length; i++) {
        const document = docs[i];
        const docKeys = Object.keys(document);
        for (let j = 0; j < docKeys.length; j++) {
          const key = docKeys[j];
          if (document[key]) {
            if (document[key].constructor === Object && document[key].type) {
              if (document[key].type === 'Point') {
                const _obj = {};
                _obj._type = 'point';
                _obj.coordinates = document[key].coordinates;
                _obj.latitude = _obj.coordinates[1]; // eslint-disable-line
                _obj.longitude = _obj.coordinates[0]; // eslint-disable-line
                document[key] = _obj;
              }
            } else if (document[key].constructor === Array
              && document[key][0]
              && document[key][0].type
              && document[key][0].type === 'Point') {
              const arr = [];
              for (let k = 0; k < document[key].length; k++) {
                const _obk = {};
                _obk._type = 'point';
                _obk.coordinates = document[key][k].coordinates;
                _obk.latitude = _obk.coordinates[1]; // eslint-disable-line
                _obk.longitude = _obk.coordinates[0]; // eslint-disable-line
                arr.push(_obk);
              }
              document[key] = arr;
            }
          }
        }
        docs[i] = document;
      }
    } else {
      const document = docs;
      const docKeys = Object.keys(document);
      for (let k = 0; k < docKeys.length; k++) {
        const key = docKeys[k];
        if (document[key]) {
          if (document[key].constructor === Object && document[key].type) {
            if (document[key].type === 'Point') {
              const _obj = {};
              _obj._type = 'point';
              _obj.coordinates = document[key].coordinates;
              _obj.latitude = _obj.coordinates[1]; // eslint-disable-line
              _obj.longitude = _obj.coordinates[0]; // eslint-disable-line
              document[key] = _obj;
            }
          } else if (document[key].constructor === Array
            && document[key][0]
            && document[key][0].type
            && document[key][0].type === 'Point') {
            const arr = [];
            for (let j = 0; j < document[key].length; j++) {
              const _obj = {};
              _obj._type = 'point';
              _obj.coordinates = document[key][j].coordinates;
              _obj.latitude = _obj.coordinates[1]; // eslint-disable-line
              _obj.longitude = _obj.coordinates[0]; // eslint-disable-line
              arr.push(_obj);
            }
            document[key] = arr;
          }
        }
      }
      docs = document;
    }
    return docs;
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    throw err;
  }
}
