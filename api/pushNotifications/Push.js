var q = require("q");
var fs = require('fs');
var customHelper = require('../../helpers/custom.js');
var util = require("../../helpers/util.js");
var _ = require('underscore');
var Stream = require('stream');
var Grid = require('gridfs-stream');

module.exports = function() {

    /*stream apple cerficate to gridfs
        1.Get fileStream from request
        2.Check if masterKey is false
        3.GetAppSettings and delete previous apple certificate if exists(in background)
        4.Get ServerUrl to make fileUri
        5.Save current Apple certificate to gridfs
    */
    global.app.put('/push/:appId/certificates/apple', function (req, res) {

        console.log("++++ Stream apple certificate to gridfs ++++++");

        var appId = req.params.appId;
        var appKey = req.body.key || req.params.key;        
        
        var thisUri=null;
        var promises=[];        

        promises.push(_getFileStream(req));
        promises.push(global.appService.isMasterKey(appId, appKey));
        promises.push(global.appService.getAllSettings(appId));
        promises.push(global.keyService.getMyUrl());

        q.all(promises).then(function(resultList){

            //Check database connectivity
            if(global.mongoDisconnected || global.elasticDisconnected){
                return res.status(500).send('Storage / Search / Cache Backend are temporarily down.');
            }
            //Check if masterKey is false
            if(!resultList[1]){
                return res.status(401).send({status : 'Unauthorized'});
            }
            //Delete previous apple certificate from gridfs
            if(resultList[2] && resultList[2].length>0){
                var push=_.where(resultList[2], {category: "push"});
                if(push && push.length>0){
                  if(push[0].settings.apple.certificates.length>0){
                    //get the filename from fileUri
                    var fileName=push[0].settings.apple.certificates[0].split("/").reverse()[0];                    
                    global.pushService.deleteFileFromGridFs(appId,fileName);
                  }
                }
            }
            //Server URI
            thisUri=resultList[3];

            var fileName=util.getId();
            return global.pushService.saveFileStream(appId,resultList[0].fileStream,fileName,resultList[0].contentType);            
        
        }).then(function(savedFile){
            var fileUri=thisUri+'/push/'+appId+'/certificates/apple/'+savedFile.filename;
            return res.status(200).send(fileUri);
        },function(error){
            return res.status(500).send(error);
        });        

    });

    //get apple cerficate from gridfs
    global.app.get('/push/:appId/certificates/apple/:fileId/:key', function (req, res) {

        console.log("++++ Stream apple certificate from gridfs++++++");

        var appId = req.params.appId;
        var fileId = req.params.fileId;
        var appKey = req.body.key || req.params.key;

        /*global.pushService.getFile(appId, fileId).then(function (file) {
                    
            var fileStream=global.pushService.getFileStreamById(appId,file._id);

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

        }, function (err) {
            return res.status(500).send(err);
        });*/

    });

    //Send push notifications
    global.app.post('/push/:appId/send', function (req, res) {

        console.log("++++ Send push notification++++++");

        var appId    = req.params.appId;     
        var appKey   = req.body.key || req.params.key;
        var body     = req.body;

        var collectionName = "Device";
        var query          = body.query;
        var select         = body.select;
        var sort           = body.sort;
        var limit          = body.limit;
        var skip           = body.skip;
        var userId         = req.session.userId || null;       
        var sdk            = body.sdk || "REST";
        var pushData       = body.data;        
       
        if(!select){
            global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {                
                return global.pushService.sendPush(appId,collectionName, query, sort, limit,skip,customHelper.getAccessList(req),isMasterKey,pushData);
            }).then(function (results) {
                res.status(200).send(results);
            }, function (error) {
                res.status(400).send(error);
            });
        }else{
            res.status(400).send("query select is not allowed");
        }       
        
        global.apiTracker.log(appId,"Push / Send", req.url,sdk);                
        
    });


};

/*Desc   : Get fileStream and contentType from upload request
  Params : req
  Returns: Promise
           Resolve->JSON{filestream,contentType} 
           Reject->
*/
function _getFileStream(req){

    var deferred = q.defer();

    var resObj={      
        fileStream:null,       
        contentType:null
    };

    //Create a FileStream(add data)
    var Readable = require('stream').Readable;
    var readableStream = new Readable;             

    readableStream.push(req.files.appleCertificate.data);
    readableStream.push(null);

    //Setting response
    resObj.fileStream=readableStream;
    resObj.contentType=req.files.appleCertificate.mimetype;    
     
    deferred.resolve(resObj);      

   return deferred.promise;
}
