
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const winston = require('winston');

module.exports = () => {
  const obj = {
    getAllDataTypesInclId() {
      try {
        const types = ['Object', 'ACL', 'DateTime', 'Boolean', 'EncryptedText', 'URL', 'Email', 'Text', 'File', 'Number',
          'GeoPoint', 'Relation', 'List'];
        return types;
      } catch (err) {
        winston.log('error', { error: String(err), stack: new Error().stack });
        return err;
      }
    },

    isBasicDataType(dataType) {
      try {
        const types = ['Object', 'ACL', 'DateTime', 'Boolean', 'EncryptedText', 'URL', 'Email', 'Text', 'File', 'Number', 'GeoPoint'];

        if (types.indexOf(dataType) > -1) {
          return true;
        }

        return false;
      } catch (err) {
        winston.log('error', { error: String(err), stack: new Error().stack });
        return err;
      }
    },
  };

  return obj;
};
