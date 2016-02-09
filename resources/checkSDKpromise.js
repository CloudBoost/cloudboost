/*
It should give 2 errors
i) register error => if the user is not already registered,
ii) wrong login identification error
*/

var obj;
console.log("App init");
CB.CloudApp.init('testApp', "d1bae1c6978e3ecd3d5c8a0095767c9c");

//CloudObject test

obj = new CB.CloudObject('Sample'); //obj in sample table.
obj.set('column1', true);
obj.set('column2', 'Sample');
console.log('Saving object.' + JSON.stringify(obj));
obj.save().done(function(obj) {
	console.log('Object Saved' + JSON.stringify(obj));
	obj.unset('column1');

	console.log('Updating object...');
	obj.save().done(function(obj) {
		console.log("Object Updated..." + JSON.stringify(obj));
		deleteObject(obj);

	}).fail(function(error) { //error on update
		console.log('Update Error' + JSON.stringify(error));
		deleteObject(obj);
	})
}).fail(function(error) { //error on save
	console.log('Save Error');
	console.log(error);
});

function deleteObject(obj) {
	obj.delete().done(function(obj) {
		console.log('Object Deleted');
		userTest();

	}).fail(function(error) { //error on delete
		console.log('Delete Error');
		console.log(error);
	});
}

//CloudUser test

function userTest() {
	console.log('User Registration');
	var user = new CB.CloudUser();
	console.log(user);
	user.set('username', 'sample1');
	user.set('password', 'sample1');
	user.set('sample', 'sample');
	user.set('email', 'sample1@sample.com');
	console.log(user);

	user.signUp().done(function(user) {
		console.log('User Registration Complete');
		console.log(CB.CloudUser.current);
		logIn();

	}).fail(function(error) { //signup error
		console.log('Register Error: ' + JSON.stringify(error));
		logIn();
	});
}

function logIn() {
	console.log('User Login');
	var user = new CB.CloudUser();
	user.set('username', 'sample1');
	user.set('password', 'sample1');
	user.logIn().done(function(user) {
		console.log('User Login Complete');
		console.log(CB.CloudUser.current);
		wrongLogin();

	}).fail(function(error) { //login error
		console.log('Login Error');
		console.log(error);
		wrongLogin();
	})
}
var user = null;

function wrongLogin() {
	console.log('Wrong User Login');
	user = new CB.CloudUser();
	user.set('username', 'sample');
	user.set('password', 'sample');
	user.logIn().done(function(user) {
		console.log('Cannot identify wrong login');
		console.log(CB.CloudUser.current);
		addToRole();

	}).fail(function(error) { //login error
		console.log('Successfully identified wrong login');
		console.log(error);
		addToRole();
	});
	user = new CB.CloudUser();
	user.set('username', 'sample1');
	user.set('password', 'sample1');
	user.logIn().done(function(user) {
		addToRole();
	}).fail(function(error) {
		addToRole();
	});
};

function addToRole() {
	var role = new CB.CloudRole('Admin');
	CB.CloudRole.getRole(role).done(function(roleObj) {
		CB.CloudUser.current.addToRole(roleObj).done(function(user) {
			console.log("Added role successfully");
			console.log(user);
			if (CB.CloudUser.current.isInRole(roleObj)) {
				console.log("Correctly identified the role added: " + roleObj.document._id);
			} else {
				console.log("Error in indentification of the added role: " + roleObj.document._id)
			}
			removeFromRole();
		}).fail(function(err) {
			console.log("Cannot add role");
			console.log(JSON.stringify(err));
			removeFromRole();
		});
	}).fail(function(err) {
		console.log("Error in fetching role for adding to the user");
		console.log(err);
	});
}

function removeFromRole() {
	var role = new CB.CloudRole('Admin');
	CB.CloudRole.getRole(role).done(function(roleObj) {
		console.log("Got the role: " + JSON.stringify(roleObj))
		console.log(roleObj);
		CB.CloudUser.current.removeFromRole(roleObj).done(function(user) {
			console.log('Success in removing role');
			console.log(user);
			if (!CB.CloudUser.current.isInRole(roleObj)) {
				console.log("Correctly identified that the removed role: " + roleObj.document._id);
			} else {
				console.log("Error in indentification of the removed role: " + roleObj.document._id)
			}
			testQuery();
		}).fail(function(error) {
			console.log(error);
			testQuery();
		});
	}).fail(function(error) {
		console.log('Error in getting role for removing');
		console.log(error);
		testQuery();
	});
}

