
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

module.exports = function () {
    
    global.app.post('/db/mongo/Disconnect',function(req, res){
        global.databaseTemp = global.database;
        global.database = null;
        global.mongoDisconnected = true;
        res.status(200).send("Success");
    });

    global.app.post('/db/mongo/connect', function (req, res) {
        if(global.databaseTemp) {
            global.database = global.databaseTemp;
        }
        global.mongoDisconnected = false;
        res.status(200).send("Success");
    });
};
