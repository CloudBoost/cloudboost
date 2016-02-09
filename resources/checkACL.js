/*
It should give 5 errors
i) register error => if the user is not already registered,
ii) update with no access with current user
iii) delete with no access with current user
iv) update with user access only with public user
v) delete with user access only with public user
 */
console.log('App Init');
CB.CloudApp.init("testApp", "d1bae1c6978e3ecd3d5c8a0095767c9c").then(function(doc) {
	console.log("App init done");
	//In cbjs-v1-test.html we have checked ACL with default access control list, so we don't check that here
	//comment the lines marked with /******/ after the first time you run this file
	// insertDummyData().then(function() { /******/
	registerUser().then(function() {
		// user registered and logged in
		saveAndDeleteCheck().then(function() {
			console.log("test 1 done!")
			findOneCheck().then(function() {
				console.log("test 2 done!")
				findCheck().then(function() {
					console.log("test 3 done!")
					checkRoleACL().then(function() {
						console.log("Checking Done");
					});
				});
			});
		});
	}, function() {
		// Could not register
		saveAndDeleteCheck().then(function() {
			console.log("test 1 done!")
			findOneCheck().then(function() {
				console.log("test 2 done!")
				findCheck().then(function() {
					console.log("test 3 done!")
					checkRoleACL().then(function() {
						console.log("Checking Done");
					});
				});
			});
		});
	});
}, function() {
	console.log("Dummy data inserting error");
	// }); /******/
}, function(err) {
	console.log("App cannot be initialised: " - +err);
});

function insertDummyData() { //for inserting data 
	var def = new $.Deferred();
	logIn().then(function() {
			var arr = [{
				"name": "a",
				"age": 12,
				"ACL": {
					"read": [],
					"write": ["all"]
				}
			}, {
				"name": "b",
				"age": 13,
				"ACL": {
					"read": [CB.CloudUser.current.id],
					"write": ["all"]
				}
			}, {
				"name": "c",
				"age": 14,
				"ACL": {
					"read": [CB.CloudUser.current.id],
					"write": ["all"]
				}
			}, {
				"name": "d",
				"age": 15
			}, {
				"name": "e",
				"age": 16
			}, {
				"name": "f",
				"age": 17
			}, {
				"name": "g",
				"age": 20
			}, {
				"name": "h",
				"age": 18
			}];
			var obj = new CB.CloudObject('scrap');
			for (var i = 0; i <= arr.length; i++) {
				(function(index) {
					if (index === arr.length) {
						def.resolve();
					} else {
						obj.set("name", arr[index].name);
						obj.set("age", arr[index].age);
						if (!arr[index].ACL) {
							arr[index].ACL = {
								"read": ["all"],
								"write": ["all"]
							}
						}
						obj.set("ACL", arr[index].ACL);
						obj.save({
							success: function() {
								console.log("Saved " + index);
							},
							error: function() {
								console.log("Saving Failed " + index)
							}
						})
					}
				})(i);
			}

			var obj = new CB.CloudObject('scrap2');
			var arr = [{
				"name": "ac",
				"role": [1, 2, 3, 4, 5]
			}, {
				"name": "cb",
				"role": [5, 6, 7, 8]
			}, {
				"name": "ab",
				"role": [3, 4, 5, 6]
			}];
			for (var i = 0; i <= arr.length; i++) {
				(function(index) {
					if (index === arr.length) {
						def.resolve();
					} else {
						obj.set("name", arr[index].name);
						obj.set("role", arr[index].role);
						obj.save({
							success: function() {
								console.log("Saved " + index);
							},
							error: function() {
								console.log("Saving Failed " + index)
							}
						})
					}
				})(i);
			}
		},
		function() {
			console.log("Error in logging in for inserting dummy data");
			def.resolve();
		});
	return def.promise();
}

