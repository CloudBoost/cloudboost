import CB from './CB'
/*
CloudQueue
 */

class CloudQueue {
    constructor(queueName,queueType){
        if(typeof queueName === 'undefined' || queueName == null){
            throw "Cannot create a queue with empty name";
        }

        this.document = {};
        this.document.ACL = new CB.ACL(); //ACL(s) of the document
        this.document._type = 'queue';
        this.document.expires = null;
        this.document.name = queueName;
        this.document.retry = null;
        this.document.subscribers = [];
        this.document.messages = [];
        
        if(queueType && queueType !== "push" && queueType !== "pull"){
            throw "Type can be push or pull";
        }
        if(queueType){
            this.document.queueType = queueType;
        }else{
            this.document.queueType = "pull";
        }
    };
    addMessage(queueMessage, callback) {

        if(queueMessage == null)
            throw "Message cannot be null";

        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        var messages = [];

        if(queueMessage.constructor !== Array){
            messages.push(queueMessage);
        }else{
            messages = queueMessage;
        }

        for(var i=0;i<messages.length; i++){
            if(!(messages[i] instanceof CB.QueueMessage)){
                messages[i] = new CB.QueueMessage(messages[i]);
            }
        }

        this.document.messages = messages;

        //PUT TO SERVER.
        var thisObj = this;

        
        var params=JSON.stringify({
            document: CB.toJSON(thisObj),
            key: CB.appKey
        });

        var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+'/message';

        CB._request('PUT',url,params).then(function(response){
            var messages = CB.fromJSON(JSON.parse(response));
            if (callback) {
                callback.success(messages);
            } else {
                def.resolve(messages);
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    };

    updateMessage(queueMessage, callback) {

        if(queueMessage == null)
            throw "Message cannot be null";

        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        var messages = [];

        if(queueMessage.constructor !== Array){
            if(!queueMessage.id){
                throw "Message cannot be updated because it has never been saved.";
            }else{
                messages.push(queueMessage);
            }
           
        }else{
             messages = queueMessage;
             for(var i=0;i<messages.length; i++){
                if(!(messages[i] instanceof CB.QueueMessage)){
                    throw "Message is not an instance of QueueMessage.";
                }

                if(!message[i].id){
                    throw "Message cannot be updated because it has never been saved.";
                }
            }
        }

        return this.addMessage(queueMessage,callback);
    };


    getMessage(count,callback) {

        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        if(typeof count === 'object' && !callback ){
            callback = count;
            count = null;
        }

        if(!count)
            count=1;

        var thisObj = this;

        
        var params=JSON.stringify({
            count: count,
            key: CB.appKey
        });

        var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+'/getMessage';

        CB._request('POST',url,params).then(function(response){
            
            if(!response || response===""){
                response = null;
            }

            if (callback) {
                callback.success(CB.fromJSON(JSON.parse(response)));
            } else {
                def.resolve(CB.fromJSON(JSON.parse(response)));
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    };


    getAllMessages(callback) {

        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        if(typeof count === 'object' && !callback ){
            callback = count;
            count = null;
        }

        
        var thisObj = this;

        
        var params=JSON.stringify({
            key: CB.appKey
        });

        var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+'/messages';

        CB._request('POST',url,params).then(function(response){
            
            if(!response || response===""){
                response = null;
            }

            if (callback) {
                callback.success(CB.fromJSON(JSON.parse(response)));
            } else {
                def.resolve(CB.fromJSON(JSON.parse(response)));
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    };

    getMessageById(id, callback) {
        var def;

        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        
        var params=JSON.stringify({
            key: CB.appKey
        });

        var url = CB.apiUrl + "/queue/" + CB.appId + '/'+this.document.name+'/message/'+id;

        CB._request('POST',url,params).then(function(response){
            
            if(!response || response === ""){
                response = null;
            }

            if (callback) {
                callback.success(CB.fromJSON(JSON.parse(response)));
            } else {
                def.resolve(CB.fromJSON(JSON.parse(response)));
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    };

    get(callback) {
        var def;
        
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        
        var thisObj = this;

        var params=JSON.stringify({       
            key: CB.appKey
        });

        var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+'/';

        CB._request('POST',url,params).then(function(response){
            if (callback) {
                callback.success(CB.fromJSON(JSON.parse(response),thisObj));
            } else {
                def.resolve(CB.fromJSON(JSON.parse(response),thisObj));
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    };

    create(callback) {
        var def;
        
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        
        var thisObj = this;

        var params=JSON.stringify({       
            key: CB.appKey,
            document : CB.toJSON(thisObj)
        });

        var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+'/create';

        CB._request('POST',url,params).then(function(response){
            if (callback) {
                callback.success(CB.fromJSON(JSON.parse(response),thisObj));
            } else {
                def.resolve(CB.fromJSON(JSON.parse(response),thisObj));
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    };

    addSubscriber(url,callback) {

        var def;

        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        
        var tempSubscribers =  this.document.subscribers;

        this.document.subscribers = [];

        if(url.constructor === Array){
            for(var i=0;i<url.length;i++){
                this.document.subscribers.push(url[i]);
            }
        }else{
            this.document.subscribers.push(url);
        }

        var params=JSON.stringify({       
            key: CB.appKey,
            document : CB.toJSON(this)
        });

       var thisObj = this;

       var url = CB.apiUrl + '/queue/' + CB.appId + '/'+thisObj.document.name+'/subscriber/';

       CB._request('POST',url,params).then(function(response){
            thisObj = CB.fromJSON(JSON.parse(response),thisObj);
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        },function(err){
            thisObj.document.subscribers = tempSubscribers;
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    };

    removeSubscriber(url,callback) {

        var def;

        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        
        var tempSubscribers =  this.document.subscribers;

        this.document.subscribers = [];

        if(url.constructor === Array){
            for(var i=0;i<url.length;i++){
                this.document.subscribers.push(url[i]);
            }
        }else{
            this.document.subscribers.push(url);
        }

        var thisObj =this;

        var params=JSON.stringify({       
            key: CB.appKey,
            document : CB.toJSON(thisObj),
            method: "DELETE"
        });


       var url = CB.apiUrl + '/queue/' + CB.appId + '/'+thisObj.document.name+'/subscriber/';

       CB._request('PUT',url,params).then(function(response){
            thisObj = CB.fromJSON(JSON.parse(response),thisObj);
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        },function(err){
            this.document.subscribers = tempSubscribers;
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });

    };

    peekMessage(count, callback) {

        var def;

        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        if(typeof count === 'object' && !callback ){
            callback = count;
            count = null;
        }

        if(!count)
            count=1; 
        
        
        var params=JSON.stringify({
            key: CB.appKey,
            count : count
        });

       var url = CB.apiUrl + "/queue/" + CB.appId + '/'+this.document.name+'/peekMessage';

       CB._request('POST',url,params).then(function(response){
            if (callback) {
                callback.success(CB.fromJSON(JSON.parse(response)));
            } else {
                def.resolve(CB.fromJSON(JSON.parse(response)));
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });

    };

    delete(callback) {
        var def;

        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        
        var params=JSON.stringify({
            key: CB.appKey,
            document : CB.toJSON(this),
            method:"DELETE"
        });

       var thisObj = this;

       var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name;

       CB._request('PUT',url,params).then(function(response){
            thisObj = CB.fromJSON(JSON.parse(response),thisObj);
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    };

    clear(callback) {
        var def;

        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        
        var params=JSON.stringify({
            key: CB.appKey,
            document : CB.toJSON(this),
            method: "DELETE"
        });

       var thisObj = this;

       var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+"/clear";

       CB._request('PUT',url,params).then(function(response){
            thisObj = CB.fromJSON(JSON.parse(response),thisObj);
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    };

    refreshMessageTimeout(id,timeout ,callback) {
        var def;

        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        if(!id)
            throw "Message Id cannot be null";

        if(id instanceof CB.QueueMessage){
            if(!id.id){
                throw "Queue Message should have an id.";
            }else{
                id = id.id;
            }
        }

        if(!callback && (timeout.success || timeout.error)){
            callback = timeout;
            timeout = null;
        }
        
        
        var params=JSON.stringify({
            key: CB.appKey,
            timeout : timeout
        });

       var thisObj = this;

       var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+"/"+id+"/refresh-message-timeout";

       CB._request('PUT',url,params).then(function(response){
            if (callback) {
                callback.success(CB.fromJSON(JSON.parse(response)));
            } else {
                def.resolve(CB.fromJSON(JSON.parse(response)));
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    };


    deleteMessage(id,callback) {
        var def;
        
        CB._validate();

        if(!id || (!(id instanceof CB.QueueMessage)&&typeof id !== 'string')){
            throw "Delete Message function should have id of the message or insance of QueueMessage as the first parameter. ";
        }

        if(id instanceof CB.QueueMessage){
            id = id.id;
        }

        if (!callback) {
            def = new CB.Promise();
        }

        
        var params=JSON.stringify({
            key: CB.appKey,
            method: "DELETE"
        });

       var thisObj = this;

       var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+"/message/"+id;

       CB._request('PUT',url,params).then(function(response){
            if (callback) {
                callback.success(CB.fromJSON(JSON.parse(response)));
            } else {
                def.resolve(CB.fromJSON(JSON.parse(response)));
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    };

    update(callback) {
        var def;
        
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }
        
        
        var thisObj = this;

        var params=JSON.stringify({       
            key: CB.appKey,
            document : CB.toJSON(thisObj)
        });


       var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name;

       CB._request('PUT',url,params).then(function(response){
            if (callback) {
                callback.success(CB.fromJSON(JSON.parse(response),thisObj));
            } else {
                def.resolve(CB.fromJSON(JSON.parse(response),thisObj));
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    };
}

Object.defineProperty(CloudQueue.prototype, 'retry', {
    get: function() {
        return this.document.retry;
    },
    set: function(retry) {

        if(this.queueType !== "push"){
            throw "Queue Type should be push to set this property";
        }

        this.document.retry = retry;
        CB._modified(this,'retry');
    }
});

Object.defineProperty(CloudQueue.prototype, 'size', {
    get: function() {
        if(this.document.size)
            return this.document.size;
        else
            return 0;
    }
});

Object.defineProperty(CloudQueue.prototype, 'name', {
    get: function() {
        return this.document.name;
    }
});

Object.defineProperty(CloudQueue.prototype, 'subscribers', {
    get: function() {
        return this.document.subscribers;
    }
});

Object.defineProperty(CloudQueue.prototype, 'type', {
    get: function() {
        return this.document.queueType;
    },
    set: function(queueType) {
        this.document.queueType = queueType;
        CB._modified(this,'queueType');
    }
});

Object.defineProperty(CloudQueue.prototype, 'ACL', {
    get: function() {
        return this.document.ACL;
    },
    set: function(ACL) {
        this.document.ACL = ACL;
        CB._modified(this,'ACL');
    }
});

Object.defineProperty(CloudQueue.prototype, 'id', {
    get: function() {
        return this.document._id;
    }
});

Object.defineProperty(CloudQueue.prototype, 'createdAt', {
    get: function() {
        return this.document.createdAt;
    }
});

Object.defineProperty(CloudQueue.prototype, 'updatedAt', {
    get: function() {
        return this.document.updatedAt;
    }
});


Object.defineProperty(CloudQueue.prototype, 'expires', {
    get: function() {
        return this.document.expires;
    },
    set: function(expires) {
        this.document.expires = expires;
        CB._modified(this,'expires');
    }
});

CloudQueue.getAll = function(callback){
    
    var def;
    
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    
    var thisObj = this;

    var params=JSON.stringify({       
        key: CB.appKey
    });

    var url = CB.apiUrl + "/queue/" + CB.appId + '/';

    CB._request('POST',url,params).then(function(response){

        if(response === ""){
            response = null;
        }

        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response)));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response)));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};

CloudQueue.get = function(queueName,callback){
    var queue = new CB.CloudQueue(queueName);
    return queue.get(callback);
};

CloudQueue.delete = function(queueName, callback){
    var queue = new CB.CloudQueue(queueName);
    return queue.delete(callback);
};

CB.CloudQueue = CloudQueue

CB.QueueMessage = function(data) {

    this.document = {};
    this.document.ACL = new CB.ACL(); //ACL(s) of the document
    this.document._type = 'queue-message';
    this.document.expires = null;
    this.document.timeout = 1800; //30 mins by default.
    this.document.delay = null;
    this.document.message = data;
    this.document._id = null;
    this.document._modifiedColumns = ['createdAt','updatedAt','ACL','expires','timeout','delay','message'];
    this.document._isModified = true;

};

Object.defineProperty(CB.QueueMessage.prototype, 'message', {
    get: function() {
        return this.document.message;
    },
    set: function(message) {
        this.document.message = message;
        CB._modified(this,'message');
    }
});

Object.defineProperty(CB.QueueMessage.prototype, 'ACL', {
    get: function() {
        return this.document.ACL;
    },
    set: function(ACL) {
        this.document.ACL = ACL;
        CB._modified(this,'ACL');
    }
});

Object.defineProperty(CB.QueueMessage.prototype, 'id', {
    get: function() {
        return this.document._id;
    }
});

Object.defineProperty(CB.QueueMessage.prototype, 'createdAt', {
    get: function() {
        return this.document.createdAt;
    },
    set: function(createdAt) {
        this.document.createdAt = createdAt;
        CB._modified(this,'createdAt');
    }
});

Object.defineProperty(CB.QueueMessage.prototype, 'updatedAt', {
    get: function() {
        return this.document.updatedAt;
    },
    set: function(updatedAt) {
        this.document.updatedAt = updatedAt;
        CB._modified(this,'updatedAt');
    }
});


Object.defineProperty(CB.QueueMessage.prototype, 'expires', {
    get: function() {
        return this.document.expires;
    },
    set: function(expires) {
        this.document.expires = expires;
        CB._modified(this,'expires');
    }
});

Object.defineProperty(CB.QueueMessage.prototype, 'timeout', {
    get: function() {
        return this.document.timeout;
    },
    set: function(timeout) {
        this.document.timeout = timeout;
        CB._modified(this,'timeout');
    }
});


Object.defineProperty(CB.QueueMessage.prototype, 'delay', {
    get: function() {
        if(this.document.delay)
            return this.document.delay/1000;
        else
            return 0;
    },
    set: function(delay) {
        delay *=1000; //converting to seconds from milli seconds,
        this.document.delay = delay;
        CB._modified(this,'delay');
    }
});


export default CB.CloudQueue