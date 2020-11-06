import axios from 'axios';
import async from 'async';
import {saveAs} from 'file-saver';
import {xhrDashBoardClient,xhrAccountsClient} from '../xhrClient';

export const initApp = (appId) => {
    return (dispatch => {

        xhrDashBoardClient
            .get('user')
            .then((userData) => {

                let userProfilePic = null;
                if (userData.data.file)
                    userProfilePic = userData.data.file.document.url;

                dispatch({type: 'FETCH_USER', payload: userData.data});

                xhrDashBoardClient.get('app')
                    .then(data => {

                        let availableApps = data.data
                            .filter(obj => !obj.deleted)
                            .map(app => {
                                return {name: app.name, id: app.appId, keys: app.keys};
                            });

                        if (availableApps.length === 0)
                            window.location.href = DASHBOARD_URL;

                        if (!appId || appId === '' || appId === "" || appId === undefined)
                            window.location.href = FILES_URL + '/' + availableApps[0].id;
                        else {
                            let app = availableApps.filter(obj => (obj.id === appId));

                            if (app.length === 0)   //invalid appId or deleted appId
                                window.location.href = FILES_URL;

                            CB.CloudApp.init(SERVER_URL, appId, app[0].keys.master);

                            dispatch({
                                type: 'APP_INIT_SUCCESS',
                                payload: {
                                    appId: app[0].id,
                                    appName: app[0].name,
                                    allApps: availableApps,
                                    userProfilePic: userProfilePic
                                }
                            });
                            dispatch(getBeacon());
                            dispatch(getNotifications());
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                window.location.href = ACCOUNTS_URL + '/?redirectUrl=' + FILES_URL
            })
    })
};

export function fetchUser() {

    return function (dispatch) {
        xhrDashBoardClient.get('/user').then(response => {
            dispatch({ type: 'FETCH_USER', payload: response.data })
            dispatch(getNotifications())
            dispatch({ type: 'STOP_LOADING' })
        }).catch(error => {
            console.log('fetch user error');
            console.log(error);
        });

    };
}

export const openFile = (data) => {
    return ((dispatch) => {
        var obj = data.fileObj;
        var allowArr = obj.ACL.document || obj.ACL;
        if ((allowArr.read.allow.user).indexOf('all') !== -1) {
            //for public files
            window.open(obj.url, '_blank');
        } else {
            //for private files
            axios({
                method: 'post',
                data: {
                    key: CB.appKey
                },
                url: obj.url,
                withCredentials: false,
                responseType: 'blob'
            }).then(function(res) {
                var blob = res.data;
                var reader = new FileReader();
                var out = new Blob([blob], {type: obj.document.contentType});
                reader.onload = function(e) {
                    window.open(reader.result, '_blank');
                }
                reader.readAsDataURL(out);

            }, function(err) {
                console.log(err);
            });
        }

    });
};

export const deleteFile = (data) => {
 

    return ((dispatch) => {
        let obj = data.fileObj;

        const deleteOptions = {
            success: function (obj) {
                dispatch({ type: "DELETE_FILE", payload: data.id });

            },
            error: function (err) { }
        }

        // Deleting Single File
        if (data.type == 'File') { 
            obj.delete(deleteOptions); 
        }
        // Deleting Folders
        else { 
            let query = new CB.CloudQuery("_File");
            query.startsWith('path', obj.get('path') + "/" + obj.get('name'));

            // Checking folder is empty or not.
            query.find({
                success: function (list) {
                    const isEmptyFolder = list.length === 0

                    if (isEmptyFolder){
                        obj.delete(deleteOptions)
                    } else {
                        // Deleting Folder and all its content.
                        query.delete({
                            success: function (list) {
                                obj.delete(deleteOptions);
                            },
                            error: function (error) {}
                        })
                    }
                },
                error: function (error) {}
            });
        }
    });
}
export const editFile = (data) => {
    return ((dispatch) => {

        let query = new CB.CloudQuery("_File");
        query.findById(data.id, {
            success: function(obj) {
                obj.set('name', data.name);
                obj.save();
            },
            error: function(err) {}
        })
    });
}

export function getBeacon() {
    return function (dispatch) {
        xhrDashBoardClient.get('/beacon/get').then(response => {
            dispatch({type: 'USER_BEACONS', payload: response.data})

        }).catch(error => {
            console.log('fetch beacons error');
            console.log(error);
        });

    };
}

export function updateBeacon(beacons, field) {
    return function (dispatch) {
        if (!beacons[field])
            beacons[field] = true;
        xhrDashBoardClient.post('/beacon/update', beacons).then(response => {
            dispatch({type: 'USER_BEACONS', payload: response.data})

        }).catch(error => {
            console.log('update beacons error');
            console.log(error);
        });

    };
}

export function fetchApps() {

    return function (dispatch) {
        dispatch({type: 'START_LOADING'})

        xhrDashBoardClient.get('app').then(response => {
            dispatch({type: 'FETCH_APPS', payload: response.data});
            dispatch(getBeacon())
            dispatch(getNotifications())
        }).catch(error => {
            console.log('inside fetch Apps error catch error: ');
            console.log(error);
        });

    };
}

export function getNotifications() {
    return function (dispatch) {
        xhrDashBoardClient.get('/notification/0/10').then(response => {
            dispatch({type: 'FETCH_NOTIFICATIONS', payload: response.data})
        }).catch(error => {
            console.log(error);
        })

    }
}

export function updateNotificationsSeen() {
    return function (dispatch) {
        xhrDashBoardClient.get('/notification/seen').then(response => {
            dispatch(getNotifications())
        }).catch(error => {
            console.log(error);
        })

    }
}

export function deleteNotificationById(id) {
    return function (dispatch) {
        xhrDashBoardClient.delete('/notification/' + id).then(response => {
            dispatch(getNotifications())
        }).catch(error => {
            console.log(error);
        })

    }
}

export const logOut = () => {

    return function (dispatch) {
        xhrAccountsClient.post('/user/logout').then(response => {
            dispatch({type: 'LOGOUT'});
        }).catch(error => {
            console.log('inside Logout catch error: ');
            console.log(error);
        });
    };
};


export const downloadFile = (data) => {
    return ((dispatch) => {
        dispatch({type: "DOWNLOADING_FILE"});

        var obj = data.fileObj;

        axios({
            method: 'post',
            data: {
                key: CB.appKey
            },
            url: obj.url,
            withCredentials: false,
            responseType: 'blob'
        }).then(function(res) {
            var blob = res.data;
            dispatch({type: "DOWNLOADING_COMPLETE"});
            saveAs(blob, obj.name);
        }, function(err) {
            console.log(err);
        });

    });
}

export const fetchAllFiles = (data) => {

    let response = [];
    let {path, searchText, regex, skip, fetchMoreFiles} = data;

    if (path.endsWith('/'))
        path = path.slice(0, path.length - 1)
    var query = new CB.CloudQuery("_File");
    if (searchText)
        query.regex('name', '(.*)' + searchText + '(.*)', true);
    if (!regex)
        regex = '(.*)';
    query.regex('contentType', regex, true);

    return ((dispatch) => {
        dispatch({type: "FETCHING_ALL_FILES"});
        query.equalTo('path', path);
        query.setLimit(999999999);
        query.count({
            success: function(number) {
                dispatch({
                    type: 'TOTAL_FILES',
                    payload: Math.ceil(number / 20)
                })
            },
            error: function(error) {
                //error
            }
        });
        if (!skip)
            skip = 1;
        query.setSkip((skip - 1) * 20)
        query.setLimit(20);
        query.orderByDesc('createdAt');
        query.find({
            success: function(files) {
                files.forEach((cloudFile) => {
                    let file = cloudFile.document;
                    let date = new Date(parseInt(file.createdAt));
                    const modified = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
                    response.push({
                        id: file._id,
                        url: file.url,
                        title: file.name,
                        modified: modified,
                        type: file.contentType == 'folder/folder'
                            ? 'Folder'
                            : 'File',
                        img: imagePath(file.contentType, file.name),
                        fileObj: cloudFile
                    })
                });
                dispatch({
                    type: "FETCH_ALL_FILES",
                    payload: {
                        data: response,
                        fetchMoreFiles: fetchMoreFiles,
                        selectedPage: skip,
                        regex: regex
                    }
                })

            },
            error: function(error) {}
        });

    })

}
export const addFile = (payload) => {
    return ((dispatch) => {

        let {file, data, type, path} = payload;
        let length = file.length;
        let filesUploaded = [];
        let filesUploading = file.slice();
        if (path.endsWith('/'))
            path = path.slice(0, path.length - 1)
        if (type != 'folder/folder')
            dispatch({type: "UPLOADING_FILES"});
        async.eachSeries(file, function(fileObj, done) {
            let cloudFile = new CB.CloudFile(fileObj, data, type, path);
            cloudFile.save({
                success: function(cloudFile) {
                    length--;
                    filesUploaded.push(cloudFile.document);
                    filesUploading.splice(0, 1);
                    dispatch({type: "FILES_UPLOADED", payload: filesUploaded})
                    if (length == 0)
                        dispatch({type: "ADD_FILE_SUCCESS"})
                    done();

                },
                error: function(error) {
                    length--;
                    if (length == 0)
                        dispatch({type: "ADD_FILE_SUCCESS"})
                },
                uploadProgress: function(percentComplete) {
                    dispatch({
                        type: 'UPLOAD_PROGRESS',
                        payload: {
                            uploadProgress: parseInt(percentComplete * 100),
                            file: fileObj,
                            up: filesUploading,
                            remainingFiles: length,
                            totalFiles: file.length
                        }
                    });
                }
            });

        }, function(err) {
            if (err) {
                throw err;
            }
            dispatch({type: 'UPLOADING_DONE'});
            dispatch(fetchAllFiles({path: path}));
        });
    })
}

export const sortDocuments = (data) => {
    return ({type: 'SORT_DOCUMENTS', payload: data});
}


export function changeState(where, openDrawer = false) {
    return function (dispatch) {
        dispatch({type: 'TOGGLE_DRAWER', payload: {openDrawer: false}});
        if (where === "cbapi")
            dispatch({
                type: 'MiGRATE_AND_TOGGLE',
                payload: {openDrawer: true, migrateTo: where}
            });
        else {
            if (openDrawer === true)
                dispatch({
                    type: 'MiGRATE_AND_TOGGLE',
                    payload: {openDrawer: true, migrateTo: where}
                });
            else
                dispatch({type: 'MiGRATE_AND_TOGGLE', payload: {migrateTo: where}})
            ;
        }
    };
}

export function toggleDrawer(toggle) {
    return function (dispatch) {
        dispatch({type: 'TOGGLE_DRAWER', payload: {openDrawer: toggle}});
    };
}

/*
desc : return path of image depending on file type;
*/

function imagePath(type, name) {
    let img = "src/assets/file-types/file.png";
    const fileType = type.split('/')[1];
    let fileTypes = 'after-effects.pngai.pngaudition.pngavi.pngbridge.pngcss.pngcsv.pngdbf.pngdoc.pngdreamweaver.pngdwg.pngexe.pngfile.pngfireworks.pngfla.pngflash.pnghtml.pngillustrator.pngindesign.pngiso.pngjavascript.pngjpg.pngjson-file.pngmp3.pngmp4.pngpdf.pngphotoshop.pngpng.pngppt.pngprelude.pngpremiere.pngpsd.pngrtf.pngsearch.pngsvg.pngtxt.pngxls.pngxml.pngzip-1.pngzip.pngfolder.pngjpeg.pngdocx.png';
    fileTypes = fileTypes.split('.png');
    if (fileTypes.indexOf(fileType) != -1) {
        img = 'src/assets/file-types/' + fileType + '.png';
    } else if (fileTypes.indexOf(name.split('.')[1]) != -1) {
        img = 'src/assets/file-types/' + name.split('.')[1] + '.png';
    }
    return img;
}

export function saveUserImage(file) {

    return function (dispatch) {
        dispatch({ type: 'START_LOADING' })
        let fd = new FormData()
        fd.append('file', file)
        xhrDashBoardClient.post('/file', fd).then((data) => {
            dispatch(fetchUser())
        }, (err) => {
            console.log(err)
        })
    }
}

export function deleteUserImage(fileId) {

    return function (dispatch) {
        dispatch({ type: 'START_LOADING' })
        xhrDashBoardClient.delete('/file/' + fileId).then((data) => {
            dispatch(fetchUser())
        }, (err) => {
            console.log(err)
        })
    }
}

export function showAlert(type, text) {

    Messenger().post({
        message: text,
        type: type || 'error',
        showCloseButton: true
    });
}

export function updateUser(name, oldPassword, newPassword) {

    let newData = {}
    newData.name = name
    newData.oldPassword = oldPassword
    newData.newPassword = newPassword
    return xhrDashBoardClient.post('/user/update', newData, { timeout: 2000 })

}