
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
  exportTable(appId, tableName, exportType, isMasterKey, accessList) {
    const deferred = q.defer();
    customService.find(appId, tableName, {}, null, null, 999999, null, accessList, isMasterKey).then((tables) => {
      tables.map((docs) => {
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
          }
          fs.unlink(fileName, (err) => {
            if (err) {
              deferred.reject(err);
            }
            deferred.resolve(data);
          });
        });
      } else if (exportType === 'json') {
        deferred.resolve(tables);
      } else {
        deferred.reject('Invalid exportType ,exportType should be csv,xls,xlsx,json');
      }
    }, (err) => {
      deferred.reject(err);
    });
    return deferred.promise;
  },

  importTable(req, isMasterKey) {
    const deferred = q.defer();
    const appId = req.params.appId;
    const appKey = req.body.key;
    const fileId = req.body.fileId;
    const table = req.body.tableName;
    const tableName = table.replace(/\s/g, '');
    const fileName = req.body.fileName;
    const fileExt = path.extname(fileName);

    fileService.getFile(appId, fileId, customHelper.getAccessList(req), isMasterKey).then((file) => {
      const fileStream = mongoService.document.getFileStreamById(appId, file._id);
      let parseFile = null;
      let importType;
      if (fileExt == '.csv') {
        parseFile = importHelpers.importCSVFile;
        importType = 'csv';
      } else if (fileExt == '.xls' || fileExt == '.xlsx') {
        parseFile = importHelpers.importXLSFile;
        importType = 'xls';
      } else {
        parseFile = importHelpers.importJSONFile;
        importType = 'json';
      }

      if (parseFile) {
        parseFile(fileStream, tableName).then((document) => {
          const body = importHelpers.generateSchema(document, importType);
          appService.getTable(appId, tableName).then((table) => {
            if (table == null) {
              deferred.reject("Table doesn't exists");
            } else {
              importHelpers.compareSchema(document, table, body).then((schema) => {
                // check if table already exists
                appService.getTable(appId, tableName).then((table) => {
                  // authorize client for table level, if table found then authorize on table level else on app level for creating new table.
                  const authorizationLevel = table ? 'table' : 'app';
                  appService.isClientAuthorized(appId, appKey, authorizationLevel, table).then((isAuthorized) => {
                    if (isAuthorized) {
                      appService.upsertTable(appId, tableName, schema.data.columns, schema.data).then(() => {
                        customService.save(appId, tableName, document, customHelper.getAccessList(req), isMasterKey).then((result) => {
                          deferred.resolve(result);
                        }, (error) => {
                          deferred.reject(error);
                        });
                      }, err => deferred.reject(err));
                    } else return deferred.reject({ status: 'Unauthorized' });
                  }, error => deferred.reject({ status: 'Unauthorized', message: error }));
                }, err => deferred.reject(err));
              }, (err) => {
                deferred.reject(err);
              });
            }
          }, (err) => {
            deferred.reject(err);
          });
        }, (error) => {
          deferred.reject(error);
        });
      } else {
        deferred.reject({ message: 'Unparsed file error' });
      }
    });
    return deferred.promise;
  },
};
