import CB from './CB'
/*
 CloudUser
 */

class CloudUser {
    constructor() {
        if (!this.document)
            this.document = {};
        this.document._tableName = 'User';
        this.document.expires = null;
        this.document._type = 'user';
        this.document.expires = null;
        this.document.ACL = new CB.ACL();
        this.document._isModified = true;
        this.document._modifiedColumns = ['createdAt', 'updatedAt', 'ACL', 'expires'];
    };
}

CB.CloudUser = CB.CloudUser || CloudUser

//Description  : This function gets the current user from the server by taking the sessionId from querystring.
//Params :
//returns : CloudUser object if the current user is still in session or null.
CB.CloudUser.getCurrentUser = function(callback) {

    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    //now call the signup API.
    var params = JSON.stringify({key: CB.appKey});

    var url = CB.apiUrl + "/user/" + CB.appId + "/currentUser";

    CB._request('POST', url, params).then(function(response) {
        var user = response;
        if (response) {
            try {
                user = new CB.CloudUser();
                CB.fromJSON(JSON.parse(response), user);
                CB.CloudUser.current = user;
                CB.CloudUser._setCurrentUser(user);
            } catch (e) {}
        }

        if (callback) {
            callback.success(user);
        } else {
            def.resolve(user);
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

//Private Static fucntions

//Description  : This function gets the current user from the cookie or from local storage.
//Params :
//returns : CloudUser object if the current user is still in session or null.
CB.CloudUser._getCurrentUser = function() {
    var content = CB._getCookie("CBCurrentUser");
    if (content && content.length > 0) {
        return CB.fromJSON(JSON.parse(content));
    } else {
        return null;
    }
};

//Description  : This function saves the current user to the cookie or to local storage.
//Params : @user - Instance of CB.CloudUser Object.
//returns : void.
CB.CloudUser._setCurrentUser = function(user) {
    //save the user to the cookie.
    if (!user) {
        return;
    }

    //expiration time of 30 days.
    CB._createCookie("CBCurrentUser", JSON.stringify(CB.toJSON(user)), 30 * 24 * 60 * 60 * 1000);
};

//Description  : This function saves the current user to the cookie or to local storage.
//Params : @user - Instance of CB.CloudUser Object.
//returns : void.
CB.CloudUser._removeCurrentUser = function() {
    //save the user to the cookie.
    CB._deleteCookie("CBCurrentUser");
};

CB.CloudUser.resetPassword = function(email, callback) {

    if (!email) {
        throw "Email is required.";
    }

    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    //now call the signup API.
    var params = JSON.stringify({email: email, key: CB.appKey});

    var url = CB.apiUrl + "/user/" + CB.appId + "/resetPassword";

    CB._request('POST', url, params).then(function(response) {
        if (callback) {
            callback.success();
        } else {
            def.resolve();
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

CB.CloudUser.prototype = Object.create(CB.CloudObject.prototype);

Object.defineProperty(CB.CloudUser.prototype, 'username', {
    get: function() {
        return this.document.username;
    },
    set: function(username) {
        this.document.username = username;
        CB._modified(this, 'username');
    }
});
Object.defineProperty(CB.CloudUser.prototype, 'password', {
    get: function() {
        return this.document.password;
    },
    set: function(password) {
        this.document.password = password;
        CB._modified(this, 'password');
    }
});
Object.defineProperty(CB.CloudUser.prototype, 'email', {
    get: function() {
        return this.document.email;
    },
    set: function(email) {
        this.document.email = email;
        CB._modified(this, 'email');
    }
});

CB.CloudUser.current = CB.CloudUser._getCurrentUser();

CB.CloudUser.prototype.signUp = function(callback) {

    // check if node env but not native, this method wont execute for node env's
    if (CB._isNode && !CB._isNative) {
        throw "Error : You cannot signup the user on the server. Use CloudUser.save() instead.";
    }

    if (!this.document.username) {
        throw "Username is not set.";
    }
    if (!this.document.password) {
        throw "Password is not set.";
    }
    if (!this.document.email) {
        throw "Email is not set.";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the signup API.
    var params = JSON.stringify({document: CB.toJSON(thisObj), key: CB.appKey});
    var url = CB.apiUrl + "/user/" + CB.appId + "/signup";

    CB._request('POST', url, params).then(function(user) {

        var response = null;
        if (user && user != "") {
            CB.fromJSON(JSON.parse(user), thisObj);
            CB.CloudUser.current = thisObj;
            CB.CloudUser._setCurrentUser(thisObj);
            response = thisObj;

            (function(thisObj) {
                setTimeout(function() {
                    CB.CloudEvent.track('Signup', {
                        username: thisObj.username,
                        email: thisObj.email
                    });
                }, 1000)
            })(thisObj)

        }

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

CB.CloudUser.prototype.changePassword = function(oldPassword, newPassword, callback) {

    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the signup API.
    var params = JSON.stringify({oldPassword: oldPassword, newPassword: newPassword, key: CB.appKey});

    var url = CB.apiUrl + "/user/" + CB.appId + "/changePassword";

    CB._request('PUT', url, params).then(function(response) {
        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response), thisObj));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response), thisObj));
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

CB.CloudUser.prototype.logIn = function(callback) {

    // check if node env but not native, this method wont execute for node env's
    if (CB._isNode && !CB._isNative) {
        throw "Error : You cannot login the user on the server.";
    }

    if (!this.document.username) {
        throw "Username is not set.";
    }
    if (!this.document.password) {
        throw "Password is not set.";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the signup API.
    var params = JSON.stringify({document: CB.toJSON(thisObj), key: CB.appKey});
    var url = CB.apiUrl + "/user/" + CB.appId + "/login";

    CB._request('POST', url, params).then(function(response) {
        thisObj = CB.fromJSON(JSON.parse(response), thisObj);
        CB.CloudUser.current = thisObj;
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
        CB.CloudUser._setCurrentUser(thisObj);
        CB.CloudEvent.track('Login', {
            username: thisObj.username,
            email: thisObj.email
        });
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

CB.CloudUser.authenticateWithProvider = function(dataJson, callback) {

    // check if node env but not native, this method wont execute for node env's
    if (CB._isNode && !CB._isNative) {
        throw "Error : You cannot login the user on the server.";
    }

    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    if (!dataJson) {
        throw "data object is null.";
    }

    if (dataJson && (!dataJson.provider)) {
        throw "provider is not set.";
    }

    if (dataJson && (!dataJson.accessToken)) {
        throw "accessToken is not set.";
    }

    if (dataJson.provider.toLowerCase() === "twiter" && !dataJson.accessSecret) {
        throw "accessSecret is required for provider twitter.";
    }

    var params = JSON.stringify({provider: dataJson.provider, accessToken: dataJson.accessToken, accessSecret: dataJson.accessSecret, key: CB.appKey});

    var url = CB.apiUrl + "/user/" + CB.appId + "/loginwithprovider";

    CB._request('POST', url, params).then(function(response) {
        var user = response;
        if (response) {
            try {
                user = new CB.CloudUser();
                CB.fromJSON(JSON.parse(response), user);
                CB.CloudUser.current = user;
                CB.CloudUser._setCurrentUser(user);
            } catch (e) {}
        }

        if (callback) {
            callback.success(user);
        } else {
            def.resolve(user);
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

CB.CloudUser.prototype.logOut = function(callback) {

    // check if node env but not native, this method wont execute for node env's
    if (CB._isNode && !CB._isNative) {
        throw "Error : You cannot logOut the user on the server.";
    }

    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the logout API.
    var params = JSON.stringify({document: CB.toJSON(thisObj), key: CB.appKey});
    var url = CB.apiUrl + "/user/" + CB.appId + "/logout";

    CB._request('POST', url, params).then(function(response) {
        CB.fromJSON(JSON.parse(response), thisObj);
        CB.CloudUser.current = null;
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
        CB.CloudUser._removeCurrentUser();
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
CB.CloudUser.prototype.addToRole = function(role, callback) {
    if (!role) {
        throw "Role is null";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    //Call the addToRole API
    var params = JSON.stringify({user: CB.toJSON(thisObj), role: CB.toJSON(role), key: CB.appKey});
    var url = CB.apiUrl + "/user/" + CB.appId + "/addToRole";

    CB._request('PUT', url, params).then(function(response) {
        CB.fromJSON(JSON.parse(response), thisObj);
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
CB.CloudUser.prototype.isInRole = function(role) {
    if (!role) {
        throw "role is null";
    }

    var roleArray = this.get('roles');
    var userRoleIds = [];

    if (roleArray && roleArray.length > 0) {
        for (var i = 0; i < roleArray.length; ++i) {
            userRoleIds.push(roleArray[i].document._id);
        }
    }

    return (userRoleIds.indexOf(role.document._id) >= 0);
};

CB.CloudUser.prototype.removeFromRole = function(role, callback) {
    if (!role) {
        throw "Role is null";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the removeFromRole API.
    var params = JSON.stringify({user: CB.toJSON(thisObj), role: CB.toJSON(role), key: CB.appKey});
    var url = CB.apiUrl + "/user/" + CB.appId + "/removeFromRole";

    CB._request('PUT', url, params).then(function(response) {
        CB.fromJSON(JSON.parse(response), thisObj);
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

export default CB.CloudUser
