var q = require("q");
var fs = require('fs');
var customHelper = require('../../helpers/custom.js');
var util = require("../../helpers/util.js");
var BusBoy  = require('busboy');
var Stream = require('stream');
var Grid = require('gridfs-stream');


module.exports = function () {

    global.app.post('/file/:appId',function(req, res) {        

        var userId = req.session.userId || null;
        var appId = req.params.appId; 
       
        var sdk = req.body.sdk || "REST";
                  
        _getFileStream(req).then(function(result){
            
            global.keys.fileUrl = global.keys.myURL+"/file/";

            return global.fileService.upload(appId,result.fileStream,result.contentType,result.fileObj);

        }).then(function(file){
            return res.status(200).send(file);
        },function(err){
            return res.status(500).send(err);
        });

        global.apiTracker.log(appId,"File / Upload", req.url,sdk);
        
    });

    global.app.delete('/file/:appId/:fileId', function(req, res) {
        console.log("FILE DELETE");
        console.log('+++++++++ In File Delete Service API ++++++++');

        var appId = req.params.appId;
        var fileObj = req.body.fileObj;
        var userId = req.session.userId || null;
        var sdk = req.body.sdk || "REST";
        global.keys.fileUrl = global.keys.myURL + "/file/";

        global.fileService.delete(appId, fileObj,customHelper.getAccessList(req)).then(function(file) {
            console.log("File successfully deleted.");
            return res.status(200).send(null);
        }, function(err) {
            console.log("Error deletig file.");
            console.log(err);
            return res.status(500).send(err);
        });

        global.apiTracker.log(appId,"File / Delete", req.url,sdk);

    });

    global.app.get('/file/:appId/:fileId', _getFile);
    global.app.post('/file/:appId/:fileId', _getFile);

};


function _getFile(req, res) {

    console.log('+++++++++ In get File Service API ++++++++');
    var appId = req.params.appId;

    var fileId = req.params.fileId;
    var sdk = req.body.sdk || "REST";
    var resizeWidth = req.query.resizeWidth;
    var resizeHeight = req.query.resizeHeight;
    var quality = req.query.quality;
    var opacity = req.query.opacity;
    var scale = req.query.scale;
    var containWidth = req.query.containWidth;
    var containHeight    = req.query.containHeight;
    var rDegs   = req.query.rDegs;
    var bSigma     = req.query.bSigma;
    var cropX      = req.query.cropX;
    var cropY      = req.query.cropY;
    var cropW      = req.query.cropW;
    var cropH      = req.query.cropH;

    if(!fileId){
        return res.status(400).send("File ID is Required");
    }

    global.fileService.getFile(appId, fileId,customHelper.getAccessList(req)).then(function (file) {

        if(typeof resizeWidth === 'undefined' && typeof resizeHeight === 'undefined' && typeof quality === 'undefined' && typeof opacity === 'undefined' && typeof scale === 'undefined' && typeof containWidth === 'undefined' && typeof containHeight === 'undefined' && typeof rDegs === 'undefined' && typeof bSigma === 'undefined' && typeof cropX === 'undefined' && typeof cropY === 'undefined' && typeof cropW && typeof cropH === 'undefined' ){
                   
            var fileStream=global.fileService.getFileStreamById(appId,file._id);

            res.set('Content-Type', file.contentType);
            res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');            

            fileStream.on("error", function(err) {                  
              res.send(500, "Got error while processing stream " + err.message);
              res.end();
            });           
            
            fileStream.on('end', function() {
                res.end();        
            });

            fileStream.pipe(res);            

        }else{
            console.log('+++++ Proccesing Image ++++++++');
            global.fileService.processImage(appId,file, resizeWidth, resizeHeight, cropX, cropY, cropW, cropH, quality, opacity, scale, containWidth, containHeight, rDegs, bSigma).then(function (file) {
                return res.status(200).send(file);
            },function (err) {
                return res.status(500).send(err);
            });
        }

    }, function (err) {
        return res.status(500).send(err);
    });

    global.apiTracker.log(appId,"File / Get", req.url,sdk);
}

/*Desc   : Get file params from upload request
  Params : req
  Returns: Promise
           Resolve->JSON{filestream,contentType,cloudBoostFileObj} 
           Reject->
*/
function _getFileStream(req){

    var deferred = q.defer();

    var resObj={      
        fileStream:null,
        fileObj:null,
        contentType:null
    };

    if(req.body.data){         
        
        //Create a FileStream(add data)
        var Readable = require('stream').Readable;
        var readableStream = new Readable;
        readableStream.push(req.body.data);// the string you want
        readableStream.push(null); 
        
        //Setting response
        resObj.fileStream=readableStream;
        resObj.fileObj=req.body.fileObj;
        resObj.contentType="text/plain";

        deferred.resolve(resObj);       

    }else{

        var busboy = new BusBoy({headers: req.headers});
       
        var Readable = require('stream').Readable;
        var readableStream = new Readable;       

        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {       
            
            var buffer = ''; 
            var isArray=false;

            file.on('data', function(chunk) {                 
                
                var result=mimetype.split("/");
                if(result[0]=="text"){//for Text files
                    buffer+=chunk;
                    isArray=true;
                }else{
                   readableStream.push(chunk); //other media(adding chunks to stream) 
                }                   
                                             
            });

            file.on('end', function() { 
                if(isArray){
                   readableStream.push(buffer); 
                }                                            
                readableStream.push(null);
                resObj.fileStream=readableStream;
                resObj.contentType=mimetype;                
            });            
            
        });

        busboy.on('field', function (fieldname, val) {
            if(fieldname=="fileObj"){//Picking up other fields from request
                resObj[fieldname] = JSON.parse(val);
            }            
        });

        busboy.on('finish', function () {                     
            deferred.resolve(resObj);
        });

        req.pipe(busboy);
    }    

   return deferred.promise;
}
