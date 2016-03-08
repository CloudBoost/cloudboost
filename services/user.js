var crypto = require('crypto');
var q = require('q');
var Collections = require('../database-connect/collections.js');
var jsdom = require("jsdom");
var fs = require("fs");


module.exports = function() {

	return {
		
		login: function(appId, username, password, accessList, isMasterKey) {
			var deferred = q.defer();
			global.customService.findOne(appId, Collections.User, {
				username: username
			},null,null,null,accessList).then(function(user) {
				if (!user) {
					deferred.reject('Invalid Username');
					return;
                }

				var encryptedPassword = crypto.pbkdf2Sync(password, global.keys.secureKey, 10000, 64).toString('base64');
				if (encryptedPassword === user.password) { //authenticate user.
					deferred.resolve(user);
				} else {
					deferred.reject('Invalid Password');
				}
				
			}, function(error) {
				deferred.reject(error);
            });

			return deferred.promise;
		},
        
        changePassword: function(appId, userId, oldPassword, newPassword, accessList, isMasterKey) {
			var deferred = q.defer();
			global.customService.findOne(appId, Collections.User, {
				_id: userId
			},null,null,null,accessList, isMasterKey).then(function(user) {
				if (!user) {
					deferred.reject('Invalid User');
					return;
                }

				var encryptedPassword = crypto.pbkdf2Sync(oldPassword, global.keys.secureKey, 10000, 64).toString('base64');
				if (encryptedPassword === user.password) { //authenticate user.
					 user.password = crypto.pbkdf2Sync(newPassword, global.keys.secureKey, 10000, 64).toString('base64');
				     global.mongoService.document.save(appId,  [{document:user}]).then(function(document) {
                        deferred.resolve(user); //returns no. of items matched
                     }, function(error) {
                        deferred.reject(error);
                     });
                } else {
					deferred.reject('Invalid Old Password');
				}
			}, function(error) {
				deferred.reject(error);
            });

			return deferred.promise;
		},
        
        /*Desc   : Reset Password
	      Params : appId, email, accessList, masterKey
	      Returns: Promise
	               Resolve->Mail Sent successfully
	               Reject->Error on find User or No user or sendResetPassword()
	    */        
        resetPassword: function(appId, email, accessList, isMasterKey){
            var deferred = q.defer();
			
            global.customService.findOne(appId, Collections.User, {
				email: email
			},null,null,null,accessList, isMasterKey).then(function(user) {
				if (!user) {
					return deferred.reject("User with email "+email+" not found.");					
				}
				
				console.log("User with "+email+" found");
            
                //Send an email to reset user password here. 
                var passwordResetKey = crypto.createHmac('sha256', global.keys.secureKey)
                                        .update(user.password)
                                        .digest('hex');
                                      
               	global.mailService.sendResetPassword(appId, email, "Reset your password",null, null,user,passwordResetKey).then(function(resp){
                   deferred.resolve(resp);
                }, function(error){
                    deferred.reject(error);
                });

                
			}, function(error) {
				deferred.reject(error);
			});
			
			return deferred.promise;
        },
        
        resetUserPassword: function(appId, email, newPassword, resetKey, accessList, isMasterKey){
            var deferred = q.defer();
			
            global.customService.findOne(appId, Collections.User, {
				email: email
			},null,null,null,accessList, true).then(function(user) {
				if (!user) {
					deferred.reject("User with email "+email+" not found.");
					return;
				}
                //Send an email to reset user password here. 
                var passwordResetKey = crypto.createHmac('sha256', global.keys.secureKey)
                   .update(user.password)
                   .digest('hex');
                
                if(passwordResetKey === resetKey){
                    user.password = crypto.pbkdf2Sync(newPassword, global.keys.secureKey, 10000, 64).toString('base64');
                    global.mongoService.document.save(appId,  [{document:user}]).then(function(user) {
                        deferred.resolve(); //returns no. of items matched
                    }, function(error) {
                        deferred.reject(error);
                    });
                }else{
                    deferred.reject("Reset Key is invalid.");
                }
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
        },

		signup: function(appId, document, accessList, isMasterKey) {
			var deferred = q.defer();
			global.customService.findOne(appId, Collections.User, {
				username: document.username
			},null,null,null,accessList, isMasterKey).then(function(user) {
				if (user) {
					deferred.reject('Username already exists');
					return;
				}

                global.customService.save(appId, Collections.User, document,accessList,isMasterKey).then(function(user) {
					deferred.resolve(user); //returns no. of items matched
				}, function(error) {
					deferred.reject(error);
				});
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
		},

		addToRole: function(appId, userId, roleId,accessList, isMasterKey) {
			var deferred = q.defer();
			//Get the role
			global.customService.find(appId, Collections.Role, {_id: roleId}, null, null, 1,0, accessList,isMasterKey).then(function(role) {
                
                if (role.length && role.length>0) { 
                    role = role[0];
                }
                
                
                console.log(role);

                if (!role) {
					deferred.reject('Role does not exists');
					return;
				}
				//get the user. 
				global.customService.find(appId, Collections.User, { _id: userId }, null,null,1,0, accessList,isMasterKey).then(function(user) {
                    
                    if (user.length && user.length > 0) {
                        user = user[0];
                    }
                    
                    if (!user) {
						deferred.reject('User not found.');
						return;
					} else {
						//check if user is already in role. 
						if (!user.roles) {
							user.roles = [];
						}
                        user._id=user._id.toString();
						if (user.roles.indexOf(roleId) === -1) { //does not belong to this role. 
							//add role to the user and save it in DB
                            role._id=role._id.toString();
							user.roles.push(role);
							global.customService.save(appId, Collections.User, user, accessList).then(function(user) {
								deferred.resolve(user);
							}, function(error) {
								deferred.reject(error);
							});
						} else {
							deferred.resolve(user);
						}
					}
				}, function(error) {
					deferred.reject(error);
				});
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
		},

		removeFromRole: function(appId, userId, roleId,accessList, isMasterKey) {
			var deferred = q.defer();
			//Get role
            var acc=accessList;
			global.customService.find(appId, Collections.Role, { _id: roleId }, null, null, 1, 0, accessList, isMasterKey).then(function(role) {
				if (!role) {
					deferred.reject('Role does not exists');
					return;
				}
				//get the user. 
				global.customService.find(appId, Collections.User, { _id: userId }, null, null, 1, 0, accessList, isMasterKey).then(function(user) {
					if (!user) {
						deferred.reject('User not found.');
						return;
					} else {
						//check if user is already in role. 
						if (!user.roles) {
							user.roles = [];
						}
						if (user.roles.indexOf(roleId) > -1) { //the role is present with the user
							user.roles.splice(user.roles.indexOf(roleId), 1); //remove role from the user. 
							global.customService.save(appId, Collections.User, user).then(function(user) {
								deferred.resolve(user);
							}, function(error) {
								deferred.reject(error);
							});
						} else {
							deferred.resolve(user);
						}
					}
				}, function(error) {
					deferred.reject(error);
				});
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
		}
	}
}