function registerUser() {
	var def = new $.Deferred();
	console.log('User Registration');
	var user = new CB.CloudUser();
	user.set('username', 'sample1');
	user.set('password', 'sample1');
	user.set('sample', 'sample');
	user.set('email', 'sample1@sample.com');
	user.signUp({
		success: function(user) {
			console.log('Register Success: ' + JSON.stringify(CB.CloudUser.current));
			def.resolve();
		},
		error: function(error) {
			console.log('Register Error: ' + JSON.stringify(error));
			def.reject();
		}
	});
	return def.promise();
}

var user = null;

function logIn() {
	var def = new $.Deferred();
	console.log('User Login');
	user = new CB.CloudUser();
	user.set('username', 'sample1');
	user.set('password', 'sample1');
	user.logIn({
		success: function(user) {
			console.log('Login Success: ' + JSON.stringify(CB.CloudUser.current));
			def.resolve();
		},
		error: function(error) {
			console.log('Login Error: ' + JSON.stringify(error));
			def.reject();
		}
	});
	return def.promise();
}

function logOut() {
	var def = new $.Deferred();
	console.log("Logging out...");
	console.log(CB.CloudUser.current);
	if (CB.CloudUser.current) {
		CB.CloudUser.current.logOut({
			success: function(result) {
				def.resolve(result);
			},
			error: function(err) {
				console.log(err);
				if (err.responseJSON.message.indexOf("logged") >= 0) { //check if error message is "You are not logged in"
					console.log("Already logged out");
					def.resolve()
				} else {
					def.reject(err);
				}
			}
		});
	} else {
		console.log("Already logged out");
		def.resolve()
	}
	return def.promise();
}

function deleteObject(obj, caseStr) {
	var def = new $.Deferred();
	console.log('Deleting object ' + caseStr + ': ' + JSON.stringify(obj));
	obj.delete({
		success: function(obj) {
			console.log('Delete Success ' + caseStr + ': ' + JSON.stringify(obj));
			def.resolve();
		},
		error: function(error) {
			console.log('Delete Error ' + caseStr + ': ' + JSON.stringify(error));
			def.resolve();
		}
	});
	return def.promise();
}

function saveAndDeleteCheck() {
	var def = new $.Deferred();
	logIn().then(function() {
		console.log("Login for save & delete done!");
		saveAndDeleteCheck1().then(function() {
			saveAndDeleteCheck2().then(function() {
				saveAndDeleteCheck3().then(function() {
					def.resolve();
				});
			});
		});
	}, function() {
		console.log("Could not login for no access with current user");
	});
	return def.promise();
}

function saveAndDeleteCheck1() {
	//remove User Write access
	var def = new $.Deferred();
	var obj = new CB.CloudObject('Sample'); //obj in sample table.
	obj.set('column1', true);
	obj.set('column2', 'Sample');
	obj.document.ACL.setPublicWriteAccess(false); //remove "all" access, so that only user have access not public
	obj.document.ACL.setUserWriteAccess(CB.CloudUser.current.id, false); //for preventing public write access
	console.log('Saving obj with no access with current user' + JSON.stringify(obj));
	obj.save({
		success: function(obj) {
			obj.unset('column1');
			console.log('Saved obj, Updating with no access with current user...' + JSON.stringify(obj));
			obj.save({
				success: function(obj) {
					console.log("Updated success with no access with current user..." + JSON.stringify(obj));
					deleteObject(obj, 'with no access with current user').then(function() {
						def.resolve();
					}, function() {
						def.resolve();
					});
				},
				error: function(error) {
					console.log('Update Error with no access with current user' + JSON.stringify(error));
					deleteObject(obj, 'with no access with current user').then(function() {
						def.resolve();
					}, function() {
						def.resolve();
					});
				}
			})
		},
		error: function(error) {
			console.log('Save Error: ' + JSON.stringify(error));
			def.resolve();
		}
	});
	return def.promise();
}

