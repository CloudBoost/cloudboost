describe("CloudUser", function () {
    var username = util.makeString();
    var passwd = "abcd";


    it("Should create new user", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var obj = new CB.CloudUser();
        obj.set('username', username);
        obj.set('password', passwd);
        obj.set('email', util.makeEmail());
        obj.signUp().then(function (list) {
            if (list.get('username') === username) {
                done();
            }
            else {
                throw "create user error"
            }
        }, function (error) {
            throw error;
        });
    });

    it("Should create new user and change the password.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var oldPassword = passwd;

        var obj = new CB.CloudUser();
        obj.set('username', username + "1");
        obj.set('password', oldPassword);
        obj.set('email', util.makeEmail());
        obj.signUp().then(function (list) {
            if (list.get('username'))
                CB.CloudUser.current.changePassword(oldPassword, 'newPassword', {
                    success: function (user) {
                        done();
                    }, error: function (error) {
                        done(error);
                    }
                });
            else
                done("create user error");
        }, function (error) {
            throw error;
        });

    });

    it('Should save a CloudUser and then login', function(done){


        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(50000);

        var user = new CB.CloudUser();
        user.set('username', 'randomUsername');
        user.set('password', 'password');
        user.set('email', 'random-email@email.com');
        user.save().then(function(){
            var newUser = new CB.CloudUser();
            newUser.set('username', 'randomUsername');
            newUser.set('password', 'password');
            newUser.set('email', 'random-email@email.com');
            newUser.logIn().then(function(){
                done();
            }, function(error){
                done("Cannot log in")
            });
        }, function(error){
            done("Cannot save a user.")
        })

    });

    it("Should create new user, change the password and log in.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var oldPassword = passwd;

        var obj = new CB.CloudUser();
        obj.set('username', username + "123");
        obj.set('password', oldPassword);
        obj.set('email', util.makeEmail());
        obj.signUp().then(function (list) {
            if (list.get('username'))
                CB.CloudUser.current.changePassword(oldPassword, 'newPassword', {
                    success: function (user) {
                        CB.CloudUser.current.logOut({
                            success: function () {
                              obj.set('password','newPassword');
                               obj.logIn( {
                                    success: function () {
                                        done();
                                    }, error: function (err) {
                                        done("Error signing in.")
                                    }
                                });
                            }, error: function () {
                                done("Cannot log out");
                            }
                        })
                    }, error: function (error) {
                        done(error);
                    }
                });
            else
                done("create user error");
        }, function (error) {
            throw error;
        });

    });


    it("Should not reset the password when old password is wrong.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var oldPassword = passwd;

        var obj = new CB.CloudUser();
        obj.set('username', username + "2");
        obj.set('password', oldPassword);
        obj.set('email', util.makeEmail());
        obj.signUp().then(function (list) {
            if (list.get('username'))
                CB.CloudUser.current.changePassword("sample", 'newPassword', {
                    success: function (user) {
                        done("Password reset with old password is wrong.");
                    }, error: function (error) {
                        done();
                    }
                });
            else
                done("create user error");
        }, function (error) {
            throw error;
        });

    });


    it("Should not reset the password when user is logged in.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        CB.CloudUser.current.logOut({
            success: function () {
                try {
                    CB.CloudUser.current.changePassword("sample", 'newPassword', {
                        success: function (user) {
                            done("Password reset when user is not logged in.");
                        }, error: function (error) {
                            done();
                        }
                    });
                } catch (e) {
                    done();
                }
            }, error: function (error) {
                done("Failed to log out a user. ")
            }
        });
    });

    it("Should not reset Password when user is logged in.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var obj = new CB.CloudUser();
        obj.set('username', "911@cloudboost.io");
        obj.set('password', passwd);
        obj.set('email', "911@cloudboost.io");
        obj.signUp().then(function (list) {
            if (list.get('username') === "911@cloudboost.io")
                CB.CloudUser.resetPassword("911@cloudboost.io", {
                    success: function () {
                        CB.CloudUser.current.logOut({
                            success: function () {
                                done("Reset password called when the user is logged in.");
                            }, error: function () {
                                done("Reset password called when the user is logged in.");
                            }
                        });
                        done("Reset password when the user is logged in.");
                    }, error: function (error) {
                        CB.CloudUser.current.logOut({
                            success: function () {
                                done();
                            }, error: function () {
                                done("Failed to log out.");
                            }
                        });
                    }
                });
            else
                throw "create user error"
        }, function (error) {
            throw error;
        });

    });

    it("Should reset Password", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);
        CB.CloudUser.resetPassword("911@cloudboost.io", {
            success: function () {
                done()
            }, error: function (error) {
                done();
            }
        });
    });


    it("Should create a user and get version", function (done) {

        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(30000);
        var user = new CB.CloudUser();
        var usrname = util.makeString();
        var passwd = "abcd";
        user.set('username', usrname);
        user.set('password', passwd);
        user.set('email', util.makeEmail());
        user.signUp().then(function (list) {
            if (list.get('username') === usrname && list.get('_version') >= 0) {
                done();
            }
            else
                throw "create user error"
        }, function () {
            throw "user create error";
        });
    });

    it("should do a query on user", function (done) {


        if (CB._isNode) {
            done();
            return;
        }


        this.timeout(30000);
        var user = new CB.CloudUser();
        var usrname = util.makeString();
        var passwd = "abcd";
        user.set('username', usrname);
        user.set('password', passwd);
        user.set('email', util.makeEmail());
        user.signUp().then(function (list) {
            if (list.get('username') === usrname && list.get('_version') >= 0) {
                var query = new CB.CloudQuery('User');
                query.findById(user.get('id')).then(function (obj) {

                    done();
                }, function (err) {

                });
            }
            else
                throw "create user error"
        }, function () {
            throw "user create error";
        });

    });

    it('should logout the user', function (done) {

        if (CB._isNode) {
            done();
            return;
        }


        this.timeout(30000);
        CB.CloudUser.current.logOut().then(function () {
            done();
        }, function () {
            throw "err";
        });
    });


    it("Should login user", function (done) {

        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(30000);

        var obj = new CB.CloudUser();
        obj.set('username', username);
        obj.set('password', passwd);
        obj.logIn().then(function (list) {
            if (list.get("username") === username)
                done();
        }, function () {
            throw "user login error";
        });

    });

    var roleName2 = util.makeString();
    var role1 = new CB.CloudRole(roleName2);
    role1.set('name', roleName2);

    it("Should assign role to user", function (done) {

        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(400000);

        var obj = new CB.CloudUser();
        obj.set('username', username);
        obj.set('password', passwd);
        obj.logIn().then(function (loggedUser) {
            role1.save().then(function (role) {
                loggedUser.addToRole(role).then(function (savedUser) {

                    var query = new CB.CloudQuery("User");
                    query.equalTo('username', username);
                    query.find({
                        success: function (list) {
                            list = list[0];

                            if (list && list.get("roles")) {
                                var rolesList = list.get("roles");
                                var userRoleIds = [];
                                for (var i = 0; i < rolesList.length; ++i) {
                                    userRoleIds.push(rolesList[i].document._id);
                                }

                                if (userRoleIds.indexOf(role.document._id) > -1) {
                                    done();
                                } else {
                                    done("addToRole failed");
                                }
                            }
                        },
                        error: function (error) {
                            done(error);
                        }
                    });

                }, function (error) {
                    throw error;
                });
            }, function (error) {
                throw error;
            });
        }, function () {
            throw "role create error";
        })

    });

    it("Should remove role assigned role to user", function (done) {

        if (CB._isNode) {
            done();
            return;
        }


        this.timeout(4000000);

        var obj = new CB.CloudUser();
        var roleName3 = util.makeString();
        var role2 = new CB.CloudRole(roleName3);
        role2.set('name', roleName3);
        obj.set('username', username);
        obj.set('password', passwd);
        obj.logIn().then(function (loggedUser) {

            role2.save().then(function (role2) {
                loggedUser.addToRole(role2).then(function (list) {

                    CB.CloudUser.current.removeFromRole(role2).then(function () {

                        var query = new CB.CloudQuery("User");
                        query.equalTo('username', username);
                        query.find({
                            success: function (list) {
                                list = list[0];

                                if (list && list.get("roles")) {
                                    var rolesList = list.get("roles");
                                    var userRoleIds = [];
                                    for (var i = 0; i < rolesList.length; ++i) {
                                        userRoleIds.push(rolesList[i].document._id);
                                    }

                                    if (userRoleIds.indexOf(role2.document._id) < 0) {
                                        done();
                                    } else {
                                        done("removeFromRole failed");
                                    }
                                }
                            },
                            error: function (error) {
                                done(error);
                            }
                        });

                    }, function (error) {
                        done(error);
                    });
                }, function (error) {
                    done(error);
                });
            }, function (error) {
                done(error);
            });
        }, function (error) {
            done(error);
        });

    });


    it("Should check isInRole", function (done) {

        if (CB._isNode) {
            done();
            return;
        }


        this.timeout(4000000);

        var obj = new CB.CloudUser();
        var roleName3 = util.makeString();
        var role2 = new CB.CloudRole(roleName3);
        role2.set('name', roleName3);
        obj.set('username', username);
        obj.set('password', passwd);
        obj.logIn().then(function (loggedUser) {

            role2.save().then(function (role2) {
                loggedUser.addToRole(role2).then(function (list) {

                    var query = new CB.CloudQuery("User");
                    query.equalTo('username', username);
                    query.find({
                        success: function (list) {
                            list = list[0];

                            obj.set("roles", list.get("roles"));

                            if (CB.CloudUser.current.isInRole(role2)) {
                                done();
                            } else {
                                done("isInRole Failed..");
                            }

                        },
                        error: function (error) {
                            done(error);
                        }
                    });

                }, function (error) {
                    done(error);
                });
            }, function (error) {
                done(error);
            });
        }, function (error) {
            done(error);
        });

    });


    it('should encrypt user password', function (done) {

        this.timeout(300000);

        var pass = passwd;

        var obj = new CB.CloudUser();
        obj.set('username', util.makeString());
        obj.set('password', pass);
        obj.set('email', util.makeEmail());
        obj.save().then(function (obj) {
            if (obj.get('password') === pass)
                throw "Password is not encrypted.";
            else
                done();
        }, function (err) {
            throw "user create error";
        });

    });

    it("Should Create a New User", function (done) {

        this.timeout(30000);

        var obj = new CB.CloudUser();
        obj.set('username', util.makeString());
        obj.set('email', util.makeEmail());
        obj.set('password', 'pass');
        obj.save().then(function (res) {
            var query = new CB.CloudQuery('User');
            query.get(res.get('id')).then(function (res1) {
                if (res1) {
                    done();
                } else {
                    throw "Unable to retrieve User";
                }
            }, function () {
                throw "Unable to Get User By ID";
            })
        }, function (err) {
            throw "Unable to Create User";
        });
    });

    it("Should Create a New User", function (done) {

        this.timeout(30000);

        var obj = new CB.CloudUser();
        obj.set('username', util.makeString());
        obj.set('email', util.makeEmail());
        obj.set('password', 'pass');
        obj.save().then(function (res) {
            var query = new CB.CloudQuery('User');
            query.get(res.get('id')).then(function (res1) {
                if (res1) {
                    done();
                } else {
                    throw "Unable to retrieve User";
                }
            }, function () {
                throw "Unable to Get User By ID";
            })
        }, function (err) {
            throw "Unable to Create User";
        });
    });

    it("Should Create a New User", function (done) {

        this.timeout(30000);

        var obj = new CB.CloudUser();
        obj.set('username', util.makeString());
        obj.set('email', util.makeEmail());
        obj.set('password', 'pass');
        obj.save().then(function (res) {
            var query = new CB.CloudQuery('User');
            query.get(res.get('id')).then(function (res1) {
                if (res1) {
                    done();
                } else {
                    throw "Unable to retrieve User";
                }
            }, function () {
                throw "Unable to Get User By ID";
            })
        }, function (err) {
            throw "Unable to Create User";
        });
    });

    it('should logout the user', function (done) {

        if (CB._isNode) {
            done();
            return;
        }


        this.timeout(30000);
        CB.CloudUser.current.logOut().then(function () {
            done();
        }, function () {
            throw "err";
        });
    });

    it("should send a Reset Email with Email Settings with default Template.", function (done) {
        this.timeout(100000);
        var url = URL + '/settings/' + CB.appId + "/email";

        var emailSettings = {
            mandrill: {
                apiKey: null,
                enabled: true
            },
            mailgun: {
                apiKey: "key-f66ed97c75c75cf864990730517d0445",
                domain: "cloudboost.io",
                enabled: true
            },
            fromEmail: "test@cloudboost.io",
            fromName: "CloudBoost.io"
        };

        emailSettings = JSON.stringify(emailSettings);


        var params = {};
        params.key = CB.masterKey;
        params.settings = emailSettings;

        function createUserAndSendResetPassword() {
            //Create cloudUser
            var obj = new CB.CloudUser();
            obj.set('username', "Flower");
            obj.set('password', passwd);
            obj.set('email', "support@cloudboost.io");

            obj.save({
                success: function (newObj) {
                    CB.CloudUser.resetPassword("support@cloudboost.io", {
                        success: function (resp) {
                            done();
                        }, error: function (error) {
                            done(error);
                        }
                    });
                }, error: function (err) {
                    done(err);
                }
            });
        }

        if (!window) {
            //Lets configure and request
            request({
                url: url, //URL to hit
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                } else {
                    createUserAndSendResetPassword();
                }
            });
        } else {
            $.ajax({

                // The URL for the request
                url: url,
                // The data to send (will be converted to a query string)
                data: params,
                // Whether this is a POST or GET request
                type: "PUT",
                // The type of data we expect back
                dataType: "json",
                // Code to run if the request succeeds;
                // the response is passed to the function
                success: function (json) {
                    if (json.category === "email") {
                        createUserAndSendResetPassword();
                    } else {
                        done("Wrong json.");
                    }
                },
                // Code to run if the request fails; the raw request and
                // status codes are passed to the function
                error: function (xhr, status, errorThrown) {
                    done("Error thrown.");
                },

            });
        }
    });


    it("should send a Reset Email with email Template with no Email Settings.", function (done) {
        this.timeout(100000);
        var url = URL + '/settings/' + CB.appId + "/auth";

        var authSettings = {
            general: {
                enabled: true,
                callbackURL: null,
                primaryColor: "#549afc"
            },
            custom: {
                enabled: true
            },
            signupEmail: {
                enabled: false,
                allowOnlyVerifiedLogins: false,
                template: ""
            },
            resetPasswordEmail: {
                enabled: false,
                template: "<h3>TEST(No email Setting only template):Forgot your password? We're there to help.</h3><p>Hi <span class='username></span></p><p>ease click on the button below which will help you reset your password and once you're done, You're good to go!</p><a class='link'></a><p>If you need any help, Just reply to this email and we'll be there to help.</p><p>Thanks, have a great day.</p><p>CloudBoost.io Team</p>"
            }
        };


        authSettings = JSON.stringify(authSettings);

        var params = {};
        params.key = CB.masterKey;
        params.settings = authSettings;

        function createUserAndSendResetPassword() {
            //Create cloudUser
            var obj = new CB.CloudUser();
            obj.set('username', "Tree");
            obj.set('password', passwd);
            obj.set('email', "contact@cloudboost.io");

            obj.save({
                success: function (newObj) {
                    CB.CloudUser.resetPassword("contact@cloudboost.io", {
                        success: function (resp) {
                            done();
                        }, error: function (error) {
                            done(error);
                        }
                    });
                }, error: function (err) {
                    done(err);
                }
            });
        }

        if (!window) {
            //Lets configure and request
            request({
                url: url, //URL to hit
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                } else {
                    createUserAndSendResetPassword();
                }
            });
        } else {
            $.ajax({

                // The URL for the request
                url: url,
                // The data to send (will be converted to a query string)
                data: params,
                // Whether this is a POST or GET request
                type: "PUT",
                // The type of data we expect back
                dataType: "json",
                // Code to run if the request succeeds;
                // the response is passed to the function
                success: function (json) {
                    if (json.category === "auth") {
                        createUserAndSendResetPassword();
                    } else {
                        done("Wrong json.");
                    }
                },
                // Code to run if the request fails; the raw request and
                // status codes are passed to the function
                error: function (xhr, status, errorThrown) {
                    done("Error thrown.");
                },

            });
        }
    });

    it("Should create new user and should fail to login without verified.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var url = URL + '/settings/' + CB.appId + "/auth";

        var authSettings = {
            general: {
                enabled: true,
                callbackURL: "http://cloudboost.io",
                primaryColor: "#549afc"
            },
            custom: {
                enabled: true
            },
            signupEmail: {
                enabled: true,
                allowOnlyVerifiedLogins: true,
                template: "<h3>TEST(No email Setting only template):Signup? We're there to help.</h3><p>Hi <span class='username></span></p><p>ease click on the button below which will help you reset your password and once you're done, You're good to go!</p><a class='link'></a><p>If you need any help, Just reply to this email and we'll be there to help.</p><p>Thanks, have a great day.</p><p>CloudBoost.io Team</p>"
            },
            resetPasswordEmail: {
                enabled: false,
                template: null
            }
        };

        authSettings = JSON.stringify(authSettings);

        var params = {};
        params.key = CB.masterKey;
        params.settings = authSettings;

        function signupandlogin() {
            var oldPassword = passwd;
            var obj = new CB.CloudUser();
            obj.set('username', username + "19");
            obj.set('password', oldPassword);
            obj.set('email', util.makeEmail());
            obj.signUp().then(function (list) {

                var obj = new CB.CloudUser();
                obj.set('username', username + "19");
                obj.set('password', oldPassword);
                obj.logIn().then(function (user) {
                    done("User logged in without verification");
                }, function (error) {
                    done();
                });

            }, function (error) {
                throw error;
            });
        }

        if (!window) {
            //Lets configure and request
            request({
                url: url, //URL to hit
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                } else {
                    signupandlogin();
                }
            });
        } else {
            $.ajax({

                // The URL for the request
                url: url,
                // The data to send (will be converted to a query string)
                data: params,
                // Whether this is a POST or GET request
                type: "PUT",
                // The type of data we expect back
                dataType: "json",
                // Code to run if the request succeeds;
                // the response is passed to the function
                success: function (json) {
                    if (json.category === "auth") {
                        signupandlogin();
                    } else {
                        done("Wrong json.");
                    }
                },
                // Code to run if the request fails; the raw request and
                // status codes are passed to the function
                error: function (xhr, status, errorThrown) {
                    done("Error thrown.");
                },

            });
        }


    });

    it("Should nullify the auth custom settings.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var url = URL + '/settings/' + CB.appId + "/auth";

        var authSettings = {
            general: {
                enabled: true,
                callbackURL: "http://cloudboost.io",
                primaryColor: "#549afc"
            },
            custom: {
                enabled: true
            },
            signupEmail: {
                enabled: false,
                allowOnlyVerifiedLogins: false,
                template: null
            },
            resetPasswordEmail: {
                enabled: false,
                template: null
            }
        };

        authSettings = JSON.stringify(authSettings);

        var params = {};
        params.key = CB.masterKey;
        params.settings = authSettings;

        if (!window) {
            //Lets configure and request
            request({
                url: url, //URL to hit
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                } else {
                    done();
                }
            });
        } else {
            $.ajax({

                // The URL for the request
                url: url,
                // The data to send (will be converted to a query string)
                data: params,
                // Whether this is a POST or GET request
                type: "PUT",
                // The type of data we expect back
                dataType: "json",
                // Code to run if the request succeeds;
                // the response is passed to the function
                success: function (json) {
                    if (json.category === "auth") {
                        done();
                    } else {
                        done("Wrong json.");
                    }
                },
                // Code to run if the request fails; the raw request and
                // status codes are passed to the function
                error: function (xhr, status, errorThrown) {
                    done("Error thrown.");
                },

            });
        }


    });

});