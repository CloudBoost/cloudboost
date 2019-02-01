/* eslint-disable */

/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const _ = require('underscore');
const crypto = require('crypto');
const winston = require('winston');
const util = require('../helpers/util.js');
const customHelper = require('../helpers/custom');
const type = require('../helpers/dataType');

const config = require('../config/config');
const mongoService = require('../databases/mongo');
const appService = require('./app');
const tableService = require('./table');

module.exports = {

  async find(appId, collectionName, query, select, sort, limit, skip, accessList, isMasterKey, opts) {
    const deferred = q.defer();

    try {
      if ((opts && opts.ignoreSchema) || (collectionName === '_File')) {
        const doc = await mongoService.document.find(appId, collectionName, query, select, sort, limit, skip, accessList, isMasterKey);
        deferred.resolve(doc);
      } else {
        const _query = await _modifyFieldsInQuery(appId, collectionName, query);
        const doc = await mongoService.document.find(appId, collectionName, _query, select, sort, limit, skip, accessList, isMasterKey);
        deferred.resolve(doc);
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
  async count(appId, collectionName, query, limit, skip, accessList, isMasterKey) {
    const deferred = q.defer();

    try {
      const _query = await _modifyFieldsInQuery(appId, collectionName, query);
      const doc = await mongoService.document.count(appId, collectionName, _query, limit, skip, accessList, isMasterKey);
      deferred.resolve(doc);
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },
  async distinct(appId, collectionName, onKey, query, select, sort, limit, skip, accessList, isMasterKey) {
    const deferred = q.defer();

    try {
      const _query = await _modifyFieldsInQuery(appId, collectionName, query);
      const doc = await mongoService.document.distinct(
        appId, collectionName, onKey, _query, select,
        sort, limit, skip, accessList, isMasterKey,
      );
      deferred.resolve(doc);
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

  async findOne(appId, collectionName, query, select, sort, skip, accessList, isMasterKey) {
    const deferred = q.defer();

    try {
      const _query = await _modifyFieldsInQuery(appId, collectionName, query);
      const doc = await mongoService.document.findOne(appId, collectionName, _query, select, sort, skip, accessList, isMasterKey);
      deferred.resolve(doc);
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

  async save(appId, collectionName, document, accessList, isMasterKey, opts, encryption_key) {
    const deferred = q.defer();

    try {
      const promises = [];
      const reqType = {};
      reqType.save = [];
      reqType.update = [];
      if (document.constructor === Array) {
        for (let i = 0; i < document.length; i++) {
          document[i] = _checkIdList(document[i], reqType);
          _generateId(document[i], reqType);

          promises.push(_save(appId, collectionName, document[i], accessList, isMasterKey, reqType, opts, encryption_key));
        }
        const res = await q.allSettled(promises)
          let status = true;
          const success = [];
          const error = [];
          for (let i = 0; i < res.length; i++) {
            if (res[i].status === 'fulfilled') {
              success.push(res[i].value);
              error.push(null);
            } else {
              status = false;
              error.push(res[i].value);
            }
          }

          if (status === true) {
            deferred.resolve(success);
          } else {
            deferred.resolve(error);
          }
      } else {
        const res = await _save(appId, collectionName, document, accessList, isMasterKey, null, opts, encryption_key);
        deferred.resolve(res);
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

  delete(appId, collectionName, document, accessList, isMasterKey) {
    const deferred = q.defer();

    try {
      const promises = [];
      if (document.constructor === Array) {
        for (let i = 0; i < document.length; i++) {
          promises.push(_delete(appId, collectionName, document[i], accessList, isMasterKey));
        }
        q.allSettled(promises).then((res) => {
          let status = true;
          const success = [];
          const error = [];
          for (let i = 0; i < res.length; i++) {
            if (res[i].status === 'fulfilled') {
              success.push(res[i].value);
              error.push(null);
            } else {
              status = false;
              error.push(res[i].value);
            }
          }
          if (status === true) {
            deferred.resolve(success);
          } else {
            deferred.resolve(error);
          }
        });
      } else {
        _delete(appId, collectionName, document, accessList, isMasterKey).then((res) => {
          deferred.resolve(res);
        }, (err) => {
          deferred.reject(err);
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
  createIndex(appId, collectionName, columnName) {
    const deferred = q.defer();

    try {
      mongoService.document.createIndex(appId, collectionName, columnName).then((doc) => {
        deferred.resolve(doc);
      }, (error) => {
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
};


async function _save(appId, collectionName, document, accessList, isMasterKey, reqType, opts, encryption_key) {
  const deferred = q.defer();
  try {
    const docToSave = document;

    const promises = [];
    // To keep track of documents whether the document is save or update, this keeps track by id document with value
    // as "save" or "update"
    let unModDoc = [];
    /* reqType keeps track of the collections which are for save and which are for update.
         * It stores the id of collections for save in save array and update in update array */
    if (!reqType) {
      reqType = {
        save: [],
        update: [],
      };

      document = _generateId(document, reqType);
    }
    const parentId = document._id;

    document = _getModifiedDocs(document, unModDoc);
    if (document && Object.keys(document).length > 0) {
      let listOfDocs = await customHelper.checkWriteAclAndUpdateVersion(appId, document, accessList, isMasterKey);
      let obj = _seperateDocs(listOfDocs);
      listOfDocs = obj.newDoc;
      obj = obj.oldDoc;
      const newListOfDocs = await _validateSchema(appId, listOfDocs, accessList, isMasterKey, encryption_key)
      const mongoDocs = newListOfDocs.map(doc => Object.assign({}, doc));

      promises.push(mongoService.document.save(appId, mongoDocs));
      q.allSettled(promises).then((array) => {
        if (array[0].state === 'fulfilled') {
          _sendNotification(appId, array[0], reqType);
          unModDoc = _merge(parentId, array[0].value, unModDoc);
          deferred.resolve(unModDoc);
        } else {
          _rollBack(appId, array, listOfDocs, obj).then((res) => {
            winston.log('error', res);
            deferred.reject('Unable to Save the document at this time');
          }, (err) => {
            winston.log('error', err);
            deferred.reject(err);
          });
        }
      });
    } else {
      deferred.resolve(docToSave);
    }
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }
  return deferred.promise;
}

function _delete(appId, collectionName, document, accessList, isMasterKey) {
  const deferred = q.defer();

  try {
    const promises = [];
    if (document._id) {
      customHelper.verifyWriteACLAndUpdateVersion(appId, collectionName, document, accessList, isMasterKey).then((doc) => {
        promises.push(mongoService.document.delete(appId, collectionName, document, accessList, isMasterKey));
        if (promises.length > 0) {
          q.allSettled(promises).then((res) => {
            if (res[0].state === 'fulfilled') {
              config.realTime.sendObjectNotification(appId, document, 'deleted');
              deferred.resolve(document);
            } else {
              _deleteRollback(appId, doc.oldDoc, res).then(() => {
                deferred.reject('Unable to Delete Document Right Now Try Again !!!');
              }, () => {
                deferred.reject('Unable to Delete');
              });
            }
          });
        }
      }, (err) => {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        deferred.reject('You do not have permission to delete the Object');
      });
    } else {
      deferred.reject('CanNot Delete an Unsaved Object');
    }
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }
  return deferred.promise;
}

async function _validateSchema(appId, listOfDocs, accessList, isMasterKey, encryption_key) {
  const deferred = q.defer();
  try {
    const promises = [];
    for (let i = 0; i < listOfDocs.length; i++) promises.push(_isSchemaValid(appId, listOfDocs[i]._tableName, listOfDocs[i], accessList, isMasterKey, encryption_key));
    const docs = await q.all(promises);
    deferred.resolve(docs);
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }
  return deferred.promise;
}

function _sendNotification(appId, res, reqType) {
  try {
    for (let i = 0; i < res.value.length; i++) {
      if (res.value[i].state === 'fulfilled') {
        if (reqType.save.indexOf(res.value[i].value._id) >= 0) {
          config.realTime.sendObjectNotification(appId, res.value[i].value, 'created');
        } else {
          config.realTime.sendObjectNotification(appId, res.value[i].value, 'updated');
        }
      }
    }
    return '';
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return null;
  }
}

async function _isSchemaValid(appId, collectionName, document, accessList, isMasterKey, encryption_key) {
  const mainPromise = q.defer();
  let columnNotFound = false;

  try {
    const promises = [];
    if (!document) {
      await mainPromise.reject('Document is undefined');
    }
    const modifiedDocuments = document._modifiedColumns;
    const table = await tableService.getSchema(appId, collectionName);
    const columns = table.columns;
      // check for required.
      if (!document._tableName || !document._type) {
        await mainPromise.reject('Not a type of table');
      }
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].name === 'id') continue; // ignore.

        if (document[columns[i].name] === undefined) {
          // TODO :  check type for defaultValue , convert to date of type is DateTime , quick patch , fix properly later
          if (columns[i].dataType === 'DateTime') {
            try {
              columns[i].defaultValue = new Date(columns[i].defaultValue);
            } catch (e) {
              columns[i].defaultValue = null;
            }
          }
          document[columns[i].name] = columns[i].defaultValue;
        }

        if (columns[i].dataType === 'File' && document[columns[i].name] && document[columns[i].name]._type && document[columns[i].name]._type === 'file' && !document[columns[i].name]._id) { // if url of the file is null, which means file is not saved. Remove the whole object.
          document[columns[i].name] = null;
        }

        // if column datatype is bool, and data is  null, change data to false by default.
        if (columns[i].dataType === 'Boolean' && !document[columns[i].name]) {
          document[columns[i].name] = false;
        }

        if (columns[i].required) {
          if (document[columns[i].name] === null || document[columns[i].name] === undefined) {
            await mainPromise.reject(`${columns[i].name} is required`);
          }
        }


        // Is Editable only by master key is true?
        if (columns[i].editableByMasterKey && modifiedDocuments.indexOf(columns[i].name) > -1) {
          if (!isMasterKey) {
            mainPromise.reject(`${columns[i].name} is only editable by Master Key.`);
            return mainPromise.promise;
          }
        }
        // This code encrypts the password in the documents. It shouldn't be here in validateSchema - Let's have it here for temp.
        if (columns[i].dataType === 'EncryptedText') {
          if (document[columns[i].name] && typeof document[columns[i].name] === 'string' && document._modifiedColumns.indexOf(columns[i].name) !== -1) {
            document[columns[i].name] = _encrypt(document[columns[i].name], encryption_key);
          }
        }
      }

      // check for unique.
      const query = {
        $or: [],
      };

      for (let i = 0; i < columns.length; i++) {
        if (columns[i].unique && document[columns[i].name] && modifiedDocuments.indexOf(columns[i].name) >= 0) {
          const temp = {};
          // relation unique check.
          if (columns[i].dataType === 'List' || columns[i].dataType === 'Object') continue;
          if (columns[i].dataType === 'Relation' && !document[columns[i].name]._id) // if relation and object is not saved.
          { continue; }
          if (columns[i].dataType === 'Relation' && document[columns[i].name]._id) { // if it is a relation and the object is saved before and has an id.
            temp[`${columns[i].name}._id`] = document[columns[i].name]._id;
          } else if (columns[i].dataType === 'File' && document[columns[i].name]._id) { // if it is a relation and the object is saved before and has an id.
            temp[`${columns[i].name}._id`] = document[columns[i].name]._id;
          } else {
            temp[columns[i].name] = document[columns[i].name];
          }
          query.$or.push(temp);
        }
      }
      if (query.$or.length > 0) {
        const findPromise = q.defer();
        promises.push(findPromise.promise);
        mongoService.document.find(appId, collectionName, query, null, null, 9999999, 0, null, true).then((res) => {
          if (res.length === 1 && res[0]._id === document._id) {
            findPromise.resolve('Update the document');
          } else if (res.length > 0) {
            findPromise.reject('Unique constraint violated.');
          } else {
            findPromise.resolve('Save the document');
          }
        }, (error) => {
          findPromise.reject(error);
        });
      }
      // check the schema here.
      for (const key in document) {
        if (modifiedDocuments.indexOf(key) >= 0) {
          if (key === '_tableName' || key === '_type' || key === '_version') continue; // check id; //ignore.
          else if (key === '_id') {
            // check if this is a string..
            if (typeof document[key] !== 'string') {
              await mainPromise.reject(`Invalid data in ID of type ${collectionName}. It should be of type string`);
            }
          } else {
            const col = _.first(_.where(columns, { name: key })); // get the column of this key.

            // if column does not exist create a new column
            if (!col) {
              columnNotFound = true;
              try {
                const detectedDataType = type.inferDataType(document[key]);
                const newCol = {
                  name: key,
                  _type: 'column',
                  dataType: detectedDataType,
                  defaultValue: null,
                  editableByMasterKey: false,
                  isDeletable: true,
                  isEditable: true,
                  isRenamable: false,
                  relatedTo: type.inferRelatedToType(detectedDataType, document[key]),
                  relationType: null,
                  required: false,
                  unique: false,
                };

                // push the new column to the old schema
                table.columns.push(newCol);
              } catch (err) {
                winston.log('error', {
                  error: String(err),
                  stack: new Error().stack,
                });
                mainPromise.reject(err);
              }
            } else {
              const datatype = col.dataType;
              if (_isBasicDataType(datatype)) {
                const res = _checkBasicDataTypes(document[key], datatype, key, collectionName); // check for basic datatypes
                if (res.message) {
                  await mainPromise.reject(res.message);
                }
                document[key] = res.data;
              }
              // Relation check.
              if (document[key] && datatype === 'Relation' && typeof document[key] !== 'object') {
                // data passed is id of the relatedObject
                const objectId = document[key];
                if (_validateObjectId(objectId)) {
                  document[key] = {};
                  document[key]._id = objectId;
                  document[key]._tableName = col.relatedTo;
                  document[key]._type = _getTableType(col.relatedTo);
                  continue;
                } else {
                  await mainPromise.reject(`Invalid data in column ${key}. It should be of type 'CloudObject' which belongs to table '${col.relatedTo}'`);
                }
              }
              if (document[key] && datatype === 'Relation' && typeof document[key] === 'object') {
                if (!document[key]._tableName) {
                  // tableName is not pasased in the object and is set explicitly
                  document[key]._tableName = col.relatedTo;
                }
                if (!document[key]._id && !document[key].id) {
                  await mainPromise.reject(`Invalid data in column ${key}. It should be of type 'CloudObject' which belongs to table '${col.relatedTo}'`);
                }
                document[key]._id = document[key]._id || document[key].id;
                delete document[key].id;

                if (!document[key]._type) {
                  document[key]._type = _getTableType(col.relatedTo);
                }
                if (document[key]._tableName === col.relatedTo) {
                  continue;
                } else {
                  await mainPromise.reject(`Invalid data in column ${key}. It should be of type 'CloudObject' which belongs to table '${col.relatedTo}'`);
                }
              }

              // / List check
              if (document[key] && datatype === 'List' && Object.prototype.toString.call(document[key]) !== '[object Array]') {
                // if it is a list.
                await mainPromise.reject(`Invalid data in column ${key}. It should be of type 'CloudObject' which belongs to table '${col.relatedTo}'`);
              }
              if (document[key] && datatype === 'List' && Object.prototype.toString.call(document[key]) === '[object Array]') {
                if (document[key].length !== 0) {
                  if (_isBasicDataType(col.relatedTo)) {
                    const res = _checkBasicDataTypes(document[key], col.relatedTo, key, document._tableName);
                    if (res.message) {
                      // if something is wrong.
                      await mainPromise.reject(res.message);
                    }
                    document[key] = res.data;
                  } else {
                    for (let i = 0; i < document[key].length; i++) {
                      if (document[key][i]._tableName) {
                        if (col.relatedTo !== document[key][i]._tableName) {
                          await mainPromise.reject(`Invalid data in column ${key}. It should be Array of 'CloudObjects' which belongs to table '${col.relatedTo}'.`);
                        }
                      } else {
                        await mainPromise.reject(`Invalid data in column ${key}. It should be Array of 'CloudObjects' which belongs to table '${col.relatedTo}'.`);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (columnNotFound) {
        // update the table schema
        const createNewColumnPromise = q.defer();
        const schemaCursor = config.mongoClient.db(appId).collection('_Schema');
        schemaCursor.findOneAndUpdate({
          name: document._tableName,
        }, {
          $set: table,
        }, {
          upsert: true,
          returnOriginal: false,
        }, (err, response) => {
          let table = null;
          if (response && response.value) table = response.value;

          if (err) {
            createNewColumnPromise.reject('Error : Failed to update the table with the new column. ');
          } else if (table) {
            createNewColumnPromise.resolve();
          }
        });

        promises.push(createNewColumnPromise.promise);
      }
      if (promises.length > 0) {
        // you have related documents or unique queries.
        q.all(promises).then(() => {
          const obj = {};
          obj.document = document;
          obj.schema = columns;
          mainPromise.resolve(obj);
        }, (error) => {
          mainPromise.reject(error);
        });
      } else {
        const obj = {};
        obj.document = document;
        obj.schema = columns;
        mainPromise.resolve(obj); // resolve this promise.
      }
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    mainPromise.reject(err);
  }

  return mainPromise.promise;
}

function _validateObjectId(objectId) {
  if (objectId.length === 8) return true;
  return false;
}

function _getTableType(tableName) {
  let tableType = 'custom';
  if (tableName === 'User') {
    tableType = 'user';
  } else if (tableName === 'Role') {
    tableType = 'role';
  } else if (tableName === 'Device') {
    tableType = 'device';
  } else if (tableName === '_File') {
    tableType = 'file';
  } else if (tableName === '_Event') {
    tableType = 'event';
  } else if (tableName === '_Funnel') {
    tableType = 'funnel';
  }
  return tableType;
}

function _checkBasicDataTypes(data, datatype, columnName, tableName) {
  try {
    if (Object.prototype.toString.call(data) === '[object Array]') {
      for (let i = 0; i < data.length; i++) {
        const res = _checkDataTypeUtil(data[i], datatype, columnName, tableName);

        if (!res.message) {
          data[i] = res.data;
        } else {
          return res;
        }
      }
    } else {
      return _checkDataTypeUtil(data, datatype, columnName, tableName);
    }
    const obj = {};
    obj.data = data;
    obj.message = null;

    return obj; // success!
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return null;
  }
}

function _checkDataTypeUtil(data, datatype, columnName, tableName) {
  try {
    const obj = {};
    obj.data = data;
    obj.message = null;
    let isValid = true;

    if (data && datatype === 'Number' && typeof data !== 'number') {
      isValid = false;
    }

    if (data && datatype === 'Text' && typeof data !== 'string') {
      isValid = false;
    }

    if (data && datatype === 'EncryptedText' && typeof data !== 'string') {
      isValid = false;
    }

    if (data && datatype === 'Email' && typeof data !== 'string') {
      isValid = false;
    }

    if (data && datatype === 'Email' && typeof data === 'string' && !util.isEmailValid(data)) {
      isValid = false;
    }

    if (data && datatype === 'URL' && typeof data !== 'string') {
      isValid = false;
    }

    if (data && datatype === 'URL' && typeof data === 'string' && !util.isUrlValid(data)) {
      isValid = false;
    }

    if (data && datatype === 'EncryptedText' && typeof data !== 'string') {
      isValid = false;
    }

    if (data && datatype === 'Boolean' && typeof data !== 'boolean') {
      isValid = false;
    }

    if (data && datatype === 'DateTime' && new Date(data).toString() === 'Invalid Date') {
      isValid = false;
    } else if (data && datatype === 'DateTime' && typeof data === 'string') {
      obj.data = new Date(data);
    }

    if (data && datatype === 'ACL' && typeof data !== 'object' && data.read && data.write) {
      isValid = false;
    }

    if (data && datatype === 'Object' && typeof data !== 'object') {
      isValid = false;
    }

    if (data && datatype === 'GeoPoint' && data._type !== 'point') {
      isValid = false;
    }

    if (data && datatype === 'GeoPoint' && data._type === 'point') {
      if ((Number(data.latitude) <= -90 || Number(data.latitude) >= 90) || (Number(data.longitude) <= -180 && Number(data.longitude) >= 180)) {
        isValid = false;
      }
    }

    if (data && datatype === 'File' && (data._type && data._type !== 'file')) {
      isValid = false;
    }

    if (!isValid) {
      obj.message = `Invalid data in column ${columnName} of table ${tableName}. It should be of type ${datatype}`;
    }

    return obj; // success!
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return null;
  }
}

function _isBasicDataType(dataType) {
  try {
    const types = [
      'Object',
      'ACL',
      'DateTime',
      'Boolean',
      'EncryptedText',
      'URL',
      'Email',
      'Text',
      'File',
      'Number',
      'GeoPoint',
    ];

    if (types.indexOf(dataType) > -1) {
      return true;
    }

    return false;
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
  }
}

function _generateId(document, reqType) {
  try {
    if (document._type) {
      if (!document._id) {
        let id;
        if (document._hash) {
          id = document._hash;
          delete document._hash;
        } else id = util.getId();
        document._id = id;
        reqType.save.push(id);
      } else {
        reqType.update.push(document._id);
      }
    }
    for (const key in document) {
      if (document[key]) {
        if (document[key].constructor === Array && document[key].length) {
          for (let i = 0; i < document[key].length; i++) {
            if (document[key][i]._tableName) {
              _generateId(document[key][i], reqType);
            }
          }
        }
        if (typeof document[key] === 'object' && document[key] != null) {
          if (document[key]._type) {
            _generateId(document[key], reqType);
          }
        }
      }
    }
    return document;
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return null;
  }
}

function _getModifiedDocs(document, unModDoc) {
  try {
    let modifiedDocument = [];
    /* check for isModified with id so as to ensure that if document is modified or it is created
            as a newly created document will have isModified as false */
    let doc = {};
    if (document._isModified) {
      const modifiedColumns = document._modifiedColumns;

      if (!document.createdAt) {
        document.createdAt = new Date();
        if (modifiedColumns.indexOf('createdAt') === -1) modifiedColumns.push('createdAt');
      }
      if (!document.expires) {
        document.expires = null;
        if (modifiedColumns.indexOf('expires') === -1) modifiedColumns.push('expires');
      }
      document.updatedAt = new Date();
      if (modifiedColumns.indexOf('updatedAt') === -1) {
        modifiedColumns.push('updatedAt');
      }
      modifiedColumns.push('_version');

      doc = {};

      for (var key in document) {
        // Push in the basic fields as they are not there in Modified Array
        if (key === '_id' || key === '_type' || key === '_tableName' || key === '_isModified' || key === '_modifiedColumns') {
          doc[key] = document[key];
          // Check if it is a List of Relation's if yes then just have the basic parameter's not all
        } else if (modifiedColumns.indexOf(key) >= 0) {
          if (document[key] !== null && document[key].constructor === Array && document[key].length > 0) {
            if (document[key][0]._type && document[key][0]._tableName) {
              var subDoc = [];

              // get the unique objects
              document[key] = _getUniqueObjects(document[key]);

              for (var i = 0; i < document[key].length; i++) {
                var temp = {};
                temp._type = document[key][i]._type;
                temp._tableName = document[key][i]._tableName;
                temp._id = document[key][i]._id;
                subDoc.push(temp);
              }
              doc[key] = subDoc;
            } else if (document[key][0]._type && document[key][0]._type === 'file') {
              var subDoc = [];
              for (var i = 0; i < document[key].length; i++) {
                var temp = {};
                temp._type = document[key][i]._type;
                temp._id = document[key][i]._id;
                subDoc.push(temp);
              }
              doc[key] = subDoc;
            } else {
              doc[key] = document[key];
            }
          } else if (document[key] !== null && document[key].constructor === Object) {
            if (document[key]._type && document[key]._tableName) {
              var subDoc = {};
              subDoc._type = document[key]._type;
              subDoc._tableName = document[key]._tableName;
              subDoc._id = document[key]._id;
              doc[key] = subDoc;
            } else if (document[key]._type && document[key]._type === 'file') {
              var subDoc = {};
              subDoc._type = document[key]._type;
              subDoc._id = document[key]._id;
              doc[key] = subDoc;
            } else {
              doc[key] = document[key];
            }
          } else {
            doc[key] = document[key];
          }
        }
      }

      delete document._modifiedColumns;
      document._isModified = false;
    } else {
      const unDoc = _stripChildDocs(document);
      unModDoc.push(unDoc);

      delete document._modifiedColumns;
      document._isModified = false;
    }
    if (doc) {
      if (Object.keys(doc).length > 0) modifiedDocument.push(doc);
    }
    for (var key in document) {
      if (document[key]) {
        if (document[key].constructor === Array && document[key].length > 0) {
          for (var i = 0; i < document[key].length; i++) {
            if (document[key][i]._type && document[key][i]._type !== 'point') { // geopoint has no modified array, so we skip passing that to the function.
              var subDoc = _getModifiedDocs(document[key][i], unModDoc);
              // concat, as the there can be subDocuments to subDocuments
              if (subDoc.length !== 0) modifiedDocument = modifiedDocument.concat(subDoc);
            }
          }
        }
        if (typeof document[key] === 'object' && document[key] != null) {
          if (document[key]._type && document[key]._type !== 'point') { // geopoint has no modified array, so we skip passing that to the function.
            var subDoc = _getModifiedDocs(document[key], unModDoc);
            if (subDoc.length !== 0) modifiedDocument = modifiedDocument.concat(subDoc);
          }
        }
      }
    }
    return modifiedDocument;
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return null;
  }
}

/* this function checks returns a document with all its sub-documents removed from it. In case of sub-documents
it leaves the basic values like id, tableName and type */
function _stripChildDocs(document) {
  try {
    const doc = {};
    for (const key in document) {
      if (document[key] !== null && document[key].constructor === Array && document[key].length > 0) {
        if (document[key][0]._type && document[key][0]._tableName) {
          var subDoc = [];
          for (let i = 0; i < document[key].length; i++) {
            const temp = {};
            temp._type = document[key][i]._type;
            temp._tableName = document[key][i]._tableName;
            temp._id = document[key][i]._id;
            subDoc.push(temp);
          }
          doc[key] = subDoc;
        } else {
          doc[key] = document[key];
        }
      } else if (document[key] !== null && document[key].constructor === Object) {
        if (document[key]._type && document[key]._tableName) {
          var subDoc = {};
          subDoc._type = document[key]._type;
          subDoc._tableName = document[key]._tableName;
          subDoc._id = document[key]._id;
          doc[key] = subDoc;
        } else {
          doc[key] = document[key];
        }
      } else {
        doc[key] = document[key];
      }
    }
    return doc;
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return null;
  }
}

function _deleteRollback(appId, document, res) {
  const deferred = q.defer();

  try {
    const promises = [];
    _getSchema(appId, document._tableName).then((schema) => {
      const docToSave = {};
      docToSave.document = document;
      docToSave.schema = schema;
      document = [];
      document.push(docToSave);

      if (res[0].state === 'fulfilled') {
        promises.push(mongoService.document.save(appId, document));
      }
      if (promises.length > 0) {
        q.all(promises).then(() => {
          deferred.resolve('Success');
        }, (err) => {
          deferred.reject(err);
        });
      }
    }, () => {
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
}

function _merge(collectionId, listOfDocs, unModDoc) {
  try {
    let document = {};
    for (var i = 0; i < listOfDocs.length; i++) {
      if (listOfDocs[i].value) {
        if (listOfDocs[i].value._id === collectionId) {
          document = listOfDocs[i].value;
          break;
        }
      }
    }
    if (Object.keys(document).length === 0) {
      for (var i = 0; i < unModDoc.length; i++) {
        if (unModDoc[i]) {
          if (unModDoc[i]._id === collectionId) {
            document = unModDoc[i];
            break;
          }
        }
      }
    }
    for (const key in document) {
      if (document[key]) {
        if (document[key] !== null && document[key].constructor === Array && document[key].length > 0) {
          if (document[key][0]._type) {
            for (var i = 0; i < document[key].length; i++) {
              for (var k = 0; k < listOfDocs.length; k++) {
                if (listOfDocs[k].value) {
                  if (listOfDocs[k].value._id === document[key][i]._id) {
                    document[key][i] = _merge(listOfDocs[k].value._id, listOfDocs, unModDoc);
                  }
                }
              }
              for (var k = 0; k < unModDoc.length; k++) {
                if (unModDoc[k]) if (unModDoc[k]._id === document[key][i]._id) document[key][i] = _merge(unModDoc[k]._id, listOfDocs, unModDoc);
              }
            }
          }
        } else if (document[key] !== null && document[key].constructor === Object) {
          if (document[key]._type) {
            for (var k = 0; k < listOfDocs.length; k++) {
              if (listOfDocs[k].value) if (listOfDocs[k].value._id === document[key]._id) document[key] = listOfDocs[k].value;
            }
            for (var k = 0; k < unModDoc.length; k++) {
              if (unModDoc[k]) if (unModDoc[k]._id === document[key]._id) document[key] = unModDoc[k];
            }
          }
        }
      }
    }
    return document;
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return null;
  }
}

// this function gets the schema of the table from the db.
function _getSchema(appId, collectionName) {
  const deferred = q.defer();

  try {
    tableService.getSchema(appId, collectionName).then((table) => {
      deferred.resolve(table.columns);
    }, (error) => {
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
}

// this function modifies the fields ['password','datetime']  passed in the Query.
function _modifyFieldsInQuery(appId, collectionName, query) {
  var deferred = q.defer();
  try {
      if (collectionName === '_File') {
          deferred.resolve(query);
      } else {
          _getSchema(appId, collectionName).then(function(columns) {
              var passwordColumnNames = [];
              var dateTimeColumnNames = [];

              // push in fields to be modified / i.e DateTime and Encypted fields
              for (var i = 0; i < columns.length; i++) {
                  if (columns[i].dataType === 'EncryptedText') {
                      passwordColumnNames.push(columns[i].name);
                  }
                  if (columns[i].dataType === 'DateTime') {
                      dateTimeColumnNames.push(columns[i].name);
                  }
              }

              //resolve if there are no password fields or DateTime fields
              if (passwordColumnNames.length === 0 && dateTimeColumnNames === 0) {
                  deferred.resolve(query);
              } else {
                  appService.getApp(appId).then(function (application) {
                      //or modify the query and resolve it.
                      if (passwordColumnNames.length)
                          query = _recursiveModifyQuery(query, passwordColumnNames, 'encrypt',application.keys.encryption_key);
                      if (dateTimeColumnNames.length)
                          query = _recursiveModifyQuery(query, dateTimeColumnNames, 'datetime',application.keys.encryption_key);
                      deferred.resolve(query);
                  }), function(){
                      deferred.reject("Cannot find an app wiht AppID "+appId);
                  };
              }
          }, function(error) {
              deferred.reject(error);
          });
      }
  } catch (err) {
      winston.log('error', {
          "error": String(err),
          "stack": new Error().stack
      });
      deferred.reject(err);
  }

  return deferred.promise;
}

function _encrypt(data, encryption_key) {
  try {
    const cipher_alg = 'aes-256-ctr';
    if (encryption_key && encryption_key.iv && encryption_key.key) {
      // to decrypt text use this
      // var encryptedText = encryptText(cipher_alg, encryption_key.key, encryption_key.iv, data);
      //
      return encryptText(cipher_alg, encryption_key.key, encryption_key.iv, data);
    }
    return crypto.pbkdf2Sync(data, config.secureKey, 10000, 64, 'sha1').toString('base64');
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return null;
  }
}

function _recursiveModifyQuery(query, columnNames, type, encryptionKey) {
  for (var key in query) {
      if (key === '$or') {
          for (var i = 0; i < query[key].length; i++) {
              query[key][i] = _recursiveModifyQuery(query[key][i], columnNames, type, encryptionKey);
          }
      }
  }
  return _.mapObject(query, function(val, key) {
      if (columnNames.indexOf(key) > -1) {
          if (typeof val !== 'object') {
              if (type === 'encrypt') {
                  return _encrypt(val, encryptionKey);
              }
          } else {
              // for datetime fields convert them to a fomat which mongodb can query
              if (type === 'datetime') {
                  try {
                      Object.keys(val).map(function(x) {
                          val[x] = new Date(val[x]);
                      });
                      return val;
                  } catch (e) {
                      return val;
                  }
              }
          }
      }
      return val;
  });
}

function _attachSchema(docsArray, oldDocs) {
  try {
    for (let i = 0; i < oldDocs.length; i++) {
      for (let j = 0; j < docsArray.length; j++) {
        if (oldDocs[i]._id === docsArray[j].document._id) {
          const obj = {};
          obj.document = oldDocs[i];
          obj.schema = docsArray[j].schema;
          oldDocs[i] = obj;
        }
      }
    }
    return oldDocs;
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return null;
  }
}

function _rollBack(appId, status, docsArray, oldDocs) {
  const deferred = q.defer();

  try {
    oldDocs = _attachSchema(docsArray, oldDocs);
    const promises = [];
    const arr = [];
    if (status[0].state === 'fulfilled') {
      if (oldDocs) promises.push(mongoService.document.save(appId, oldDocs));
      else {
        for (let i = 0; i < docsArray.length; i++) {
          promises.push(mongoService.delete(appId, docsArray[i]._tableName, docsArray[i]));
        }
      }
      arr.push('Mongo');
    }

    q.allSettled(promises).then((res) => {
      let status = true;
      for (let i = 0; i < res.length; i++) {
        if (res[i].state !== 'fulfilled') {
          status = false;
          deferred.reject();
          break;
        }
      }
      if (status === true) {
        deferred.resolve();
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
}

function _seperateDocs(listOfDocs) {
  try {
    const newDoc = [];
    const oldDoc = [];
    for (let i = 0; i < listOfDocs.length; i++) {
      if (listOfDocs[i].oldDoc) {
        oldDoc.push(listOfDocs[i].oldDoc);
      }
      newDoc.push(listOfDocs[i].newDoc);
    }
    const obj = {};
    obj.newDoc = newDoc;
    obj.oldDoc = oldDoc;
    return obj;
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return null;
  }
}

function _checkIdList(document, reqType) {
  try {
    let idList = reqType.save;
    idList = idList.concat(reqType.update);
    if (idList.indexOf(document._id) !== -1 || idList.indexOf(document._hash) !== -1) {
      if (document._isModified) {
        delete document._isModified;
        delete document._modifiedColumns;
      }
    } else {
      for (const key in document) {
        if (document[key]) {
          if (document[key].constructor === Array && document[key].length) {
            if (document[key][0]._tableName) {
              for (let i = 0; i < document[key].length; i++) document[key][i] = _checkIdList(document[key][i], reqType);
            }
          }
          if (typeof document[key] === 'object' && document[key] != null) {
            if (document[key]._type) {
              document[key] = _checkIdList(document[key], reqType);
            }
          }
        }
      }
    }
    return document;
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return null;
  }
}

/* Desc   : Filter and return unique objects
  Params : objectsList
  Returns: uniqueListObject
*/
function _getUniqueObjects(objectsList) {
  const uniqueListIds = [];
  let uniqueListObject = [];

  try {
    if (objectsList && objectsList.length > 0) {
      for (let i = 0; i < objectsList.length; ++i) {
        if (uniqueListIds.indexOf(objectsList[i]._id) < 0) {
          uniqueListIds.push(objectsList[i]._id);
          uniqueListObject.push(objectsList[i]);
        }
      }
    } else {
      uniqueListObject = objectsList;
    }

    return uniqueListObject;
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return uniqueListObject;
  }
}

// to encrypt data
function encryptText(cipher_alg, key, iv, text) {
  const cipher = crypto.createCipheriv(cipher_alg, key.toString('hex').slice(0, 32), iv.toString('hex').slice(0, 16));
  let result = cipher.update(text, 'utf8', 'hex');
  result += cipher.final('hex');
  return result;
}

// to decrypt data
// eslint-disable-next-line
function decryptText(cipher_alg, key, iv, text) {
  const decipher = crypto.createDecipheriv(cipher_alg, key.toString('hex').slice(0, 32), iv.toString('hex').slice(0, 16));
  let result = decipher.update(text, 'hex');
  result += decipher.final();
  return result;
}