function saveAndDeleteCheck2() {
	//add user write access only and check for update with the current user
	var def = new $.Deferred();
	var obj = new CB.CloudObject('Sample'); //obj in sample table.
	obj.set('column1', true);
	obj.set('column2', 'Sample');
	obj.document.ACL.setUserWriteAccess(CB.CloudUser.current.id, true); //for preventing public write access
	console.log('Saving obj with user access only with current user' + JSON.stringify(obj));
	obj.save({
		success: function(obj) {
			obj.unset('column1');
			console.log('Saved obj, updating with user access only with current user...' + JSON.stringify(obj));
			obj.save({
				success: function(obj) {
					console.log("Update Success with user access only with current user..." + JSON.stringify(obj));
					deleteObject(obj, 'with user access only with current user').then(function() {
						def.resolve();
					}, function() {
						def.resolve();
					});
				},
				error: function(error) {
					console.log('Update Error' + JSON.stringify(error));
					deleteObject(obj, 'with user access only with current user').then(function() {
						def.resolve();
					}, function() {
						def.resolve();
					});
				}
			})
		},
		error: function(error) {
			console.log('Save Error: ' + JSON.stringify(error));
		}
	});
	return def.promise();
}

function saveAndDeleteCheck3() {
	//add user write access only and check for update with public user
	var def = new $.Deferred();
	var obj = new CB.CloudObject('Sample'); //obj in sample table.
	obj.set('column1', true);
	obj.set('column2', 'Sample');
	obj.document.ACL.setUserWriteAccess(CB.CloudUser.current.id, true); //for preventing public write access
	console.log('Saving obj with user access only with public user ' + JSON.stringify(obj));
	obj.save({
		success: function(obj) {
			obj.unset('column1');
			console.log('Saved obj, updating object with user access only with public user...' + JSON.stringify(obj));
			logOut().then(function(result) {
				console.log("Logged Out successfully: ");
				obj.save({
					success: function(obj) {
						console.log("Update Success with user access only with public user..." + JSON.stringify(obj));
						deleteObject(obj, 'with user access only with public user').then(function() {
							def.resolve()
						});
					},
					error: function(error) {
						console.log('Update Error with user access only with public user' + JSON.stringify(error));
						deleteObject(obj, 'with user access only with public user').then(function() {
							def.resolve();
						});
					}
				})
			}, function(err) {
				console.log("Cannot logout: " + JSON.stringify(err));
				def.resolve();
			});
		},
		error: function(error) {
			console.log('Save Error: ' + JSON.stringify(error));
			def.resolve();
		}
	});
	return def.promise();
}

function findOneCheck() {
	var def = new $.Deferred();
	logIn().then(function() {
		console.log("Login for find one done!");
		findOneCheck1().then(function() {
			findOneCheck2().then(function() {
				findOneCheck3().then(function() {
					def.resolve();
				})
			})
		});
	});
	return def.promise();
}

function findOneCheck1() {
	//for findOne function
	var def = new $.Deferred();
	var query = new CB.CloudQuery("scrap");
	query.equalTo("name", "a");
	query.findOne({
		success: function(doc) {
			console.log("findOne with no access data: " + JSON.stringify(doc));
			def.resolve();
		},
		error: function(err) {
			console.log("findOne error with no access data: " + JSON.stringify(err));
			def.resolve();
		}
	});
	return def.promise();
}

function findOneCheck2() {
	var def = new $.Deferred();
	var query = new CB.CloudQuery('scrap');
	query.equalTo('name', "b");
	query.findOne({
		success: function(doc) {
			console.log("findOne with user accessible only data: " + JSON.stringify(doc.document));
			def.resolve();
		},
		error: function(err) {
			console.log("findOne error with user accessible only data: " + JSON.stringify(err));
			def.resolve();
		}
	});
	return def.promise();
}

