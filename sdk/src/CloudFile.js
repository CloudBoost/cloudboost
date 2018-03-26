import CB from './CB'
/*
 CloudFiles
 */

CB.CloudFile = CB.CloudFile || function(file, data, type, path) {
    if (!path)
        path = '/' + CB.appId;
    if (Object.prototype.toString.call(file) === '[object File]' || Object.prototype.toString.call(file) === '[object Blob]') {

        this.fileObj = file;
        this.document = {
            _id: null,
            _type: 'file',
            _tableName: '_File',
            ACL: new CB.ACL(),
            name: (file && file.name && file.name !== "")
                ? file.name
                : 'default.file',
            size: file.size,
            url: null,
            expires: null,
            path: path,
            updatedAt: Date.now(),
            createdAt: Date.now(),
            contentType: (typeof file.type !== "undefined" && file.type !== "")
                ? file.type
                : 'unknown'
        };
        this.document._modifiedColumns = [
            'name',
            'updatedAt',
            'ACL',
            'expires',
            'size',
            'url',
            'path',
            'createdAt',
            'contentType'
        ];
        this.document._isModified = true;
    } else if (typeof file === "string") {
        var regexp = RegExp("https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,}");
        if (regexp.test(file)) {
            this.document = {
                _id: null,
                _type: 'file',
                _tableName: '_File',
                ACL: new CB.ACL(),
                name: '',
                size: '',
                url: file,
                expires: null,
                path: path,
                updatedAt: Date.now(),
                createdAt: Date.now(),
                contentType: ''
            };
            this.document._modifiedColumns = [
                'name',
                'updatedAt',
                'ACL',
                'expires',
                'size',
                'url',
                'path',
                'createdAt',
                'contentType'
            ];
            this.document._isModified = true;
        } else {
            if (data) {
                this.data = data;
                if (!type) {
                    type = file.split('.')[file.split('.').length - 1];
                }
                this.document = {
                    _id: null,
                    _type: 'file',
                    _tableName: '_File',
                    ACL: new CB.ACL(),
                    name: file,
                    size: '',
                    url: null,
                    path: path,
                    updatedAt: Date.now(),
                    createdAt: Date.now(),
                    expires: null,
                    contentType: type
                };
                this.document._modifiedColumns = [
                    'name',
                    'updatedAt',
                    'ACL',
                    'expires',
                    'size',
                    'url',
                    'path',
                    'createdAt',
                    'contentType'
                ];
                this.document._isModified = true;
            } else {
                this.document = {
                    _id: file,
                    _type: 'file',
                    _tableName: '_File'
                }
                this.document._modifiedColumns = [
                    'name',
                    'updatedAt',
                    'ACL',
                    'expires',
                    'size',
                    'url',
                    'path',
                    'createdAt',
                    'contentType'
                ];
                this.document._isModified = true;
            }
        }
    }

};

CB.CloudFile.prototype = Object.create(CB.CloudObject.prototype);

Object.defineProperty(CB.CloudFile.prototype, 'type', {
    get: function() {
        return this.document.contentType;
    },
    set: function(type) {
        this.document.contentType = type;
    }
});

Object.defineProperty(CB.CloudFile.prototype, 'url', {
    get: function() {
        return this.document.url;
    },
    set: function(url) {
        this.document.url = url;
    }
});

Object.defineProperty(CB.CloudFile.prototype, 'size', {
    get: function() {
        return this.document.size;
    }
});

Object.defineProperty(CB.CloudFile.prototype, 'name', {
    get: function() {
        return this.document.name;
    },
    set: function(name) {
        this.document.name = name;
    }
});

Object.defineProperty(CB.CloudFile.prototype, 'path', {
    get: function() {
        return this.document.path;
    },
    set: function(path) {
        this.document.path = path;
    }
});

Object.defineProperty(CB.CloudFile.prototype, 'createdAt', {
    get: function() {
        return this.document.createdAt;
    }
});

Object.defineProperty(CB.CloudFile.prototype, 'updatedAt', {
    get: function() {
        return this.document.updatedAt;
    }
});
/**
 * Uploads File
 *
 * @param callback
 * @returns {*}
 */

CB.CloudFile.prototype.save = function(callback) {

    var def;

    if (!callback) {
        def = new CB.Promise();
    }

    var thisObj = this;
    if (!this.fileObj && !this.data && this.type != 'folder' && !this.url)
        throw "You cannot save a file which is null";

    if (!this.data) {
        var params;
        try {
            if (!window) {
                params = {};

                params['fileToUpload'] = this.fileObj;
                params['key'] = CB.appKey;
                params['fileObj'] = JSON.stringify(CB.toJSON(thisObj));
            } else {
                params = new FormData();
                params.append("fileToUpload", this.fileObj);
                params.append("key", CB.appKey);
                params.append("fileObj", JSON.stringify(CB.toJSON(thisObj)));

            }
        } catch (e) {
            params = {};

            params['fileToUpload'] = this.fileObj;
            params['key'] = CB.appKey;
            params['fileObj'] = JSON.stringify(CB.toJSON(thisObj));
        }
        var url = CB.apiUrl + '/file/' + CB.appId;

        var uploadProgressCallback = null;

        if (callback && callback.uploadProgress) {
            uploadProgressCallback = callback.uploadProgress;
        }

        CB._request('POST', url, params, false, true, uploadProgressCallback).then(function(response) {
            thisObj.document = JSON.parse(response);
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        }, function(err) {
            if (callback) {
                callback.error(err);
            } else {
                def.reject(err);
            }
        });
    } else {
        var data = this.data;
        var params = JSON.stringify({data: data, fileObj: CB.toJSON(this), key: CB.appKey});
        var url = CB.apiUrl + '/file/' + CB.appId;
        var uploadProgressCallback = null;

        if (callback && callback.uploadProgress) {
            uploadProgressCallback = callback.uploadProgress;
        }

        CB._request('POST', url, params, null, null, uploadProgressCallback).then(function(response) {
            thisObj.document = JSON.parse(response);
            delete thisObj.data;
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        }, function(err) {
            if (callback) {
                callback.error(err);
            } else {
                def.reject(err);
            }
        });
    }

    if (!callback) {
        return def.promise;
    }
};

/**
 * Removes a file from Database.
 *
 * @param callback
 * @returns {*}
 */

CB.CloudFile.prototype.delete = function(callback) {
    var def;

    if (!this.url) {
        throw "You cannot delete a file which does not have an URL";
    }
    if (!callback) {
        def = new CB.Promise();
    }
    var thisObj = this;

    var params = JSON.stringify({fileObj: CB.toJSON(thisObj), key: CB.appKey, method: "PUT"});
    var url = CB.apiUrl + '/file/' + CB.appId + '/' + this.document._id;

    CB._request('PUT', url, params).then(function(response) {
        thisObj.url = null;
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    }, function(err) {
        if (callback) {
            callback.error(err);
        } else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def.promise;
    }
};

CB.CloudFile.prototype.getFileContent = function(callback) {

    var def;

    if (!this.url) {
        throw "URL is null. Fetch this file object first using fetch()";
    }
    if (!callback) {
        def = new CB.Promise();
    }

    var params = JSON.stringify({key: CB.appKey});
    var url = this.url;

    CB._request('POST', url, params).then(function(response) {
        if (callback) {
            callback.success(response);
        } else {
            def.resolve(response);
        }
    }, function(err) {
        if (callback) {
            callback.error(err);
        } else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def.promise;
    }
};

export default CB.CloudFile
