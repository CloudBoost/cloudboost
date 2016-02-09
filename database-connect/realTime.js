module.exports = function (io){

	var g = {};

	io.on('connection', function(socket){

	  socket.on('app-init', function (data) {
		   socket.join(data);
	  });

	  /* Custom Channel Listeners. */

	  socket.on('join-custom-channel', function (data) {
	  		console.log('++++++++ Joined Realtime Channel+++++');
	  		console.log(data);
		    socket.join(data);
      });
        
      socket.on('socket-disconnect', function (data) {
            socket.disconnect();
      });

	  socket.on('leave-custom-channel', function (data) {
	  		console.log('++++++++ Left Realtime Channel+++++');
	  		console.log(data);
		   socket.leave(data);
	  });

	  socket.on('publish-custom-channel', function (data) {
	  		console.log('++++++++ Publish Realtime Channel+++++');
	  		console.log(data);
		   io.to(data.channel).emit(data.channel,data.data);
	  });

	  /* CloudObject Channel Listeners. */

	  socket.on('join-object-channel', function (data) {
            console.log('++++++++ Joined Object Realtime Channel+++++');
            console.log(data);
            
            if (typeof data === 'string') { // Backward Compatibility : data only has the room id
                socket.join(data);
            } else { //data has both the room id and the sessionId.
                socket.join(data.room);
                //connect socket.id and sessionId together
                global.socketSessionHelper.saveSession(socket.id, data.sessionId);
            }
	  });

	  socket.on('leave-object-channel', function (data) {
	  	   console.log('++++++++ Leave Object Realtime Channel+++++');
	  	   console.log(data);
           socket.leave(data);
	  });

      socket.on('disconnect', function (){
            global.socketSessionHelper.deleteSession(socket.id); //deletes the lnk between this socket and session.
	  });

	});

	g.sendObjectNotification = function(appId, document, eventType){
		//event type can be created, updated, deleted. 
		if(document && document._tableName){
			console.log('++++++++ Sending Realtime Object Notification+++++');
			console.log(eventType + ' event');
	  		console.log(document);
			//if this doucment is an instance of a table Object.
            var roomSockets = io.to(appId.toLowerCase() + 'table' + document._tableName.toLowerCase() + eventType.toLowerCase());
            var sockets = roomSockets.sockets;
            
            var promises = [];

            //check for ACL and then send.

            if(typeof sockets === "object"){
                for(var key in sockets){
                    if(sockets[key]){
                         promises.push(_sendNotification(appId, document, sockets[key],eventType));
                    }
                }
            }else{
                for (var i = 0; i < sockets.length; i++) {
                    var socket = sockets[i];
                    promises.push(_sendNotification(appId, document, socket,eventType));
                }
            }

            global.q.all(promises).then(function () {
                console.log("Notifications Sent");
            }, function () {
                console.log("Error on sending Notifications");
            });
		}
	};


    return g;

};

/**
 */

function _sendNotification(appId,document,socket,eventType) {
    var deferred = global.q.defer();
    global.socketSessionHelper.getSession(socket.id, function (err, session) {
        if (err) {
            deferred.reject();
        }
        if (!session || global.aclHelper.isAllowedReadAccess(session.userId, session.roles, document.ACL)) {
            socket.emit(appId.toLowerCase() + 'table' + document._tableName.toLowerCase() + eventType.toLowerCase(), document);
            console.log("Socket Emitted.");
            deferred.resolve();
        } else {
            console.log("JUST RESOLVED");
            deferred.resolve();
        }
    });
    return deferred.promise;
}