
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var crypto = require('crypto');
var q = require('q');
var Collections = require('../database-connect/collections.js');
var _ = require('underscore');


module.exports = function() {

	return {
		
		login: function(appId, username, password, accessList, isMasterKey) {
			var deferred = q.defer();

			try{
				global.customService.findOne(appId, Collections.User, {
					username: username
				},null,null,null,accessList,isMasterKey).then(function(user) {
					if (!user) {
						deferred.reject('Invalid Username');
						return;
	                }

	                var isAuthenticatedUser=false;
	                var encryptedPassword = crypto.pbkdf2Sync(password, global.keys.secureKey, 10000, 64, 'sha1').toString('base64');
					if (encryptedPassword === user.password) { //authenticate user.
						isAuthenticatedUser=true;
					} 

	                global.appService.getAllSettings(appId).then(function(appSettings){

	                	var auth=_.first(_.where(appSettings, {category: "auth"}));
	                	var signupEmailSettingsFound=false;
	                	var allowOnlyVerifiedLogins=false;

	                	if(auth && auth.settings && auth.settings.signupEmail){
	                		signupEmailSettingsFound=true;
	                		if(auth.settings.signupEmail.allowOnlyVerifiedLogins){
	                			allowOnlyVerifiedLogins=true;
	                		}
	                	}

	                	if(isAuthenticatedUser){
	                		if(signupEmailSettingsFound && allowOnlyVerifiedLogins){
		                		if(user.verified){
		                			deferred.resolve(user);
		                		}else{
		                			deferred.reject("User is not verified");
		                		}
		                	}else{
		                		deferred.resolve(user);
		                	}
	                	}else{
	                		deferred.reject("User is not authenticated");
	                	}
	                		                	

	                },function(error){
	                	deferred.reject(error);
	                });					
					
				}, function(error) {
					deferred.reject(error);
	            });

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

			return deferred.promise;
		},
        
        changePassword: function(appId, userId, oldPassword, newPassword, accessList, isMasterKey) {
			var deferred = q.defer();

			try{
				global.customService.findOne(appId, Collections.User, {
					_id: userId
				},null,null,null,accessList, isMasterKey).then(function(user) {
					if (!user) {
						deferred.reject('Invalid User');
						return;
	                }

					var encryptedPassword = crypto.pbkdf2Sync(oldPassword, global.keys.secureKey, 10000, 64, 'sha1').toString('base64');
					if (encryptedPassword === user.password) { //authenticate user.
						 user.password = crypto.pbkdf2Sync(newPassword, global.keys.secureKey, 10000, 64, 'sha1').toString('base64');
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

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

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
			
			try{
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
	                                      
	               	global.mailService.sendResetPasswordMail(appId, email, user, passwordResetKey).then(function(resp){
	                   deferred.resolve(resp);
	                }, function(error){
	                    deferred.reject(error);
	                });

	                
				}, function(error) {
					deferred.reject(error);
				});

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
			
			return deferred.promise;
        },
        
        resetUserPassword: function(appId, username, newPassword, resetKey, accessList, isMasterKey){
            var deferred = q.defer();
			
			try{
	            global.customService.findOne(appId, Collections.User, {
					username: username
				},null,null,null,accessList, true).then(function(user) {
					if (!user) {
						deferred.reject("User with username "+username+" not found.");
						return;
					}
	                //Send an email to reset user password here. 
	                var passwordResetKey = crypto.createHmac('sha256', global.keys.secureKey)
	                   .update(user.password)
	                   .digest('hex');
	                
	                if(passwordResetKey === resetKey){
	                    user.password = crypto.pbkdf2Sync(newPassword, global.keys.secureKey, 10000, 64, 'sha1').toString('base64');
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

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
			return deferred.promise;
        },

		signup: function(appId, document, accessList, isMasterKey) {
			var deferred = q.defer();

			try{
				global.customService.findOne(appId, Collections.User, {
					username: document.username
				},null,null,null,accessList, isMasterKey).then(function(user) {
					if (user) {
						deferred.reject('Username already exists');
						return;
					}

	                global.customService.save(appId, Collections.User, document,accessList,isMasterKey).then(function(user) {
						            
		                //Send an email to activate account. 
	                    var cipher = crypto.createCipher('aes192', global.keys.secureKey);
						var activateKey = cipher.update(user._id, 'utf8', 'hex');
						activateKey += cipher.final('hex');
	                                      
						var promises=[];
						promises.push(global.appService.getAllSettings(appId));
						promises.push(global.mailService.sendSignupMail(appId, user, activateKey));

						q.all(promises).then(function(list){

		                   	var auth=_.first(_.where(list[0], {category: "auth"}));
		                	var signupEmailSettingsFound=false;
		                	var allowOnlyVerifiedLogins=false;

		                	if(auth && auth.settings && auth.settings.signupEmail){
		                		signupEmailSettingsFound=true;		                		
		                		if(auth.settings.signupEmail.allowOnlyVerifiedLogins){		                			
		                			allowOnlyVerifiedLogins=true;
		                		}
		                	}
		                	
	                		if(signupEmailSettingsFound && allowOnlyVerifiedLogins){
		                		if(user.verified){
		                			deferred.resolve(user);
		                		}else{
		                			deferred.resolve(null);
		                		}
		                	}else{
		                		deferred.resolve(user);
		                	}		                	

		                }, function(error){
		                    deferred.reject(error);
		                });


					}, function(error) {
						deferred.reject(error);
					});
				}, function(error) {
					deferred.reject(error);
				});

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
			return deferred.promise;
		},

		verifyActivateCode: function(appId, activateCode, accessList) {
			var deferred = q.defer();

			try{				

				var decipher = crypto.createDecipher('aes192', global.keys.secureKey);				
				var userId = decipher.update(activateCode, 'hex', 'utf8');
				userId += decipher.final('utf8');

				var isMasterKey=true;
				var collectionName="User";
				var query={_id: userId};
				var select=null;
				var sort=null;
				var skip=null;							


				global.customService.findOne(appId, collectionName, query, select, sort, skip, accessList, isMasterKey)
				.then(function(user) {
					if (user) {
						user.verified=true;
						user._modifiedColumns=["verified"];
						user._isModified=true;			    	
			    	
		                global.customService.save(appId, collectionName, user, accessList, isMasterKey).then(function(user) {
							deferred.resolve(user);
						}, function(error) {
							deferred.reject(error);
						});
	           		}else{
	           			deferred.resolve("Not a valid activation code");
	           		}

				}, function(error) {
					deferred.reject(error);
				});

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
			return deferred.promise;
		},

		addToRole: function(appId, userId, roleId,accessList, isMasterKey) {
			var deferred = q.defer();

			try{
				//Get the role
				global.customService.find(appId, Collections.Role, {_id: roleId}, null, null, 1,0, accessList,isMasterKey).then(function(role) {
	                
	                if (role && role.length>0) { 
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
							user._id=user._id.toString();

							//check if user is already in role. 
							if (!user.roles) {
								user.roles = [];
							}

							var userRoleIds=[];

							if(user.roles && user.roles.length>0){
								for(var i=0;i<user.roles.length;++i){
									userRoleIds.push(user.roles[i]._id);
								}
							}
	                        
							if (userRoleIds.indexOf(roleId) === -1) { //does not belong to this role. 
								//add role to the user and save it in DB
	                            role._id=role._id.toString();
								user.roles.push(role);

								user._isModified=true;
								if(!user._modifiedColumns){
									user._modifiedColumns=[];
								}
								user._modifiedColumns.push("roles");								

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

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
			return deferred.promise;
		},

		removeFromRole: function(appId, userId, roleId,accessList, isMasterKey) {
			var deferred = q.defer();

			try{
				//Get role
	            var acc=accessList;
				global.customService.find(appId, Collections.Role, { _id: roleId }, null, null, 1, 0, accessList, isMasterKey).then(function(role) {
					if (!role) {
						deferred.reject('Role does not exists');
						return;
					}
					//get the user. 
					global.customService.find(appId, Collections.User, { _id: userId }, null, null, 1, 0, accessList, isMasterKey).then(function(user) {
						
						if (user && user.length > 0) {
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
							var userRoleIds=[];

							if(user.roles && user.roles.length>0){
								for(var i=0;i<user.roles.length;++i){
									userRoleIds.push(user.roles[i]._id);
								}
							}

							if (userRoleIds.indexOf(roleId) > -1) { //the role is present with the user
								user.roles.splice(userRoleIds.indexOf(roleId), 1); //remove role from the user. 

								user._isModified=true;
								if(!user._modifiedColumns){
									user._modifiedColumns=[];
								}
								user._modifiedColumns.push("roles");

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

			} catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
			return deferred.promise;
		}
	};
};