function findOneCheck3() {
	var def = new $.Deferred();
	logOut().then(function() {
		console.log("Logged out in findOne with user access");
		var query = new CB.CloudQuery('scrap');
		query.equalTo('name', "b");
		query.findOne({
			success: function(doc) {
				console.log("findOne with user accessible only data, after logout: " + JSON.stringify(doc.document));
				def.resolve();
			},
			error: function(err) {
				console.log("findOne error with user accessible only data, after logout: " + JSON.stringify(err));
				def.resolve();
			}
		});
	});
	return def.promise();
}

function findCheck() {
	var def = new $.Deferred();
	findCheck1().then(function() {
		findCheck2().then(function() {
			findCheck3().then(function() {
				def.resolve();
			})
		})
	})
	return def.promise();
}

function findCheck1() {
	var def = new $.Deferred();
	logIn().then(function() {
		console.log("Logged in in find for user access data");
		var query = new CB.CloudQuery('scrap');
		// query.equalTo('name', "a");
		query.find({
			success: function(docs) {
				if (!docs) {
					docs = []
				}
				console.log("find with no access data: " + docs.length);
				def.resolve();
			},
			error: function(err) {
				console.log("find error with no access data: " + JSON.stringify(err));
				def.resolve();
			}
		});
	}, function() {
		console.log("Login error in no access data");
	});
	return def.promise();
}

function findCheck2() {
	var def = new $.Deferred();
	logIn().then(function() {
		console.log("Logged in in find for user access data")
		var query = new CB.CloudQuery('scrap');
		// query.equalTo('name', "b");
		query.find({
			success: function(docs) {
				if (!docs) {
					docs = []
				}
				console.log("find with user access data: " + docs.length);
				def.resolve();
			},
			error: function(err) {
				console.log("find error with user access data: " + JSON.stringify(err));
				def.resolve();
			}
		});
	}, function() {
		console.log("Login error in user access data");
	});
	return def.promise();
}

function findCheck3() {
	var def = new $.Deferred();
	if (CB.CloudUser.current) {
		console.log("User logged in");
	} else {
		console.log("User not logged in");
	}
	logOut().then(function() {
		console.log("Logged out in find for user access data")
		var query = new CB.CloudQuery('scrap');
		// query.equalTo('name', "b");
		query.find({
			success: function(docs) {
				if (!docs) {
					docs = []
				}
				console.log("find with user access data after logout: " + docs.length);
				def.resolve();
			},
			error: function(err) {
				console.log("find error in user access data after logout: " + JSON.stringify(err));
				def.resolve();
			}
		});
	}, function(err) {
		console.log("LogOut error in user access after logout: " + JSON.stringify(err));
	});
	return def.promise();
}

function checkRoleACL() {
	var def = new $.Deferred();
	console.log("Checking role ACLs");
	initializeRoleACL().then(function() {
		checkRoleACL1().then(function() {
			addToRole().then(function() {
				checkRoleACL2().then(function() {
					revertRoleACL().then(function() {
						removeFromRole();
					})
				})
			});
		});
	});
	return def.promise();
}

function initializeRoleACL() {
	var def = $.Deferred();
	var query = new CB.CloudQuery('scrap');
	query.equalTo('name', 'e');
	query.findOne().then(function(result) {
		var role = new CB.CloudRole('Admin');
		console.log("Got the object to save: " + JSON.stringify(result));
		CB.CloudRole.getRole(role).then(function(roleObj) {
			console.log("Got the role: " + JSON.stringify(roleObj));
			var acl = new CB.ACL();
			acl.read = result.ACL.read;
			acl.write = result.ACL.write;
			acl.setRoleReadAccess(roleObj.document._id, true);
			result.ACL = acl;
			console.log(result);
			result.save().then(function(doc) {
				console.log("Updated object with Admin role access only: " + JSON.stringify(doc));
				def.resolve();
			}, function(err) {
				console.log("Could not save updated object: " + JSON.stringify(err));
				def.resolve();
			});
		});
	}, function(err) {
		console.log("Could not get document" + JSON.stringify(err))
		def.resolve();
	});
	return def.promise();
}

