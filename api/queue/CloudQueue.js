
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var customHelper = require('../../helpers/custom.js');

module.exports = function () {

    global.app.put('/queue/:appId/:queueName/message', function (req, res) { //get the app object containing keys

        //This handler pushes or updates a message in a queue.
        console.log('PUSH QUEUE MESSAGE HANDLER');

        var appId = req.params.appId;
        var queueName = req.params.queueName;

        var document = req.body.document;

        var userId = req.session.userId || null;

        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.pushOrUpdate(appId, document, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ Push / Update Success +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ Push / Update Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

        global.apiTracker.log(appId,"Queue / Message / Push", req.url,sdk);
    });

    global.app.post('/queue/:appId/:queueName/message/:id', function (req, res) {

        //This handler gets the message from the queue.
        console.log('GET QUEUE MESSAGE HANDLER');

        var appId = req.params.appId;
        var queueName = req.params.queueName;

        var document = req.body.document;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.getMessage(appId, {_id:req.params.id}, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ Push / Update Success +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ Push / Update Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

        global.apiTracker.log(appId,"Queue / Message / Get", req.url,sdk);

    });

    global.app.post('/queue/:appId/:queueName/messages', function (req, res) {

        //This handler gets the message from the queue.
        console.log('GET ALL MESSAGES');

        var appId = req.params.appId;
        var queueName = req.params.queueName;

        var document = req.body.document;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.getAllMessages(appId, { _queueName : req.params.queueName }, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ Get All Messages +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ Get All Mesages Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

        global.apiTracker.log(appId,"Queue / Message / GetAll", req.url,sdk);

    });
    
    
    global.app.post('/queue/:appId/:queueName/create', function (req, res) {

        //This handler gets the message from the queue.
        console.log('CREATE QUEUE HANDLER');

        var appId = req.params.appId;
        var queueName = req.params.queueName;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        
        var document = req.body.document;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.createQueue(appId, document, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ Create Queue Sucesss +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ Create Queue Success +++++++');
            console.log(error);
            res.status(400).send(error);
        });

        global.apiTracker.log(appId,"Queue / Create", req.url,sdk);

    });

    global.app.post('/queue/:appId/:queueName/getMessage', function (req, res) {

        //This handler pushes or updates a message in a queue.
        console.log('PULL QUEUE MESSAGE HANDLER');

        var appId = req.params.appId;
        var queueName = req.params.queueName;

        var document = req.body.document;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        var count = req.body.count;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.pull(appId, { _queueName : req.params.queueName },count, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ Pull Success +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ Pull Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

        global.apiTracker.log(appId,"Queue / Message / Pull", req.url,sdk);

    });

    global.app.post('/queue/:appId/:queueName/peekMessage', function (req, res) {

        //This handler pushes or updates a message in a queue.
        console.log('PEEK QUEUE MESSAGE HANDLER');

        var appId = req.params.appId;
        var queueName = req.params.queueName;

        var document = req.body.document;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        var count = req.body.count;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.pull(appId, { _queueName : req.params.queueName },count, customHelper.getAccessList(req), isMasterKey, true);
        }).then(function (result) {
            console.log('+++ Peek Success +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ Peek Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

        global.apiTracker.log(appId,"Queue / Message / Peek", req.url,sdk);

    });


    //Delete Message
    global.app.delete('/queue/:appId/:queueName/message/:id', _deleteMessage);
    global.app.put('/queue/:appId/:queueName/message/:id', _deleteMessage);

    function _deleteMessage(req, res) {

        //This handler dleetes the message from the queue.
        console.log('DELETE QUEUE MESSAGE HANDLER');

        var appId = req.params.appId;
        var queueName = req.params.queueName;
        var id = req.params.id;

        var document = req.body.document;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.deleteMessage(appId, queueName, id, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ DELETE Success +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ DELETE Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

       global.apiTracker.log(appId,"Queue / Message / Delete", req.url,sdk);

    }


    global.app.post('/queue/:appId/:queueName/subscriber', function (req, res) {
        //check if the queue has a write access.
        //if yes, Update the queue.
        console.log('ADD SUBSCRIBER QUEUE MESSAGE HANDLER');

        var appId = req.params.appId;
        var queueName = req.params.queueName;
        var document = req.body.document;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.addSubscriber(appId, document, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ ADD SUbscriber Success +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ Add Subscriber Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

        global.apiTracker.log(appId,"Queue / Subscriber / Add", req.url,sdk);


    });

    //Remove subscriber
    global.app.delete('/queue/:appId/:queueName/subscriber', _removeSubscriber);
    global.app.put('/queue/:appId/:queueName/subscriber', _removeSubscriber);

    function _removeSubscriber(req, res) {
        //check if the queue has a write access.
        //if yes, Update the queue.
        console.log('Remove SUBSCRIBER QUEUE MESSAGE HANDLER');

        var appId = req.params.appId;
        var queueName = req.params.queueName;
        var document = req.body.document;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.removeSubscriber(appId, document, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ Remove SUbscriber Success +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ Remove Subscriber Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

       global.apiTracker.log(appId,"Queue / Subscriber / Delete", req.url,sdk);
    }

    global.app.delete('/queue/:appId/:queueName', _deleteQueue);

    function _deleteQueue(req, res) {
        //check if the queue has a write access.
        //if yes, Update the queue.
        console.log('DELETE');

        var appId = req.params.appId;
        var queueName = req.params.queueName;
        var document = req.body.document;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.deleteQueue(appId, document, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ DELETE Subscriber Success +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ DELETE Subscriber Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

        global.apiTracker.log(appId,"Queue / Delete", req.url,sdk);
    }

    global.app.put('/queue/:appId/:queueName', function (req, res) {

        if(req.body && req.body.method=="DELETE"){
            /***********************DELETE Q**********************/
            _deleteQueue(req, res);
            /***********************DELETE Q**********************/
        }else{
            /***********************UPDATE Q**********************/
            //check if the queue has a write access.
            //if yes, Update the queue.
            console.log('Update Queue');

            var appId = req.params.appId;
            var queueName = req.params.queueName;

            var userId = req.session.userId || null;
            var appKey = req.body.key;
            var document = req.body.document;
            var sdk = req.body.sdk || "REST";

            global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
                return global.queueService.updateQueue(appId, document, customHelper.getAccessList(req), isMasterKey);
            }).then(function (result) {
                console.log('+++ Uopdate Queue Success +++');
                console.log(result);
                res.status(200).send(result);
            }, function (error) {
                console.log('++++++ Update Queue Error +++++++');
                console.log(error);
                res.status(400).send(error);
            });

            global.apiTracker.log(appId,"Queue / Update", req.url,sdk);
            /***********************UPDATE Q**********************/
        }
    });

    //Clear Queue
    global.app.delete('/queue/:appId/:queueName/clear', _clearQueue);
    global.app.put('/queue/:appId/:queueName/clear', _clearQueue);

    function _clearQueue(req, res) {
        //check if the queue has a write access.
        //if yes, Update the queue.
        console.log('CLEAR QUEUE');

        var appId = req.params.appId;
        var queueName = req.params.queueName;
        var document = req.body.document;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.clearQueue(appId, document, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ CLEAR QUEUE Subscriber Success +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ CLEAR QUEUE Subscriber Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

        global.apiTracker.log(appId,"Queue / Clear", req.url,sdk);

    }

    global.app.post('/queue/:appId/:queueName', function (req, res) {
        //check if the queue has a write access.
        //if yes, Update the queue.
        console.log('GET QUEUE');

        var appId = req.params.appId;
        var queueName = req.params.queueName;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.getQueue(appId, queueName, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ GET Queue Success +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ Get Queue Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

        global.apiTracker.log(appId,"Queue / Get", req.url,sdk);
    });

    global.app.put('/queue/:appId/:queueName/:messageId/refresh-message-timeout', function (req, res) {
        //check if the queue has a write access.
        //if yes, Update the queue.
        console.log('Refresh Message Timeout');

        var appId = req.params.appId;
        var queueName = req.params.queueName;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        var queueName = req.params.queueName;
        var messageId = req.params.messageId;

        var timeout = req.body.timeout;
        
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.refreshMessageTimeout(appId, queueName, messageId, timeout, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ Refresh Message Timeout Success +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ Refresh MEssage Timeout Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

        global.apiTracker.log(appId,"Queue / Message / RefreshTimeout", req.url,sdk);
    });   

    global.app.post('/queue/:appId/', function (req, res) {
        //check if the queue has a write access.
        //if yes, Update the queue.
        console.log('GET ALL Queues');

        var appId = req.params.appId;

        var userId = req.session.userId || null;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.queueService.getAllQueues(appId,customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            console.log('+++ Get All Queues Success +++');
            console.log(result);
            res.status(200).send(result);
        }, function (error) {
            console.log('++++++ Get All Queues Error +++++++');
            console.log(error);
            res.status(400).send(error);
        });

        global.apiTracker.log(appId,"Queue / GetAll", req.url,sdk);
    });
};
