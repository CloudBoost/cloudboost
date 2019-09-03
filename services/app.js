/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

/* eslint no-use-before-define: 0 */
const q = require('q');
const crypto = require('crypto');
const uuid = require('uuid');
const _ = require('underscore');
const winston = require('winston');

const util = require('../helpers/util.js');
const tablesData = require('../helpers/cloudTable');
const config = require('../config/config');

const mongoUtil = require('../helpers/mongo');
const mongoService = require('../databases/mongo');

module.exports = {
  /* Desc   : Update Settings
      Params : appId,categoryName,SettingsObject
      Returns: Promise
               Resolve->saved Settings Object
               Reject->Error on findOne() or failed to update
    */
  async updateSettings(appId, category, settings) {
    const deferred = q.defer();

    try {
      const doc = await mongoService.document.findOne(
        appId, config.globalSettings, {
          category,
        },
        null, null, 0, null, true,
      );
      const document = doc || {};
      if (!doc) {
        document._id = util.getId();
        document.category = category;
      }
      document.settings = settings;
      document._tableName = config.globalSettings;
      const documents = await mongoService.document.save(appId, [{
        document,
      }]);
      deferred.resolve(documents[0].value);
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  /* Desc   : get Settings
      Params : appId
      Returns: Promise
               Resolve->Array of Setting JSON Objects
               Reject->Error on find
    */
  async getAllSettings(appId) {
    const deferred = q.defer();

    try {
      // check redis cache first.
      const documents = await mongoService.document.find(
        appId, config.globalSettings, {}, null, null,
        9999, 0, null, true,
      );
      deferred.resolve(documents);
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },

  async getApp(appId) {
    const deferred = q.defer();

    try {
      // check redis cache first.
      const cached = await config.redisClient.get(`${config.cacheAppPrefix}:${appId}`);
      if (cached) {
        const response = JSON.parse(cached);
        deferred.resolve(response);
      } else {
        // if not found in cache then hit the Db.
        const collection = config.mongoClient.db(config.globalDb).collection('projects');
        const docs = await collection.find({
          appId,
        }).toArray();
        if (!docs || docs.length === 0) {
          deferred.reject('App Not found');
        } else {
          config.redisClient.setex(
            `${config.cacheAppPrefix}:${appId}`,
            config.appExpirationTimeFromCache,
            JSON.stringify(docs[0]),
          );
          deferred.resolve(docs[0]);
        }
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

  async getAppList() {
    const deferred = q.defer();

    try {
      const collection = config.mongoClient.db(config.globalDb).collection('projects');
      const docs = await collection.find({}).toArray();
      deferred.resolve(docs);
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  async createApp(appId) {
    const deferred = q.defer();
    try {
      const collection = config.mongoClient.db(config.globalDb).collection('projects');
      const projects = await collection.find({
        appId,
      }).toArray();
      if (projects.length > 0) {
        deferred.reject('AppID already exists');
      } else {
        const document = {};
        document.appId = appId;
        document.keys = {};
        document.keys.js = _generateKey();
        document.keys.master = _generateKey();
        document.keys.encryption_key = await getKeyAndIV();

        const project = await collection.insertOne(document);
        if (project) {
          // create a mongodb app
          await mongoUtil.app.create(appId);
          deferred.resolve(document);
        } else {
          deferred.reject('');
        }
      }
    } catch (e) {
      winston.log('error', {
        error: String(e),
        stack: new Error().stack,
      });

      deferred.reject('Cannot create an app right now.');
    }

    return deferred.promise;
  },

  async deleteApp(appId, _deleteReason) {
    const deferred = q.defer();
    const deleteReason = _deleteReason || 'userInitiatedDeleteFromDashboard'; // eslint-disable-line

    try {
      const collection = config.mongoClient.db(config.globalDb).collection('projects');
      await collection.deleteOne({
        appId,
      });
      config.redisClient.del(`${config.cacheAppPrefix}:${appId}`); // delete the app from redis.
      // delete  the app databases.
      await mongoUtil.app.drop(appId);
      deferred.resolve();
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    // delete app from cache
    return deferred.promise;
  },

  async getTable(appId, tableName) {
    const deferred = q.defer();

    try {
      const collection = config.mongoClient.db(appId).collection('_Schema');
      const table = await collection.findOne({
        name: tableName,
      });

      if (table) {
        deferred.resolve(table);
      } else {
        deferred.resolve(null);
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

  async getAllTables(appId) {
    const deferred = q.defer();

    try {
      const collection = config.mongoClient.db(appId).collection('_Schema');
      const tables = await collection.find({}).toArray();
      if (tables.length > 0) {
        // filtering out private '_Tables'
        const publictTables = tables.filter(table => table.name[0] !== '_');

        deferred.resolve(publictTables);
      } else {
        deferred.resolve([]);
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

  async deleteTable(appId, tableName) {
    const deferred = q.defer();

    try {
      const collection = config.mongoClient.db(appId).collection('_Schema');
      const doc = await collection.deleteOne({
        name: tableName,
      }, {
        w: 1, // returns the number of documents removed
      });
      if (doc.result.n === 0) {
        const err = {
          code: 401,
          message: 'You do not have permission to delete',
        };
        throw err;
      }
      if (doc.result.n !== 0) {
        // send a post request to DataServices.
        // delete table from cache.
        config.redisClient.del(`${config.cacheSchemaPrefix}-${appId}:${tableName}`);
        // delete this from all the databases as well.
        // call
        await mongoUtil.collection.dropCollection(appId, tableName);
        deferred.resolve(doc);
      } else {
        const err = {
          code: 500,
          message: 'Server Error',
        };
        throw err;
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

  async deleteColumn(appId, collectionName, columnName, columnType) {
    const deferred = q.defer();

    try {
      await mongoUtil.collection.dropColumn(
        appId, collectionName, columnName, columnType,
      );
      deferred.resolve('Success');
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  async isMasterKey(appId, key) {
    const deferred = q.defer();

    try {
      const _self = this;
      const project = await _self.getApp(appId);
      const masterKey = util.getNestedValue('keys.master', project);
      if (masterKey === key) {
        deferred.resolve(true);
      } else {
        deferred.resolve(false);
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

  async isKeyValid(appId, key) {
    const deferred = q.defer();

    try {
      const _self = this;
      const project = await _self.getApp(appId);
      const masterKey = util.getNestedValue(['keys', 'master'], project);
      const clientKey = util.getNestedValue(['keys', 'js'], project);
      if (masterKey === key || clientKey === key) {
        deferred.resolve(true);
      } else {
        deferred.resolve(false);
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject('Error in getting key');
    }

    return deferred.promise;
  },

  async isClientAuthorized(appId, appKey, level, table) {
    const deferred = q.defer();
    const self = this;
    try {
      const isValidKey = await self.isKeyValid(appId, appKey);
      const isMasterKey = await self.isMasterKey(appId, appKey);
      if (isValidKey && isMasterKey) {
        deferred.resolve(true);
        // else check with client keys acc to auth level
        // levels = table level or app level
        // for app level check in app settings , for table level check in table schema
      } else if (level === 'table' && table) {
        deferred.resolve(!!table.isEditableByClientKey);
      } else {
        const settings = await self.getAllSettings(appId);
        if (settings) {
          // check for clientkey flag in genral settings
          const {
            settings: generalSetting,
          } = _.pick(
            _.first(_.where(settings, {
              category: 'general',
            })),
            'settings',
          );
          if (generalSetting) {
            deferred.resolve(!!generalSetting.isTableEditableByClientKey);
          } else deferred.resolve(false);
        } else deferred.resolve(false);
      }
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      deferred.reject(error);
    }

    return deferred.promise;
  },

  async upsertTable(appId, tableName, schema, _tableProps) {
    const deferred = q.defer();
    const tableProps = _tableProps || {
      isEditableByClientKey: false,
    };
    const updateColumnNameOfOldRecordsPromises = [];
    const self = this;
    let isNewTable = false;
    let tableType = null;

    try {
      if (!tableName) {
        throw 'Table name is empty';
      }

      if (typeof (tableName) !== 'string') {
        throw 'Table name is not a string.';
      }

      // get the type of a table.
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
      } else {
        tableType = 'custom';
      }

      // duplicate column value verification
      const errorDetails = _checkDuplicateColumns(schema);
      if (errorDetails) {
        throw errorDetails;
      }

      // dataType check.
      const defaultDataType = _getDefaultColumnWithDataType(tableType);
      const valid = _checkValidDataType(schema, defaultDataType, tableType);
      if (!valid) {
        throw 'Error : Invalid DataType Found.';
      }

      const collection = config.mongoClient.db(appId).collection('_Schema');
      let table = await collection.findOne({
        name: tableName,
      });
      const oldColumns = table && table.columns;
      if (table) {
        const errorType = _checkSchemaType({
          schema,
          table,
          tableType,
        });

        if (errorType) throw errorType;
        const newColumns = schema
          .filter(column => !column._id)
          .map((column) => {
            const _column = _.clone(column);
            _column._id = util.getId();
            return _column;
          });

        table.columns = schema.filter(col => col._id).concat(newColumns);
        // update table props
        table.isEditableByClientKey = !!tableProps.isEditableByClientKey;
      } else {
        isNewTable = true;

        table = {};
        table.id = util.getId();
        table.columns = schema.map((column) => {
          const _column = _.clone(column);
          _column._id = util.getId();
          return _column;
        });

        table.name = tableName;
        table.type = tableType;
        table._type = 'table';
        table.isEditableByClientKey = !!tableProps.isEditableByClientKey;
      }

      const renameColumnObject = {};
      if (!isNewTable) {
        const doc = await collection.findOne({
          name: tableName,
        });
        if (!doc) {
          throw 'Error : Failed to get the table. ';
        } else {
          doc.columns.forEach((oldColumnObj) => {
            // check column id
            schema.forEach((newColumnObj) => {
              // match column id of each columns
              if (newColumnObj._id === oldColumnObj._id) {
                if (newColumnObj.name !== oldColumnObj.name) {
                  // column name is updated update previous records.
                  renameColumnObject[oldColumnObj.name] = newColumnObj.name;
                }
              }
            });
          });
          if (!_.isEmpty(renameColumnObject)) {
            updateColumnNameOfOldRecordsPromises.push(
              _updateColumnNameOfOldRecords(tableName, appId, renameColumnObject),
            );
          }
        }
      }

      const response = await collection.findOneAndUpdate({
        name: tableName,
      }, {
        $set: table,
      }, {
        upsert: true,
        returnOriginal: false,
      });

      if (response && response.value) table = response.value;
      if (table) {
        // clear the cache.
        config.redisClient.del(`${config.cacheSchemaPrefix}-${appId}:${tableName}`);

        const cloneOldColumns = [].concat(oldColumns || []);

        if (isNewTable) {
          const mongoPromise = mongoUtil.collection.create(appId, tableName, schema);
          // Index all text fields
          const mongoIndexTextPromise = mongoUtil.collection.deleteAndCreateTextIndexes(
            appId, tableName, cloneOldColumns, schema,
          );
          await q.allSettled([mongoPromise, mongoIndexTextPromise]);
          deferred.resolve(table);
        } else if (oldColumns) {
          // check if any column is deleted, if yes.. then delete it from everywhere.
          const promises = [];

          const columnsToDelete = _getColumnsToDelete(oldColumns, schema);

          for (let i = 0; i < columnsToDelete.length; i++) {
            promises.push(self.deleteColumn(
              appId, tableName, columnsToDelete[i].name,
              columnsToDelete[i].dataType,
            ));
          }

          const columnsToAdd = _getColumnsToAdd(oldColumns, schema);

          for (let i = 0; i < columnsToAdd.length; i++) {
            promises.push(self.createColumn(appId, tableName, columnsToAdd[i]));
          }

          // Index all text fields
          promises.push(
            mongoUtil.collection.deleteAndCreateTextIndexes(
              appId, tableName, cloneOldColumns, schema,
            ),
          );
          // updateColumnNameOfOldRecordsPromises stores the promises for updating previous records.
          await q.all(promises.concat(updateColumnNameOfOldRecordsPromises));
          await q.all(updateColumnNameOfOldRecordsPromises);
          deferred.resolve(table);
        } else throw 'Error creating/updating table';
      } else throw 'Error creating/updating table';
    } catch (e) {
      winston.log('error', {
        error: String(e),
        stack: new Error().stack,
      });
      deferred.reject(e);
    }

    return deferred.promise;
  },

  async createColumn(appId, collectionName, column) {
    const deferred = q.defer();

    try {
      await mongoUtil.collection.addColumn(appId, collectionName, column);
      deferred.resolve('Success');
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  createDefaultTables(appId) {
    const appService = this;
    return q.all([
      appService.upsertTable(appId, 'Role', tablesData.Role),
      appService.upsertTable(appId, 'Device', tablesData.Device),
      appService.upsertTable(appId, 'User', tablesData.User),
      appService.upsertTable(appId, '_File', tablesData._File),
      appService.upsertTable(appId, '_Event', tablesData._Event),
      appService.upsertTable(appId, '_Funnel', tablesData._Funnel),
    ]);
  },

  async getSchema(appId, collectionName) {
    const deferred = q.defer();
    const appService = this;

    try {
      const res = await config.redisClient.get(`${config.cacheSchemaPrefix}-${appId}:${collectionName}`);
      if (res) {
        deferred.resolve(JSON.parse(res));
      } else {
        const collection = config.mongoClient.db(appId).collection('_Schema');
        const foundTable = await collection.findOne({
          name: collectionName,
        });
        if (!foundTable) {
          // No table found. Create new table
          const defaultSchema = tablesData.Custom;
          const newTable = await appService.upsertTable(appId, collectionName, defaultSchema);
          config.redisClient.setex(
            `${config.cacheSchemaPrefix}-${appId}:${collectionName}`,
            config.schemaExpirationTimeFromCache,
            JSON.stringify(newTable._doc),
          );
          deferred.resolve(newTable);
        } else {
          config.redisClient.setex(
            `${config.cacheSchemaPrefix}-${appId}:${collectionName}`,
            config.schemaExpirationTimeFromCache,
            JSON.stringify(foundTable._doc),
          );
          deferred.resolve(foundTable);
        }
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

  async changeAppClientKey(appId, value) {
    const deferred = q.defer();

    try {
      const query = {
        appId,
      };

      const newClientkey = value || _generateKey();
      const setJSON = {
        'keys.js': newClientkey,
      };

      const collection = config.mongoClient.db(config.globalDb).collection('projects');
      const newDoc = await collection.findOneAndUpdate(query, {
        $set: setJSON,
      }, {
        returnOriginal: false,
      });
      if (newDoc) {
        // delete project/app from redis so further request will make a new entry with new keys
        deleteAppFromRedis(appId);
        deferred.resolve(newDoc.value);
      } else {
        deferred.resolve(null);
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

  async changeAppMasterKey(appId, value) {
    const deferred = q.defer();

    try {
      const query = {
        appId,
      };

      const newMasterkey = value || _generateKey();

      const setJSON = {
        'keys.master': newMasterkey,
      };

      const collection = config.mongoClient.db(config.globalDb).collection('projects');
      const newDoc = await collection.findOneAndUpdate(query, {
        $set: setJSON,
      }, {
        returnOriginal: false,
      });

      if (newDoc) {
        // delete project/app from redis so further request will make a new entry with new keys
        deleteAppFromRedis(appId);
        deferred.resolve(newDoc.value);
      } else {
        deferred.resolve(null);
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

  async exportDatabase(appId) {
    const deferred = q.defer();

    try {
      const collections = await config.mongoClient.db(appId).listCollections().toArray();
      const promises = collections.map(async (collection) => {
        try {
          const _collection = Object.assign({}, collection);
          const data = await config.mongoClient.db(appId)
            .collection(collection.name).find().toArray();
          _collection.documents = data;
          return _collection;
        } catch (error) {
          throw error;
        }
      });
      const exportData = await q.all(promises);
      deferred.resolve(exportData);
    } catch (error) {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
      deferred.reject(error);
    }

    return deferred.promise;
  },

  async importDatabase(appId, file) {
    let fileArray;
    const deferred = q.defer();

    try {
      fileArray = JSON.parse(file.toString());
      const validated = !_.isEmpty(_.where(fileArray, { name: '_Schema' }));
      if (!validated) {
        throw 'Invalid CloudBoost Database file';
      }
      const collections = await config.mongoClient.db(appId).listCollections().toArray();
      const collectionRemovePromises = collections
        .filter(col => col.name.split('.')[0] !== 'system') // skipping delete for system namespaces
        .map(col => config.mongoClient.db(appId).collection(col.name).remove());
      await q.all(collectionRemovePromises);
      const createDocumentsPromise = fileArray.map(async (fileDoc) => {
        try {
          // eslint-disable-next-line
          const newCollection = await config.mongoClient.db(appId).createCollection(fileDoc.name);
          const collection = config.mongoClient.db(appId).collection(fileDoc.name);
          const documents = fileDoc.documents.length
            ? await collection.insertMany(fileDoc.documents)
            : [];
          return documents;
        } catch (error) {
          throw error;
        }
      });
      const newDocuments = await q.all(createDocumentsPromise);
      deferred.resolve(newDocuments);
    } catch (e) {
      deferred.reject(e);
    }
    return deferred.promise;
  },

  createDatabaseUser(appId) {
    const deferred = q.defer();

    const username = util.getId();
    const password = util.getId();

    config.mongoClient.db(appId).addUser(username, password, {
      roles: [{
        role: 'readWrite',
        db: appId,
      }],
    }, (err) => {
      if (err) deferred.reject(err);
      else {
        deferred.resolve({
          username,
          password,
        });
      }
    });
    return deferred.promise;
  },
};

function _updateColumnNameOfOldRecords(tableName, appId, renameColumnObject) {
  const deferred = q.defer();

  const collection = config.mongoClient.db(appId).collection(tableName);
  collection.updateMany({}, {
    $rename: renameColumnObject,
  }, (err) => {
    if (err) deferred.reject(err);
    else deferred.resolve();
  });

  return deferred.promise;
}

function _generateKey() {
  try {
    return uuid.v4();
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    return null;
  }
}

// check for duplicate column
function _checkDuplicateColumns(columns) {
  try {
    const { length } = columns;
    const columnNames = _.pluck(columns, 'name');

    // check for null names.
    for (let i = 0; i < columnNames.length; i++) {
      if (columnNames[i].indexOf(' ') > -1) {
        return `Column ${columnNames[i]} cannot contain any spaces.`;
      }

      if (columnNames[i].length === 0) {
        return 'Column in the table has an empty name.';
      }
    }

    const uniqColumns = _.uniq(columns, item => item.name);

    if (length !== uniqColumns.length) return 'Column with the same name found in the table';

    return null;
  } catch (e) {
    winston.log('error', {
      error: String(e),
      stack: new Error().stack,
    });
    return 'Error';
  }
}

function _getDefaultColumnList(type) {
  try {
    const defaultColumn = ['id', 'expires', 'createdAt', 'updatedAt', 'ACL'];

    if (type === 'user') {
      defaultColumn.concat(['username', 'email', 'password', 'roles']);
    } else if (type === 'role') {
      defaultColumn.push('name');
    } else if (type === 'device') {
      defaultColumn.concat(['channels', 'deviceToken', 'deviceOS', 'timezone', 'metadata']);
    } else if (type === 'file') {
      defaultColumn.concat(['name', 'contentType', 'path', 'url', 'size']);
    } else if (type === 'event') {
      defaultColumn.concat(['user', 'type', 'name', 'data']);
    } else if (type === 'funnel') {
      defaultColumn.concat(['name', 'data']);
    }
    return defaultColumn;
  } catch (e) {
    winston.log('error', {
      error: String(e),
      stack: new Error().stack,
    });
    return null;
  }
}

function _checkValidDataType(columns, defaultDataType, tableType) {
  try {
    let index;
    const defaultColumns = [];
    if (columns.length <= 0) {
      return false;
    }

    const coloumnDataType = _.filter(_.pluck(columns, 'dataType'), Boolean);
    const defaultDataTypeKeys = Object.keys(defaultDataType);
    for (let i = 0; i < defaultDataTypeKeys.length; i++) {
      const key = defaultDataTypeKeys[i];
      index = coloumnDataType.indexOf(defaultDataType[key]);
      if (index < 0) return false;

      for (let l = 0; l < columns.length; l++) {
        if (columns[l].name === key) {
          index = l;
          l = columns.length;
        }
      }

      if (key === 'id') {
        if (columns[index].relationType !== null
          || columns[index].required !== true
          || columns[index].unique !== true
          || columns[index].dataType !== 'Id') return false;
      }

      // createdAt for every table
      if (key === 'createdAt') {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== false
        || columns[index].dataType !== 'DateTime') return false;
      }

      // updatedAt for every table
      if (key === 'updatedAt') {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== false
        || columns[index].dataType !== 'DateTime') return false;
      }

      // ACL for every table
      if (key === 'ACL') {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== false
        || columns[index].dataType !== 'ACL') return false;
      }

      // username for user table
      if (key === 'username') {
        if (columns[index].relationType !== null
        || columns[index].required !== false
        || columns[index].unique !== true
        || columns[index].dataType !== 'Text') return false;
      }

      // email for user table
      if (key === 'email') {
        if (columns[index].relationType !== null
        || columns[index].required !== false
        || columns[index].unique !== true
        || columns[index].dataType !== 'Email') return false;
      }

      // password for user table
      if (key === 'password') {
        if (columns[index].relationType !== null
        || columns[index].required !== false
        || columns[index].unique !== false
        || columns[index].dataType !== 'EncryptedText') return false;
      }

      // roles property for user table
      if (key === 'roles') {
        if (columns[index].relationType !== 'table'
        || columns[index].required !== false
        || columns[index].unique !== false
        || columns[index].dataType !== 'List'
        || columns[index].relatedTo !== 'Role') return false;
      }

      // socialAuth property for user table
      if (key === 'socialAuth') {
        if (columns[index].required !== false
        || columns[index].unique !== false
        || columns[index].dataType !== 'List'
        || columns[index].relatedTo !== 'Object') return false;
      }

      // verified for user table
      if (key === 'verified') {
        if (columns[index].relationType !== null
        || columns[index].required !== false
        || columns[index].unique !== false
        || columns[index].dataType !== 'Boolean') return false;
      }

      // name for role table
      if (key === 'name' && tableType === 'role') {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== true
        || columns[index].dataType !== 'Text') return false;
      }

      // name for file table
      if (key === 'name' && tableType === 'file') {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== false
        || columns[index].dataType !== 'Text') return false;
      }
      // name for event table
      if (key === 'name' && (tableType === 'event' || tableType === 'funnel')) {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== false
        || columns[index].dataType !== 'Text') return false;
      }

      // channels for device table
      if (key === 'channels') {
        if (columns[index].relationType !== null
        || columns[index].required !== false
        || columns[index].unique !== false
        || columns[index].dataType !== 'List') return false;
      }
      // deviceToken for device table
      if (key === 'deviceToken') {
        if (columns[index].relationType !== null
        || columns[index].required !== false
        || columns[index].unique !== true
        || columns[index].dataType !== 'Text') return false;
      }
      // deviceOS for device table
      if (key === 'deviceOS') {
        if (columns[index].relationType !== null
        || columns[index].required !== false
        || columns[index].unique !== false
        || columns[index].dataType !== 'Text') return false;
      }
      // timezone for device table
      if (key === 'timezone') {
        if (columns[index].relationType !== null
        || columns[index].required !== false
        || columns[index].unique !== false
        || columns[index].dataType !== 'Text') return false;
      }
      // metadata for device table
      if (key === 'metadata') {
        if (columns[index].relationType !== null
        || columns[index].required !== false
        || columns[index].unique !== false
        || columns[index].dataType !== 'Object') return false;
      }

      if (key === 'size') {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== false
        || columns[index].dataType !== 'Number') return false;
      }
      // url for file table
      if (key === 'url') {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== true
        || columns[index].dataType !== 'URL') return false;
      }
      // path for file table
      if (key === 'path') {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== false
        || columns[index].dataType !== 'Text') return false;
      }
      // contentType for file table
      if (key === 'contentType') {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== false
        || columns[index].dataType !== 'Text') return false;
      }

      // user for event table
      if (key === 'user') {
        if (columns[index].relationType !== null
        || columns[index].required !== false
        || columns[index].unique !== false
        || columns[index].dataType !== 'Relation') return false;
      }

      // type for event table
      if (key === 'type') {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== false
        || columns[index].dataType !== 'Text') return false;
      }

      // type for event table
      if (key === 'type') {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== false
        || columns[index].dataType !== 'Text') return false;
      }

      // data for event table
      if (key === 'data') {
        if (columns[index].relationType !== null
        || columns[index].required !== true
        || columns[index].unique !== false
        || columns[index].dataType !== 'Object') return false;
      }

      if (columns[index].isRenamable !== false
      || columns[index].isEditable !== false
      || columns[index].isDeletable !== false) {
        return false;
      }

      defaultColumns.push(key);
    } // end of for-loop

    // check for userdefined column & its properties
    const validDataTypeForUser = [
      'Text',
      'Email',
      'URL',
      'Number',
      'Boolean',
      'EncryptedText',
      'DateTime',
      'GeoPoint',
      'File',
      'List',
      'Relation',
      'Object',
    ];

    for (let i = 0; i < columns.length; i++) {
      if (defaultColumns.indexOf(columns[i].name) < 0) {
        index = validDataTypeForUser.indexOf(columns[i].dataType);

        if (index < 0) return false;

        if (columns[i].dataType === 'List' || columns[i].dataType === 'Relation') {
          if (!columns[i].relatedTo) return false;
        }

        if (typeof columns[i].defaultValue === 'string') {
          if (columns[i].dataType === 'URL') {
            const re = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
            if (columns[i].defaultValue.match(re)[0] !== columns[i].defaultValue) {
              return false;
            }
          } else if (columns[i].dataType === 'Email') {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
            if (columns[i].defaultValue.match(re)[0] !== columns[i].defaultValue) {
              /* if the set dataType is not other string Datatypes (Text,
              EncryptedText, DateTime) available in cloudboost;
              */
              return false;
            }
          } else if (['Text', 'EncryptedText', 'DateTime'].indexOf(columns[i].dataType) === -1) {
            return false;
          }
        } else if (columns[i].defaultValue === null) {
          // Do nothing
        } else if (['number', 'boolean', 'object'].indexOf(typeof columns[i].defaultValue) > -1) {
          /* TODO : Doing a quick fix
            for undefined default Value -> should be fixed later.
           */
          // eslint-disable-next-line
          if (columns[i].dataType.toUpperCase() !== (typeof columns[i].defaultValue).toUpperCase()) {
            return false;
          }
        }
      }
    }

    return true;
  } catch (e) {
    winston.log('error', {
      error: String(e),
      stack: new Error().stack,
    });
    return null;
  }
}

function _getColumnsToDelete(oldColumns, newColumns) {
  try {
    const originalColumns = oldColumns;

    for (let i = 0; i < newColumns.length; i++) {
      const column = _.first(_.where(originalColumns, {
        name: newColumns[i].name,
      }));
      originalColumns.splice(originalColumns.indexOf(column), 1);
    }

    return originalColumns;
  } catch (e) {
    winston.log('error', {
      error: String(e),
      stack: new Error().stack,
    });
    return null;
  }
}

function _getColumnsToAdd(oldColumns, newColumns) {
  try {
    const originalColumns = oldColumns;

    const addedColumns = [];

    for (let i = 0; i < newColumns.length; i++) {
      const column = _.first(_.where(originalColumns, {
        name: newColumns[i].name,
      }));
      if (!column) {
        addedColumns.push(newColumns[i]);
      }
    }
    return addedColumns;
  } catch (e) {
    winston.log('error', {
      error: String(e),
      stack: new Error().stack,
    });
    return null;
  }
}

function _getDefaultColumnWithDataType(type) {
  try {
    const defaultColumn = {};
    defaultColumn.id = 'Id';
    defaultColumn.createdAt = 'DateTime';
    defaultColumn.updatedAt = 'DateTime';
    defaultColumn.ACL = 'ACL';
    defaultColumn.expires = 'DateTime';

    if (type === 'user') {
      defaultColumn.username = 'Text';
      defaultColumn.email = 'Email';
      defaultColumn.password = 'EncryptedText';
      defaultColumn.roles = 'List';
    } else if (type === 'role') {
      defaultColumn.name = 'Text';
    } else if (type === 'device') {
      defaultColumn.channels = 'List';
      defaultColumn.deviceToken = 'Text';
      defaultColumn.deviceOS = 'Text';
      defaultColumn.timezone = 'Text';
      defaultColumn.metadata = 'Object';
    } else if (type === 'file') {
      defaultColumn.name = 'Text';
      defaultColumn.size = 'Number';
      defaultColumn.url = 'URL';
      defaultColumn.path = 'Text';
      defaultColumn.contentType = 'Text';
    } else if (type === 'event') {
      defaultColumn.user = 'Relation';
      defaultColumn.type = 'Text';
      defaultColumn.name = 'Text';
      defaultColumn.data = 'Object';
    } else if (type === 'funnel') {
      defaultColumn.name = 'Text';
      defaultColumn.data = 'Object';
    }
    return defaultColumn;
  } catch (e) {
    winston.log('error', {
      error: String(e),
      stack: new Error().stack,
    });
    return null;
  }
}

function deleteAppFromRedis(appId) {
  const deferred = q.defer();

  try {
    // check redis cache first.
    config.redisClient.del(`${config.cacheAppPrefix}:${appId}`, (err) => {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve('Success');
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

function getKeyAndIV() {
  const deferred = q.defer();
  const key = makeid(48);

  crypto.pseudoRandomBytes(16, (err, ivBuffer) => {
    if (err) {
      return deferred.reject(err);
    }
    const keyBuffer = (key instanceof Buffer) ? key : Buffer.from(key);

    return deferred.resolve({
      iv: ivBuffer,
      key: keyBuffer,
    });
  });
  return deferred.promise;
}

function makeid(len) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // eslint-disable-next-line
  for (let i = 0; i < len; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function _checkSchemaType({ schema, table, tableType }) {
  // check duplicate columns, Pluck all name property of every columns.
  const tableColumns = _.filter(_.pluck(table.columns, 'name'), value => value.toLowerCase());

  const defaultColumns = _getDefaultColumnList(tableType);

  for (let i = 0; i < schema.length; i++) {
    const index = tableColumns.indexOf(schema[i].name.toLowerCase());
    if (index >= 0) {
      // column with the same name found in the table. Checking type...
      if (schema[i].dataType !== table.columns[index].dataType
      || schema[i].relatedTo !== table.columns[index].relatedTo
      || schema[i].relationType !== table.columns[index].relationType
      || schema[i].isDeletable !== table.columns[index].isDeletable
      || schema[i].isEditable !== table.columns[index].isEditable
      || schema[i].isRenamable !== table.columns[index].isRenamable
      || schema[i].editableByMasterKey !== table.columns[index].editableByMasterKey
      || schema[i].isSearchable !== table.columns[index].isSearchable) {
        return 'Cannot Change Column\'s Property. Only Required and Unique Field can be changed.';
      }

      if (schema[i].required !== table.columns[index].required
       && defaultColumns.indexOf(schema[i].name.toLowerCase()) >= 0) {
        return 'Error : Cannot change the required field of a default column.';
      }

      if (schema[i].unique !== table.columns[index].unique
       && defaultColumns.indexOf(schema[i].name.toLowerCase()) >= 0) {
        return 'Error : Cannot change the unique field of a default column.';
      }
    }
  }

  return null;
}
