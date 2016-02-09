module.exports = function () {
    
    global.app.post('/db/elasticSearch/Disconnect', function (req, res) {
        global.esClientTemp = global.esClient;
        global.esClient = null;
        global.elasticDisconnected = true;
        res.status(200).send("Success");
    });
    
    global.app.post('/db/elasticSearch/connect', function (req, res) {
        if(global.esClientTemp)
            global.esClient = global.esClientTemp;
        global.elasticDisconnected = false;
        res.status(200).send("Success");
    });

}
