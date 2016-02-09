module.exports = function(){

    var obj = {};

    obj = {
        getAllDataTypesInclId : function(){
            var types = ['Object', 'ACL', 'DateTime', 'Boolean', 'EncryptedText', 'URL', 'Email', 'Text', 'File', 'Number',
                'GeoPoint','Relation','List'];
            return types;
        },

        isBasicDataType: function (dataType) {
            var types = ['Object', 'ACL', 'DateTime', 'Boolean', 'EncryptedText', 'URL', 'Email', 'Text', 'File', 'Number', 'GeoPoint'];

            if (types.indexOf(dataType) > -1) {
                return true;
            }

            return false;
        }
    };

    return obj;
};