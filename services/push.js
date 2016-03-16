var Collections = require('../database-connect/collections.js');
var q = require('q');
var fs = require('fs');
var crypto = require("crypto");
var uuid = require('uuid');
var _ = require('underscore');
var util = require('../helpers/util.js');
var Stream = require('stream');
var Grid = require('gridfs-stream');

module.exports = function() {

	return {
		/*Desc   : Get file from gridfs
		  Params : appId,filename
		  Returns: Promise
		           Resolve->file
		           Reject->Error on findOne() or file not found(null)
		*/
		getFile:function(appId,filename){

		    var deferred = global.q.defer();

		    var gfs = Grid(global.mongoClient.db(appId), require('mongodb'));

		    gfs.findOne({filename: filename},function (err, file) {
		        if (err){           
		            return deferred.reject(err);
		        }    
		        if(!file){
		            return deferred.reject(null);                    
		        }  

		        return deferred.resolve(file);  
		    });

		    return deferred.promise;
		},
		/*Desc   : Get fileStream from gridfs
		  Params : appId,fileId
		  Returns: fileStream 
		*/
		getFileStreamById: function(appId,fileId){
            var gfs = Grid(global.mongoClient.db(appId), require('mongodb'));

            var readstream = gfs.createReadStream({
              _id: fileId
            });

            return readstream;
        },
        /*Desc   : Delete file from gridfs
		  Params : appId,filename
		  Returns: Promise
		           Resolve->true
		           Reject->Error on exist() or remove() or file does not exists
		*/
        deleteFileFromGridFs: function(appId,filename){

		    var deferred = global.q.defer(); 

		    var gfs = Grid(global.mongoClient.db(appId), require('mongodb'));

		    //File existence checking
		    gfs.exist({filename: filename}, function (err, found) {
		      if (err){
		        //Error while checking file existence
		        deferred.reject(err);
		      }
		      if(found){       
		        gfs.remove({filename: filename},function (err) {
		            if (err){
		                deferred.reject(err);
		                //unable to delete     
		            }else{
		                deferred.resolve(true);
		                //deleted
		            }                            
		            
		            return deferred.resolve("Success");  
		        });
		      }else{
		        //file does not exists
		        deferred.reject("file does not exists");
		      }
		    });
		    
		    return deferred.promise;
		},
		/*Desc   : Save filestream to gridfs
		  Params : appId,fileStream,fileName,contentType
		  Returns: Promise
		           Resolve->fileObject
		           Reject->Error on writing file
		*/
		saveFileStream:function (appId,fileStream,fileName,contentType){

		    var deferred = global.q.defer();

		    var gfs = Grid(global.mongoClient.db(appId), require('mongodb'));

		    //streaming to gridfs    
		    var writestream = gfs.createWriteStream({
		        filename: fileName,
		        mode: 'w',
		        content_type:contentType
		    });

		    fileStream.pipe(writestream); 		    
		    
		    writestream.on('close', function (file) {               
		        deferred.resolve(file);		        
		        console.log("Successfully saved in gridfs");
		    });

		    writestream.on('error', function (error) {           
		        deferred.reject(error);
		        writestream.destroy();
		        console.log("Failed to saved in gridfs");
		    }); 

		    return deferred.promise;
		},
	};

};

