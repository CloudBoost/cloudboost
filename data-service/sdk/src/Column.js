import CB from './CB'
/*
 Column.js
 */
class Column {
  constructor(columnName, dataType, required, unique){
     this.document = {};

     if(!columnName || columnName === '')
        throw "Column Name is required."
     
     if(typeof(columnName)!=='string'){
         throw "Column Name should be of type string.";
     }
     
     if(columnName){
       CB._columnNameValidation(columnName);
       this.document.name = columnName;
       this.document._type = 'column';
     } 

     if(dataType) {
       CB._columnDataTypeValidation(dataType);
       this.document.dataType = dataType;
     } else {
       this.document.dataType = "Text";
     }

     if(typeof(required) === 'boolean') {
       this.document.required = required;
     }
     else {
       this.document.required = false;
     }

     if(typeof(unique) === 'boolean') {
       this.document.unique = unique;
     }
     else{
       this.document.unique = false;
     }

     if(dataType==="Text"){
       this.document.isSearchable = true;
     }  

     this.document.relatedTo = null;
     this.document.relationType = null;

     this.document.isDeletable = true;
     this.document.isEditable = true;
     this.document.isRenamable = false;
     this.document.editableByMasterKey = false; 
     this.document.defaultValue = null;
  };
}

Object.defineProperty(Column.prototype,'name',{
    get: function() {
        return this.document.name;
    },
    set: function(name) {
        this.document.name = name;
    }
});

Object.defineProperty(Column.prototype,'dataType',{
    get: function() {
        return this.document.dataType;
    },
    set: function(dataType) {
        this.document.dataType = dataType;
    }
});


Object.defineProperty(Column.prototype,'unique',{
    get: function() {
        return this.document.unique;
    },
    set: function(unique) {
        this.document.unique = unique;
    }
});


Object.defineProperty(Column.prototype,'relatedTo',{
    get: function() {
        return this.document.relatedTo;
    },
    set: function(relatedTo) {
        this.document.relatedTo = relatedTo;
    }
});

Object.defineProperty(Column.prototype,'required',{
    get: function() {
        return this.document.required;
    },
    set: function(required) {
        this.document.required = required;
    }
});

Object.defineProperty(Column.prototype,'defaultValue',{
    get: function() {
        return this.document.defaultValue;
    },
    set: function(defaultValue) {

        if(typeof defaultValue === 'string') {
            var supportedStringDataTypes = ['Text', 'EncryptedText'];
            if(supportedStringDataTypes.indexOf(this.document.dataType) > -1){
                this.document.defaultValue = defaultValue;
            }
            else if(this.document.dataType === 'URL') {
                if (defaultValue.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i)[0] === defaultValue){
                    this.document.defaultValue = defaultValue;
                }
                else {
                    throw new TypeError("Invalid URL");
                }
            }
            else if(this.document.dataType === 'Email'){
                if (defaultValue.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i)[0] === defaultValue){
                    this.document.defaultValue = defaultValue;
                }
                else {
                    throw new TypeError("Invalid Email");
                }
            }
            else if(this.document.dataType === 'DateTime'){
                if(new Date(defaultValue) == 'Invalid Date'){
                    throw new TypeError("Invalid default value for DateTime Field");
                } 
                this.document.defaultValue = defaultValue;
            }
            else {
                throw new TypeError("Unsupported DataType");
            }
        }
        else if(defaultValue !== null && (['number', 'boolean', 'object', 'undefined'].indexOf(typeof defaultValue) > -1)) {
            if(this.document.dataType.toUpperCase() === (typeof defaultValue).toUpperCase()){
                this.document.defaultValue = defaultValue;
            }
            else {
                throw new TypeError("Unsupported DataType");
            }
        }
        else if(defaultValue === null) {
            this.document.defaultValue = defaultValue;
        }
        else {
            throw new TypeError("Unsupported DataType");
        }

    }
});

Object.defineProperty(Column.prototype,'editableByMasterKey',{
    get: function() {
        return this.document.editableByMasterKey;
    },
    set: function(editableByMasterKey) {
        this.document.editableByMasterKey = editableByMasterKey;
    }
});

Object.defineProperty(Column.prototype,'isSearchable',{
    get: function() {
        return this.document.isSearchable;
    },
    set: function(isSearchable) {
        this.document.isSearchable = isSearchable;
    }
});

CB.Column = Column


export default CB.Column
