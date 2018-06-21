
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var winston = require('winston');

module.exports = function(){

    var obj = {};

    obj = {
        getAllDataTypesInclId : function(){
            try{
                var types = ['Object', 'ACL', 'DateTime', 'Boolean', 'EncryptedText', 'URL', 'Email', 'Text', 'File', 'Number',
                    'GeoPoint','Relation','List'];
                return types;

            }catch(err){                    
                winston.log('error',{"error":String(err),"stack": new Error().stack});                                                  
            }
        },

        isBasicDataType: function (dataType) {
            try{
                var types = ['Object', 'ACL', 'DateTime', 'Boolean', 'EncryptedText', 'URL', 'Email', 'Text', 'File', 'Number', 'GeoPoint'];

                if (types.indexOf(dataType) > -1) {
                    return true;
                }

                return false;

            }catch(err){                    
                winston.log('error',{"error":String(err),"stack": new Error().stack});                                                  
            }
        }
    };

    return obj;
};