function testQuery() {
	query = new CB.CloudQuery("scrap");
	query.equalTo("name", "d");
	query.find().done(function(docs) {
		console.log("Testing find with name=d: ");
		for (var i = 0; i < docs.length; i++) {
			console.log(JSON.stringify(docs[i]));
		}
	}).fail(function(err) {
		console.log("Error: " + JSON.stringify(err));
	});
	query = new CB.CloudQuery("scrap");
	query.notEqualTo("name", "d");
	query.find().done(function(docs) {
		console.log("-Testing find with name!=d: ");
		for (var i = 0; i < docs.length; i++) {
			console.log(JSON.stringify(docs[i]));
		}
	}).fail(function(err) {
		console.log("Error: " + JSON.stringify(err));
	});
	query = new CB.CloudQuery("scrap");
	query.greaterThan("age", 13);
	query.find().done(function(docs) {
		console.log("-Testing find with age>13: ");
		for (var i = 0; i < docs.length; i++) {
			console.log(JSON.stringify(docs[i]));
		}
	}).fail(function(err) {
		console.log("Error: " + JSON.stringify(err));
	});
	query = new CB.CloudQuery("scrap");
	query.lessThan("age", 13);
	query.find().done(function(docs) {
		console.log("-Testing find with age<13: ");
		for (var i = 0; i < docs.length; i++) {
			console.log(JSON.stringify(docs[i]));
		}
	}).fail(function(err) {
		console.log("Error: " + JSON.stringify(err));
	});
	query = new CB.CloudQuery("scrap");
	query.greaterThan("age", 13);
	query.lessThan("age", 20);
	query.find().done(function(docs) {
		console.log("-Testing find with 13<age<20: ");
		for (var i = 0; i < docs.length; i++) {
			console.log(JSON.stringify(docs[i]));
		}
	}).fail(function(err) {
		console.log("Error: " + JSON.stringify(err));
	});
	query = new CB.CloudQuery("scrap");
	query.greaterThan("age", 13);
	query.orderByAsc("age");
	query.find().done(function(docs) {
		console.log("-Testing find with age>13 and ascending(age): ");
		for (var i = 0; i < docs.length; i++) {
			console.log(JSON.stringify(docs[i]));
		}
	}).fail(function(err) {
		console.log("Error: " + JSON.stringify(err));
	});
	query = new CB.CloudQuery("scrap");
	query.greaterThan("age", 13);
	query.orderByDesc("age");
	query.find().done(function(docs) {
		console.log("-Testing find with age>13 and descending(age): ");
		for (var i = 0; i < docs.length; i++) {
			console.log(JSON.stringify(docs[i]));
		}
	}).fail(function(err) {
		console.log("Error: " + JSON.stringify(err));
	});
	query = new CB.CloudQuery("scrap");
	query.greaterThan("age", 13);
	query.setLimit(3);
	query.find().done(function(docs) {
		console.log("-Testing find with age>13 and limit(3): ");
		for (var i = 0; i < docs.length; i++) {
			console.log(JSON.stringify(docs[i]));
		}
	}).fail(function(err) {
		console.log("Error: " + JSON.stringify(err));
	});
	query = new CB.CloudQuery("scrap");
	query.greaterThan("age", 13);
	query.setLimit(3);
	query.setSkip(2);
	query.find().done(function(docs) {
		console.log("-Testing find with age>13, limit(3) and skip(2): ");
		for (var i = 0; i < docs.length; i++) {
			console.log(JSON.stringify(docs[i]));
		}
	}).fail(function(err) {
		console.log("Error: " + JSON.stringify(err));
	});
	query = new CB.CloudQuery("scrap");
	query.greaterThan("age", 13);
	query.selectColumn(["age", "_id"]);
	query.find().done(function(docs) {
		console.log("-Testing find with age>13 and select[age, _id]: ");
		for (var i = 0; i < docs.length; i++) {
			console.log(JSON.stringify(docs[i]));
		}
	}).fail(function(err) {
		console.log("Error: " + JSON.stringify(err));
	});
	query = new CB.CloudQuery("scrap");
	query.greaterThan("age", 13);
	query.doNotSelectColumn("age");
	query.find().done(function(docs) {
		console.log("-Testing find with age>13 and doNotSelect(age): ");
		for (var i = 0; i < docs.length; i++) {
			console.log(JSON.stringify(docs[i]));
		}
	}).fail(function(err) {
		console.log("Error: " + JSON.stringify(err));
	});
	query = new CB.CloudQuery("scrap");
	query.greaterThan("age", 13);
	query.findOne().done(function(doc) {
		console.log("-Testing find with age>13 findOne: ");
		console.log(JSON.stringify(doc.document));
	}).fail(function(err) {
		console.log("Error: " + JSON.stringify(err));
	});
};