function checkRoleACL1() {
	var def = $.Deferred();
	logIn().then(function() {
		console.log("User logged in for Admin role access check 1");
		var query = new CB.CloudQuery('scrap');
		query.equalTo("name", "e");
		query.find().then(function(data) {
			console.log("find with no role on Admin role access data only: " + JSON.stringify(data));
			def.resolve();
		}, function(err) {
			console.log("Error find with no role on role access only: " + JSON.stringify(err));
			def.resolve();
		})
	}, function(err) {
		console.log("Login error for admin role access check");
		def.resolve();
	});
	return def.promise();
}

function addToRole() {
	var def = $.Deferred();
	logIn().then(function() {
		var role = new CB.CloudRole('Admin');
		CB.CloudRole.getRole(role, {
			success: function(roleObj) {
				CB.CloudUser.current.addToRole(roleObj, {
					success: function(user) {
						console.log("Added role successfully");
						if (CB.CloudUser.current.isInRole(roleObj)) {
							console.log("Correctly identified the role added: " + roleObj.document._id);
						} else {
							console.log("Error in indentification of the added role: " + roleObj.document._id)
						}
						def.resolve();
					},
					error: function(err) {
						console.log("Cannot add role: " + JSON.stringify(err));
						def.resolve();
					}
				});
			},
			error: function(err) {
				console.log("Error in fetching role for adding to the user: " + JSON.stringify(err));
				def.resolve();
			}
		});
	}, function(err) {
		console.log("Login error for admin role access check");
		def.resolve();
	});
	return def.promise();
}

function checkRoleACL2() {
	var def = $.Deferred();
	logIn().then(function() {
		console.log("User logged in for Admin role access check2");
		var query = new CB.CloudQuery('scrap');
		query.equalTo("name", "e");
		query.find().then(function(data) {
			console.log("find with admin role on Admin role access data only: " + JSON.stringify(data));
			def.resolve();
		}, function(err) {
			console.log("Error find with Admin role on role access only: " + JSON.stringify(err));
			def.resolve();
		});
	}, function(err) {
		console.log("Login error for admin role access check");
		def.resolve();
	});
	return def.promise();
}

function removeFromRole() {
	console.log("Removing user from Admin role");
	var role = new CB.CloudRole('Admin');
	CB.CloudRole.getRole(role, {
		success: function(roleObj) {
			console.log("Got the role: " + JSON.stringify(roleObj))
			CB.CloudUser.current.removeFromRole(roleObj, {
				success: function(user) {
					console.log('Success in removing role');
					console.log(user);
					if (!CB.CloudUser.current.isInRole(roleObj)) {
						console.log("Correctly identified that the removed role: " + roleObj.document._id);
					} else {
						console.log("Error in indentification of the removed role: " + roleObj.document._id)
					}
				},
				error: function(error) {
					console.log(error);
				}
			});
		},
		error: function(error) {
			console.log('Error in getting role for removing');
			console.log(error);
			testQuery();
		}
	});
}

function revertRoleACL() {
	var def = $.Deferred();
	console.log("Reverting read permission of document..");
	logIn().then(function() {
		var query = new CB.CloudQuery('scrap');
		query.equalTo('name', 'e');
		query.findOne().then(function(result) {
			var role = new CB.CloudRole('Admin');
			var acl = new CB.ACL();
			result.ACL = acl;
			result.save().then(function(doc) {
				console.log("Updated object with public access: " + JSON.stringify(doc));
				def.resolve();
			}, function(err) {
				console.log("Could not save updated object: " + JSON.stringify(err));
				def.resolve();
			});
		}, function(err) {
			console.log("Could not get document" + JSON.stringify(err))
			def.resolve();
		});
	})
	return def.promise();
}