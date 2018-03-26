describe("Cloud Objects Files", function() {

    try {
        if(window) {

            //Check Blob availability..
            var blobAvail=true;
            try {                    
                new Blob(['<a id="a"><b id="b">hey!</b></a>'], {type: "text/html"});
                blobAvail=true;
            } catch (e) {                   
                blobAvail=false;
            }

            var obj = new CB.CloudObject('Student');

            it("should save a file inside of an object", function (done) {

                this.timeout(40000);

                if(blobAvail){

                    //save file first.
                    var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
                    try {
                        var oMyBlob = new Blob(aFileParts, {type: "text/html"});
                    } catch (e) {
                        var builder = new WebKitBlobBuilder();
                        builder.append(aFileParts);
                        var oMyBlob = builder.getBlob();
                    }
                    var file = new CB.CloudFile(oMyBlob);

                    file.save().then(function (file) {
                        if (file.url) {
                            
                            //create a new object.
                            var obj = new CB.CloudObject('Sample');
                            obj.set('name', 'sample');
                            obj.set('file', file);

                            obj.save().then(function (newobj) {
                                
                                if (newobj.get('file') instanceof CB.CloudFile && newobj.get('file').document._id) {
                                    done();
                                } else {
                                    throw "object saved but didnot return file.";
                                }
                            }, function (error) {
                                throw "error saving an object.";
                            });

                        } else {
                            throw "upload success. but cannot find the url.";
                        }
                    }, function (err) {
                        throw "error uploading file";
                    });

                }else{
                    done();
                }

            });


             it("should save a file inside of an object and can update the CloudObject", function (done) {

                this.timeout(40000);

                if(blobAvail){
                    //save file first.
                    var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
                    try {
                        var oMyBlob = new Blob(aFileParts, {type: "text/html"});
                    } catch (e) {
                        var builder = new WebKitBlobBuilder();
                        builder.append(aFileParts);
                        var oMyBlob = builder.getBlob();
                    }
                    var file = new CB.CloudFile(oMyBlob);

                    file.save().then(function (file) {
                        if (file.url) {
                           
                            //create a new object.
                            var obj = new CB.CloudObject('Sample');
                            obj.set('name', 'sample');
                            obj.set('file', file);

                            obj.save().then(function (newobj) {
                                
                                if (newobj.get('file') instanceof CB.CloudFile && newobj.get('file').document._id) {
                                   
                                    newobj.set('name','sample2');
                                    newobj.save().then(function(){
                                        done();
                                    }, function(){
                                        done("Error saving CLoudObject");
                                    });

                                } else {
                                    throw "object saved but didnot return file.";
                                }
                            }, function (error) {
                                throw "error saving an object.";
                            });

                        } else {
                            throw "upload success. but cannot find the url.";
                        }
                    }, function (err) {
                        throw "error uploading file";
                    });
                }else{
                    done();
                }

            });

            it("should save an array of files.", function (done) {
                this.timeout(400000);

                if(blobAvail){
                    //save file first.
                    var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
                    try {
                        var oMyBlob = new Blob(aFileParts, {type: "text/html"});
                    } catch (e) {
                        var builder = new WebKitBlobBuilder();
                        builder.append(aFileParts);
                        var oMyBlob = builder.getBlob();
                    }
                    var file = new CB.CloudFile(oMyBlob);

                    file.save().then(function (file) {
                        if (file.url) {

                            var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
                            try {
                                var oMyBlob = new Blob(aFileParts, {type: "text/html"});
                            } catch (e) {
                                var builder = new WebKitBlobBuilder();
                                builder.append(aFileParts);
                                var oMyBlob = builder.getBlob();
                            }
                            var file1 = new CB.CloudFile(oMyBlob);

                            file1.save().then(function (file1) {
                                if (file1.url) {

                                    //create a new object.
                                    var obj = new CB.CloudObject('Sample');
                                    obj.set('name', 'sample');
                                    obj.set('fileList', [file, file1]);

                                    obj.save().then(function (newObj) {
                                        done();
                                    }, function (error) {
                                        throw "Error Saving an object.";
                                    });

                                } else {
                                    throw "Upload success. But cannot find the URL.";
                                }
                            }, function (err) {
                                throw "Error uploading file";
                            });

                        } else {
                            throw "Upload success. But cannot find the URL.";
                        }
                    }, function (err) {
                        throw "Error uploading file";
                    });
                }else{
                    done();
                }
            });

        }
    }catch(e){
        
    }

});