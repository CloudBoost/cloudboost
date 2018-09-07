

var Redis = require('ioredis');

var ioRedisAdapter = require('socket.io-redis');

var appConfig = require('./config');

var winston = require('winston');

function constructUrl (io) {
    var config = loadConfig();

    try {

        //Set up Redis.
        if (!config.redis && !process.env["REDIS_1_PORT_6379_TCP_ADDR"] && !process.env["REDIS_SENTINEL_SERVICE_HOST"] && !process.env["REDIS_PORT_6379_TCP_ADDR"]) {
            winston.error("FATAL : Redis Cluster Not found. Use docker-compose from https://github.com/cloudboost/docker or Kubernetes from https://github.com/cloudboost/kubernetes");
        }

        var hosts = [];

        var isCluster = false;

        if (config.redis && config.redis.length > 0) {
            //take from config file
            for (var i = 0; i < config.redis.length; i++) {
                hosts.push({
                    host: config.redis[i].host,
                    port: config.redis[i].port,
                    enableReadyCheck: false
                });

                if (config.redis[i].password) {
                    hosts[i].password = config.redis[i].password;
                }
            }

            if (config.redis.length > 1) {
                isCluster = true;
            }

        } else {

            if (process.env["REDIS_SENTINEL_SERVICE_HOST"] || process.env["KUBERNETES_STATEFUL_REDIS_URL"]) {
                //this is running on Kubernetes


                if (process.env["KUBERNETES_STATEFUL_REDIS_URL"]) {

                    winston.info('REDIS running on kube cluster');

                    process.env["KUBERNETES_STATEFUL_REDIS_URL"].split(',').map(function (x) {
                        hosts.push({
                            host: x.split(':')[0],
                            port: x.split(':')[1],
                            enableReadyCheck: false
                        });
                    });

                    isCluster = true;

                } else {
                    var redis_obj = {
                        host: process.env["REDIS_SENTINEL_SERVICE_HOST"],
                        port: process.env["REDIS_SENTINEL_SERVICE_PORT"],
                        enableReadyCheck: false
                    };
                    hosts.push(redis_obj);
                }

            } else {
                //take from env variables.

                var count = 1;

                if (process.env["REDIS_PORT_6379_TCP_ADDR"] && process.env["REDIS_PORT_6379_TCP_PORT"]) {
                    var redis_port_obj = {
                        host: process.env["REDIS_PORT_6379_TCP_ADDR"],
                        port: process.env["REDIS_PORT_6379_TCP_PORT"],
                        enableReadyCheck: false
                    };

                    hosts.push(redis_port_obj);

                } else {
                    while (process.env["REDIS_" + count + "_PORT_6379_TCP_ADDR"] && process.env["REDIS_" + count + "_PORT_6379_TCP_PORT"]) {
                        if (count > 1) {
                            isCluster = true;
                        }
                        var redis_replica = {
                            host: process.env["REDIS_" + count + "_PORT_6379_TCP_ADDR"],
                            port: process.env["REDIS_" + count + "_PORT_6379_TCP_PORT"],
                            enableReadyCheck: false
                        };
                        hosts.push(redis_replica);
                        count++;
                    }

                }
            }
        }

        //If everything else failsm then try local redis.
        if (hosts.length === 0) {
            var redis_raw = {
                host: "127.0.0.1",
                port: "6379",
                enableReadyCheck: false
            };

            hosts.push(redis_raw);
        }

        if (isCluster) {
            appConfig.redisClient = new Redis.Cluster(hosts);


            io.adapter(ioRedisAdapter({
                pubClient: new Redis.Cluster(hosts),
                subClient: new Redis.Cluster(hosts)
            }));

        } else {

            appConfig.redisClient = new Redis(hosts[0]);


            io.adapter(ioRedisAdapter({
                host: hosts[0].host,
                port: hosts[0].port
            }));
        }

        appConfig.realTime = require('../database-connect/realTime')(io);

    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
}

function loadConfig () {
    try {
        var config = require('./cloudboost');
        return config;
    } catch (e) {
        return {};
    }
}

module.exports = constructUrl;
