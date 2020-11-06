describe("Cloud Objects Notification", function () {

	var obj = new CB.CloudObject('Student');
	var obj1 = new CB.CloudObject('student4');

	it("should alert when the object is created.", function (done) {

		this.timeout(40000);
		CB.CloudObject.on('Student', 'created', function (data) {
			if (data.get('name') === 'sample') {
				done();
				CB.CloudObject.off('Student', 'created', { success: function () { }, error: function () { } });
			}
			else
				throw "Wrong data received.";
		}, {
				success: function () {
					obj.set('name', 'sample');
					obj.save().then(function (newObj) {
						obj = newObj;
					});
				}, error: function (error) {
					throw 'Error listening to an event.';
				}
			});
	});

	it("should not alert when objects ACL is public deny", function (done) {

		this.timeout(40000);
		CB.CloudObject.on('Student', 'created', function (data) {
			done('should not have triggered this event')
		}, {
				success: function () {
					var obj = new CB.CloudObject('Student');
					obj.set('name', 'sample');
					obj.ACL = new CB.ACL();
					obj.ACL.setPublicReadAccess(false);
					obj.ACL.setPublicWriteAccess(false);
					setTimeout(function () {
						obj.save()
					}, 2000)

				}, error: function (error) {
					throw 'Error listening to an event.';
				}
			});

		setTimeout(function () {
			CB.CloudObject.off('Student', 'created', { success: function () { }, error: function () { } });
			done()
		}, 5000)
	});



	it("should throw an error when wrong event type is entered. ", function (done) {

		this.timeout(40000);
		try {
			CB.CloudObject.on('Student', 'wrongtype', function (data) {
				throw 'Fired event to wrong type.';
			});

			throw 'Listening to wrong event type.';
		} catch (e) {
			done();
		}

	});

	it("should alert when the object is updated.", function (done) {

		this.timeout(40000);
		CB.CloudObject.on('student4', 'updated', function (data) {
			done();
			CB.CloudObject.off('student4', 'updated', { success: function () { }, error: function () { } });
		}, {
				success: function () {
					obj1.save().then(function () {
						obj1.set('age', 15);
						obj1.save().then(function (newObj) {
							obj1 = newObj;
						}, function () {
							throw 'Error Saving an object.';
						});
					}, function () {
						throw 'Error Saving an object.'
					});
				}, error: function (error) {
					throw 'Error listening to an event.';
				}

			});
	});

	it("should alert when the object is deleted.", function (done) {

		this.timeout(50000);

		CB.CloudObject.on('Student', 'deleted', function (data) {
			if (data instanceof CB.CloudObject) {
				done();
				CB.CloudObject.off('Student', 'deleted', { success: function () { }, error: function () { } });
			}
			else
				throw "Wrong data received.";
		}, {
				success: function () {
					obj.set('name', 'sample');
					obj.delete();
				}, error: function (error) {
					throw 'Error listening to an event.';
				}
			});
	});

	it("should alert when multiple events are passed.", function (done) {
		this.timeout(40000);
		var cloudObject = new CB.CloudObject('Student');
		var count = 0;
		CB.CloudObject.on('Student', ['created', 'deleted'], function (data) {
			count++;
			if (count === 2) {
				done();
			}
		}, {
				success: function () {
					cloudObject.set('name', 'sample');
					cloudObject.save({
						success: function (newObj) {
							cloudObject = newObj;
							cloudObject.set('name', 'sample1');
							cloudObject.save();
							cloudObject.delete();
						}
					});

				}, error: function (error) {
					throw 'Error listening to an event.';
				}
			});
	});

	it("should alert when all three events are passed", function (done) {

		this.timeout(40000);

		var cloudObject = new CB.CloudObject('Student');
		var count = 0;
		CB.CloudObject.on('Student', ['created', 'deleted', 'updated'], function (data) {
			count++;
			if (count === 3) {
				done();
			}
		}, {
				success: function () {
					cloudObject.set('name', 'sample');
					cloudObject.save({
						success: function (newObj) {
							cloudObject = newObj;
							cloudObject.set('name', 'sample1');
							cloudObject.save({
								success: function (newObj) {
									cloudObject = newObj;
									cloudObject.delete();
								}
							});
						}
					});
				}, error: function (error) {
					throw 'Error listening to an event.';
				}
			});
	});

	it("should stop listening.", function (done) {

		this.timeout(44000);

		var cloudObject = new CB.CloudObject('Student');
		var count = 0;
		CB.CloudObject.on('Student', ['created', 'updated', 'deleted'], function (data) {
			count++;
		}, {
				success: function () {
					CB.CloudObject.off('Student', ['created', 'updated', 'deleted'], {
						success: function () {
							cloudObject.save();
						}, error: function (error) {
							done(error);
						}
					});
				}, error: function (error) {
					done(error);
				}
			});

		setTimeout(function () {
			if (count === 0) {
				done();
			} else {
				done('Listening to events even if its stopped.');
			}

		}, 6000);
	});

});