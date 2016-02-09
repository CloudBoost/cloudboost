CB.CloudApp.init("sample", "zA6waG2nL1DID0o/JWCerg==").then(function(doc) {
	console.log("App Init done");
}, function(err) {
	console.log("Error app init");
	console.log(err);
});

$(document).ready(function() {
	$("form").on('submit', function(event) {
		event.stopPropagation();
		event.preventDefault();
		// var input = document.getElementById('fileInp');
		var file = $("#fileInp")[0].files[0];
		// console.log(file);
		initTest(file);
	});
})

function initTest(file) {
	fileUpload(file).then(function() {
		
	}, function(err) {
		console.log("Error file create");
		console.log(err);
	})
}

function fileUpload(file) {
	var def = $.Deferred();
	var fileObj = new CB.CloudFile(file);

	console.log("saving file: ");
	console.log(fileObj);
	fileObj.save().then(function(file) {
		console.log("File uploaded successfully");
		console.log(file);
		def.resolve();
	}, function(err) {
		console.log("Error uploading file");
		console.log(err);
		def.resolve();
	})

	return def.promise();
}