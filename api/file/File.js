var q = require("q");
var fs = require('fs');
var customHelper = require('../../helpers/custom.js');
var util = require("../../helpers/util.js");

module.exports = function () {

	global.app.post('/file/:appId', function(req, res) {
        console.log("FILE UPLOAD");
		console.log('+++++++++ In File Upload Service API ++++++++');
        var fileObj = null;
        var sdk = req.body.sdk || "REST";
        if(req.body.data){
            var fileName = _createFile(req.body.data);
            var filePath = './uploads/'+fileName;
            fileObj = req.body.fileObj;
        }else {
            var filePath = req.files.fileToUpload.path,
                fileName = req.files.fileToUpload.name,
                originalName = req.files.fileToUpload.originalname;
            fileObj = JSON.parse(req.body.fileObj);
        }
        var userId = req.session.userId || null;
        var appId = req.params.appId;
        
        global.keys.fileUrl = global.keys.myURL+"/file/";

		global.fileService.upload(appId,filePath,fileObj).then(function(file) {
			return res.status(200).send(file);
		}, function(err) {
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
        return res.status(200).send(file);
    }else{
        console.log('+++++ Proccesing Image ++++++++');
        global.fileService.processImage(appId,file, resizeWidth, resizeHeight, cropX, cropY, cropW, cropH, quality, opacity, scale, containWidth, containHeight, rDegs, bSigma).then(function (file) {
                 return res.status(200).send(file);
          }, function (err) {
        return res.status(500).send(err);
    });
    }
    }, function (err) {
        return res.status(500).send(err);
    });
    
    global.apiTracker.log(appId,"File / Get", req.url,sdk);
}

function _createFile(data, name, path){
    var name = util.getId();
    var path = './uploads/'+name;
    var fd = fs.openSync(path,'w+');
    fs.write(fd,data);
    return name;
}
