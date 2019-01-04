const q = require('q');
const csv = require('csvtojson');
const xlsx = require('node-xlsx');
const util = require('../helpers/util.js');

const importHelpers = {
  importCSVFile(fileStream, table) {
    const deferred = q.defer();
    const tableName = table.replace(/\s/g, '');
    const csvJson = [];
    csv()
      .fromStream(fileStream)
      .on('json', (json) => {
        json.expires ? json.expires : json.expires = null;
        json._id = util.getId();
        json._version ? json._version : json._version = '1';
        json._type ? json._type : json._type = 'custom';
        if (json.createdAt) {
          if (new Date(json.createdAt) == 'Invalid Date') {
            json.created = json.createdAt;
            json.createdAt = '';
          }
        } else {
          json.createdAt = '';
        }
        if (json.updatedAt) {
          if (new Date(json.updatedAt) == 'Invalid Date') {
            json.updated = json.updatedAt;
            json.updatedAt = '';
          }
        } else {
          json.updatedAt = '';
        }
        try {
          json.ACL ? json.ACL = JSON.parse(json.ACL)
            : json.ACL = {
              read: {
                allow: {
                  user: [
                    'all',
                  ],
                  role: [],
                },
                deny: {
                  user: [],
                  role: [],
                },
              },
              write: {
                allow: {
                  user: [
                    'all',
                  ],
                  role: [],
                },
                deny: {
                  user: [],
                  role: [],
                },
              },
            };
        } catch (err) {
          json.ACL = {
            read: {
              allow: {
                user: [
                  'all',
                ],
                role: [],
              },
              deny: {
                user: [],
                role: [],
              },
            },
            write: {
              allow: {
                user: [
                  'all',
                ],
                role: [],
              },
              deny: {
                user: [],
                role: [],
              },
            },
          };
        }
        json._modifiedColumns = Object.keys(json);
        json._isModified = true;
        json._tableName = tableName;
        csvJson.push(json);
      })
      .on('done', (error) => {
        if (error) {
          deferred.reject(error);
        } else {
          deferred.resolve(csvJson);
        }
      });
    return deferred.promise;
  },

  importXLSFile(fileStream, table) {
    const deferred = q.defer();
    const tableName = table.replace(/\s/g, '');
    const xslJsonObj = [];
    let workSheetsFromBuffer;
    fileStream.on('data', (chunk) => {
      workSheetsFromBuffer = xlsx.parse(chunk);
    });

    fileStream.on('end', () => {
      try {
        workSheetsFromBuffer.forEach((element) => {
          const h = element.data[0];
          const headers = [];
          h.map((x) => {
            if (x !== 'A CL' && x !== 'ACL' && x !== 'A C L') {
              x = x.charAt(0).toLowerCase() + x.slice(1);
            }
            headers.push(x.replace(/\s/g, ''));
          });
          for (let i = 1; i < element.data.length; i++) {
            const obj = {};
            if (element.data[i].length != 0) {
              for (let j = 0; j < element.data[i].length; j++) {
                if (typeof element.data[i][j] !== 'undefined' && typeof headers[j] !== 'undefined') {
                  if (headers[j] == 'A CL' || headers[j] == 'ACL' || headers[j] == 'A C L') {
                    try {
                      obj.ACL = JSON.parse(element.data[i][j]);
                    } catch (err) {
                      obj.ACL = {
                        read: {
                          allow: {
                            user: [
                              'all',
                            ],
                            role: [],
                          },
                          deny: {
                            user: [],
                            role: [],
                          },
                        },
                        write: {
                          allow: {
                            user: [
                              'all',
                            ],
                            role: [],
                          },
                          deny: {
                            user: [],
                            role: [],
                          },
                        },
                      };
                    }
                    continue;
                  }
                  if (headers[j] == 'createdAt' && new Date(element.data[i][j]).toString() == 'Invalid Date') {
                    element.data[i][j] = element.data[i][j].replace(/"/g, '');
                    const date = element.data[i][j].split('T');
                    obj.createdAt = new Date(date[0]);
                    continue;
                  }
                  obj[headers[j]] = element.data[i][j] == 'null' ? null : element.data[i][j];
                }
              }
              obj.ACL ? obj.ACL : obj.ACL = {
                read: {
                  allow: {
                    user: [
                      'all',
                    ],
                    role: [],
                  },
                  deny: {
                    user: [],
                    role: [],
                  },
                },
                write: {
                  allow: {
                    user: [
                      'all',
                    ],
                    role: [],
                  },
                  deny: {
                    user: [],
                    role: [],
                  },
                },
              };
              obj.expires ? obj.expires : obj.expires = null;
              if (obj._id) {
                delete obj._id;
              }
              obj._id = util.getId();
              obj.updatedAt ? obj.updatedAt : obj.updatedAt = '';
              obj._version ? obj._version : obj._version = '1';
              obj._type ? obj._type : obj._type = 'custom';
              obj.createdAt ? obj.createdAt : obj.createdAt = '';
              obj._modifiedColumns = Object.keys(obj);
              obj._isModified = true;
              obj._tableName = tableName;
              xslJsonObj.push(obj);
            } else {
              continue;
            }
          }
        });
        deferred.resolve(xslJsonObj);
      } catch (err) {
        deferred.reject(err);
      }
    });

    fileStream.on('error', (error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  },

  importJSONFile(fileStream, table) {
    const deferred = q.defer();
    const tableName = table.replace(/\s/g, '');
    let data = '';
    fileStream.on('data', (chunk) => {
      data += chunk;
    });

    fileStream.on('end', () => {
      try {
        const jSON = JSON.parse(data);
        jSON.data = jSON;
        try {
          for (let i = 0; i < jSON.data.length; i++) {
            jSON.data[i].expires ? jSON.data[i].expires : jSON.data[i].expires = null;
            jSON.data[i]._id = util.getId();
            if (jSON.data[i].createdAt) {
              if (new Date(jSON.data[i].createdAt) == 'Invalid Date') {
                jSON.data[i].created = jSON.data[i].createdAt;
                jSON.data[i].createdAt = '';
              }
            } else {
              jSON.data[i].createdAt = '';
            }
            if (jSON.data[i].updatedAt) {
              if (new Date(jSON.data[i].updatedAt) == 'Invalid Date') {
                jSON.data[i].updated = jSON.data[i].updatedAt;
                jSON.data[i].updatedAt = '';
              }
            } else {
              jSON.data[i].updatedAt = '';
            }
            jSON.data[i]._version ? jSON.data[i]._version : jSON.data[i]._version = '1';
            jSON.data[i]._type ? jSON.data[i]._type : jSON.data[i]._type = 'custom';
            jSON.data[i].ACL ? jSON.data[i].ACL
              : jSON.data[i].ACL = {
                read: {
                  allow: {
                    user: [
                      'all',
                    ],
                    role: [],
                  },
                  deny: {
                    user: [],
                    role: [],
                  },
                },
                write: {
                  allow: {
                    user: [
                      'all',
                    ],
                    role: [],
                  },
                  deny: {
                    user: [],
                    role: [],
                  },
                },
              };
            jSON.data[i]._modifiedColumns = Object.keys(jSON.data[i]);
            jSON.data[i]._isModified = true;
            jSON.data[i]._tableName = tableName;
          }
          deferred.resolve(jSON.data);
        } catch (error) {
          deferred.reject(error);
        }
      } catch (err) {
        deferred.reject(err);
      }
    });

    fileStream.on('error', (error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  },

  generateSchema(document) {
    const tableHeaders = [];
    const nonTHeaders = [];
    const masterArray = [];
    for (let i = 0; i < document.length; i++) {
      masterArray.push(Object.keys(document[i]));
    }
    const body = {
      data: {
        columns: [
          {
            name: 'id',
            _type: 'column',
            dataType: 'Id',
            required: true,
            unique: true,
            relatedTo: null,
            relationType: null,
            isDeletable: false,
            isEditable: false,
            isRenamable: false,
            editableByMasterKey: false,
          },
          {
            name: 'expires',
            _type: 'column',
            dataType: 'DateTime',
            required: false,
            unique: false,
            relatedTo: null,
            relationType: null,
            isDeletable: false,
            isEditable: false,
            isRenamable: false,
            editableByMasterKey: false,
          },
          {
            name: 'updatedAt',
            _type: 'column',
            dataType: 'DateTime',
            required: true,
            unique: false,
            relatedTo: null,
            relationType: null,
            isDeletable: false,
            isEditable: false,
            isRenamable: false,
            editableByMasterKey: false,
          },
          {
            name: 'createdAt',
            _type: 'column',
            dataType: 'DateTime',
            required: true,
            unique: false,
            relatedTo: null,
            relationType: null,
            isDeletable: false,
            isEditable: false,
            isRenamable: false,
            editableByMasterKey: false,
            defaultValue: '1970-01-01T00:00:00.000Z',
          },
          {
            name: 'ACL',
            _type: 'column',
            dataType: 'ACL',
            required: true,
            unique: false,
            relatedTo: null,
            relationType: null,
            isDeletable: false,
            isEditable: false,
            isRenamable: false,
            editableByMasterKey: false,
          },
        ],
      },
    };
    if (masterArray.length > 0) {
      const index = masterArray.map(a => a.length).indexOf(Math.max(...masterArray.map(a => a.length)));
      const headers = masterArray[index];
      for (let j = 0; j < headers.length; j++) {
        const x = headers[j];
        if (x == '_type' || x == '_version' || x == '_tableName' || x == '_isModified' || x == '_modifiedColumns' || x == '' || x == 'id' || x == '_id' || x == 'ACL' || x == 'createdAt' || x == 'updatedAt' || x == 'expires') {
          continue;
        }
        const obj = {};
        obj.name = x;
        obj._type = 'column';
        const type = check(document, index, x, 'dataType');
        if (!type) {
          nonTHeaders.push({
            colName: x,
          });
          continue;
        } else {
          obj.dataType = type;
        }
        tableHeaders.push({
          colName: x,
          colType: obj.dataType,
        });
        obj.unique = false;
        obj.defaultValue = null;
        obj.required = false;
        if (obj.dataType == 'List') {
          obj.relatedTo = check(document, index, x, 'relatedTo');
        } else {
          obj.relatedTo = null;
        }
        obj.relationType = null;
        obj.isDeletable = true;
        obj.isEditable = true;
        obj.isRenamable = false;
        obj.editableByMasterKey = false;
        body.data.columns.push(obj);
      }
      validateData(tableHeaders, nonTHeaders, document);
      return body;
    }
    return null;
  },

  compareSchema(document, actualSchema, generatedSchema) {
    const deferred = q.defer();
    if (actualSchema.columns && generatedSchema.data.columns) {
      const actCols = actualSchema.columns;
      const genCols = generatedSchema.data.columns;

      const newCols = [];

      for (let i = 0; i < genCols.length; i++) {
        let addFlag = false;
        for (let j = 0; j < actCols.length; j++) {
          if (genCols[i].name == actCols[j].name) {
            addFlag = false;
            if (genCols[i].dataType != actCols[j].dataType) {
              genCols[i].name = `${genCols[i].name}_${genCols[i].dataType}`;
              updateDocument(document, actCols[j], genCols[i]);
              newCols.push(genCols[i]);
            }
            break;
          } else {
            addFlag = true;
          }
        }
        if (addFlag) {
          newCols.push(genCols[i]);
        }
      }
      const schema = actCols.concat(newCols);
      if (verifyRequiredCols(schema, document)) {
        deferred.resolve({ data: { columns: schema } });
      } else {
        deferred.reject('Required Data Missing');
      }
    } else {
      deferred.reject('Schema not present');
    }

    return deferred.promise;
  },
};

module.exports = importHelpers;

function check(document, index, x, colProp) {
  let type; let data = document[index][x]; let
    delCol = false;
  if (isEmpty(data)) {
    for (let i = 0; i < document.length; i++) {
      if (!isEmpty(document[i][x])) {
        delCol = false;
        data = document[i][x];
        break;
      } else {
        delCol = true;
      }
    }
    if (delCol && colProp == 'dataType') {
      return null;
    }
  }
  type = detectDataType(data, colProp);
  return type;
}

function detectDataType(data, colProp) {
  if (isJson(data)) {
    try {
      data = JSON.parse(data);
      // eslint-disable-next-line
        } catch (e) {}
  }
  if (colProp == 'relatedTo') {
    data = data[0];
  }
  let type;
  if (data == 'true' || data == 'false' || data == true || data == false) {
    type = 'Boolean';
  } else if (!isNaN(data) && typeof data === 'number') {
    type = 'Number';
  } else if (isUrl(data) && !(data instanceof Array)) {
    type = 'URL';
  } else if (validateEmail(data) && !(data instanceof Array)) {
    type = 'Email';
  } else if (new Date(data).toString() != 'Invalid Date') {
    type = 'DateTime';
  } else if (data instanceof Array) {
    type = 'List';
  } else if (isJson(data) || typeof data === 'object') {
    if (data._type) {
      if (data._type == 'file') {
        type = 'File';
      } else if (data._type == 'point') {
        type = 'GeoPoint';
      } else if (data._tableName) {
        type = data._tableName;
      }
    } else {
      type = 'Object';
    }
  } else {
    type = typeof data;
  }
  if (type == 'string') {
    type = 'Text';
  }
  return type;
}

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function validateData(tableHeaders, nonTHeaders, document) {
  document.map((data) => {
    tableHeaders.map((header) => {
      if (isEmpty(data[header.colName])) {
        emptyDataValidation(data, header);
      } else {
        dataValidation(data, header);
      }
    });
    nonTHeaders.map((ele) => {
      if (data[ele.colName] == '' || data[ele.colName] == null) {
        delete data[ele.colName];
      }
    });
  });
}

function isUrl(s) {
  const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(s);
}

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function isEmpty(obj) {
  if (obj == null) return true;

  if (obj.length > 0) return false;
  if (obj.length === 0) return true;

  if (typeof obj === 'number') return false;
  if (typeof obj !== 'object') return true;

  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

function emptyDataValidation(data, header) {
  if (header.colType == 'Boolean') {
    data[header.colName] = false;
  } else if (header.colType == 'GeoPoint') {
    data[header.colName] = {
      _type: 'point', coordinates: [0, 0], latitude: 0, longitude: 0,
    };
  } else if (header.colType == 'File') {
    data[header.colName] = null;
  } else if (header.colType == 'Object') {
    data[header.colName] = null;
  } else if (header.colType == 'List') {
    data[header.colName] = null;
  } else if (header.colType == 'Number') {
    data[header.colName] = null;
  } else if (header.colType == 'DateTime') {
    data[header.colName] = new Date();
  }
}

function dataValidation(data, header) {
  if (header.colType == 'Boolean') {
    data[header.colName] ? data[header.colName] = true : data[header.colName] = false;
  } else if (typeof data[header.colName] !== 'object' && (header.colType == 'File' || header.colType == 'Object' || header.colType == 'GeoPoint' || header.colType == 'List')) {
    isJson(data[header.colName]) ? data[header.colName] = JSON.parse(data[header.colName]) : data[header.colName] = null;
  } else if (header.colType == 'Number') {
    parseInt(data[header.colName]) ? data[header.colName] = parseInt(data[header.colName]) : data[header.colName] = 0;
  } else if (header.colType == 'DateTime') {
    if (typeof data[header.colName] === 'string') {
      data[header.colName] = data[header.colName].replace(/"/g, '');
    }
    data[header.colName] = (new Date(data[header.colName]).toString() == 'Invalid Date' ? new Date() : new Date(data[header.colName]));
  } else if (header.colType == 'Text') {
    if (isJson(data[header.colName]) || data[header.colName] == true || data[header.colName] == false || data[header.colName] == 'true' || data[header.colName] == 'false') {
      data[header.colName] = null;
    } else {
      data[header.colName] = data[header.colName];
    }
  }
}

function updateDocument(document, actualField, newField) {
  document.map((doc) => {
    if (doc[actualField.name]) {
      doc[newField.name] = doc[actualField.name];
      doc._modifiedColumns.push(newField.name);
      const index = doc._modifiedColumns.indexOf(actualField.name);
      if (index > -1) {
        doc._modifiedColumns.splice(index, 1);
      }
      delete doc[actualField.name];
    }
  });
}

function verifyRequiredCols(schema, document) {
  let flag = true;
  document.map((doc) => {
    schema.map((column) => {
      if (column.name !== 'id' && column.name !== 'ACL' && column.name !== 'expires' && column.name !== 'updatedAt' && column.name !== 'createdAt' && column.required) {
        if (isEmpty(doc[column.name]) || doc[column.name] == 'undefined') {
          flag = false;
        }
      }
    });
  });
  return flag;
}
