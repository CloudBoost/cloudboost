module.exports = function(){

    var obj = {};

    obj = {
        getAllDataTypesInclId : function(){
            try{
                var types = ['Object', 'ACL', 'DateTime', 'Boolean', 'EncryptedText', 'URL', 'Email', 'Text', 'File', 'Number',
                    'GeoPoint','Relation','List'];
                return types;

            }catch(err){                    
                global.winston.log('error',err);                                                  
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
                global.winston.log('error',err);                                                  
            }
        }
    };

    return obj;
};