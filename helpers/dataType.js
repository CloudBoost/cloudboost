var util = require('./util');

module.exports = {
    
    inferDataType: function(data){
    //infer dataType of column from the value of the data provided
    
        if(typeof data === "boolean")
            return "Boolean";
            
        if(!isNaN(data))
            return "Number";

        if(typeof (new Date(data)).toJSON() === "string"){
            return "DateTime";
        }

        if(typeof data === "object"){
            if (data.constructor === Array)
                return "List";
            if(data._type === "point")
                return "GeoPoint";
            if(data._type === "file")
                return "File";
            if (data._tableName)
                return "Relation";
            return "Object";
        }

        if(util.isEmailValid(data))
            return "Email";
        
        if(util.isUrlValid(data))
            return "URL";
        
        return "Text";
    },

    inferRelatedToType: function(dataType, data){
        if(dataType === "Relation"){
            return data._tableName;
        }
        if(dataType === "List"){
            var dataTypeOfFirstElement = this.inferDataType(data[0]);
            if (dataTypeOfFirstElement === "Relation"){
                return data[0]._tableName;
            }
            return dataTypeOfFirstElement;
        }
        return null;
    },

    getDataType: function(){
        return {
            Text: "Text",
            Email: "Email",
            URL: "URL",
            Number: "Number",
            EncryptedText: "Encrypted Text",
            Boolean: "Boolean",
            DateTime: "DateTime",
            GeoPoint: "GeoPoint",
            File: "File",
            List: "List",
            Relation: "Relation",
            Object: "Object"
        };
    }
};