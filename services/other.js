/* eslint no-unused-expressions: 0 no-param-reassign: 0 */
const q = require('q');
const json2csv = require('json2csv');
const fs = require('fs');
const path = require('path');

const util = require('../helpers/util');
const customHelper = require('../helpers/custom');
const customService = require('./cloudObjects');
const fileService = require('./cloudFiles');
const importHelpers = require('./importHelpers');
const mongoService = require('../databases/mongo');
const appService = require('./app');

module.exports = {
  async exportTable(appId, tableName, exportType, isMasterKey, accessList) {
    const deferred = q.defer();
    try {
      const tables = await customService.find(appId, tableName, {}, null, null, 999999, null, accessList, isMasterKey);
      tables.forEach((docs) => {
        docs.createdAt ? delete docs.createdAt : null;
        docs.updatedAt ? delete docs.updatedAt : null;
        docs._tableName ? delete docs._tableName : null;
        delete docs.expires;
        docs._id ? delete docs._id : null;
        delete docs._version;
        docs.ACL ? delete docs.ACL : null;
        docs._type ? delete docs._type : null;
      });
      if (exportType === 'csv') {
        const result = json2csv({ data: tables });
        deferred.resolve(result);
      } else if (exportType === 'xlsx' || exportType === 'xls') {
        const random = util.getId();
        const fileName = `/tmp/tempfile${random}.xlsx`;

        fs.readFile(fileName, (err, data) => {
          if (err) {
            deferred.reject('Error : Failed to convert the table.');
          } else {
            fs.unlink(fileName, (err1) => {
              if (err1) {
                deferred.reject(err1);
              } else {
                deferred.resolve(data);
              }
            });
          }
        });
      } else if (exportType === 'json') {
        deferred.resolve(tables);
      } else {
        deferred.reject('Invalid exportType ,exportType should be csv,xls,xlsx,json');
      }
    } catch (error) {
      deferred.resolve(error);
    }
    return deferred.promise;
  },

  async importTable(req, isMasterKey) {
    const deferred = q.defer();
    const { appId } = req.params;
    const {
      fileId,
      key: appKey,
      tableName: table,
      fileName,
    } = req.body;
    const tableName = table.replace(/\s/g, '');
    const fileExt = path.extname(fileName);
    try {
      const file = await fileService.getFile(appId, fileId, customHelper.getAccessList(req), isMasterKey);
      const fileStream = mongoService.document.getFileStreamById(appId, file._id);
      let parseFile = null;
      let importType;
      if (fileExt === '.csv') {
        parseFile = importHelpers.importCSVFile;
        importType = 'csv';
      } else if (fileExt === '.xls' || fileExt === '.xlsx') {
        parseFile = importHelpers.importXLSFile;
        importType = 'xls';
      } else {
        parseFile = importHelpers.importJSONFile;
        importType = 'json';
      }

      if (parseFile) {
        const document = await parseFile(fileStream, tableName);
        const body = importHelpers.generateSchema(document, importType);
        const _table = await appService.getTable(appId, tableName);
        if (!_table) {
          throw 'Table doesn\'t exist';
        } else {
          const schema = await importHelpers.compareSchema(document, _table, body);
          // authorize client for table level, if table found then authorize on table level else on app level for creating new table.
          const authorizationLevel = _table ? 'table' : 'app';
          const isAuthorized = await appService.isClientAuthorized(appId, appKey, authorizationLevel, _table);
          if (isAuthorized) {
            await appService.upsertTable(appId, tableName, schema.data.columns, schema.data);
            const result = await customService.save(appId, tableName, document, customHelper.getAccessList(req), isMasterKey);
            deferred.resolve(result);
          } else throw { status: 'Unauthorized' };
        }
      } else throw { message: 'Unparsed file error' };
    } catch (error) {
      deferred.reject(error);
    }
    return deferred.promise;
  },
};
