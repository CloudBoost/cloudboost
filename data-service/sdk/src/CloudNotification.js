import CB from './CB'
/* CloudNotificiation */

CB.CloudNotification = CB.CloudNotification || {};

CB.CloudNotification.on = function(channelName, callback, done) {

    if(CB._isRealtimeDisabled){
        throw "Realtime is disbaled for this app.";
    }

    CB._validate();

    var def;

    if (!done) {
        def = new CB.Promise();
    }

    CB.Socket.emit('join-custom-channel',CB.appId+channelName);
    CB.Socket.on(CB.appId+channelName, function(data){ //listen to events in custom channel.
        callback(data);
    });

    if(done && done.success)
        done.success();
    else
        def.resolve();

    if (!done) {
        return def.promise;
    }

};

CB.CloudNotification.off = function(channelName, done) {

    if(CB._isRealtimeDisabled){
        throw "Realtime is disbaled for this app.";
    }

    CB._validate();

    var def;

    if (!done) {
        def = new CB.Promise();
    }

    CB.Socket.emit('leave-custom-channel',CB.appId+channelName);
    CB.Socket.removeAllListeners(CB.appId+channelName);
    if(done && done.success)
        done.success();
    else
        def.resolve();

    if (!done) {
        return def.promise;
    }

};

CB.CloudNotification.publish = function(channelName, data, done) {

    if(CB._isRealtimeDisabled){
        throw "Realtime is disbaled for this app.";
    }

    CB._validate();

    var def;

    if (!done) {
        def = new CB.Promise();
    }

    CB.Socket.emit('publish-custom-channel',{channel:CB.appId+channelName,data : data});
    if(done && done.success)
        done.success();
    else
        def.resolve();

    if (!done) {
        return def.promise;
    }

};

export default CB.CloudNotification