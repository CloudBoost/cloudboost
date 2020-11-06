
const Redis = require('ioredis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const keys = require('./keys');

module.exports = function (app) {
  // Set up Redis.
  const hosts = [];

  let isCluster = false;

  if (keys.config && keys.config.redis && keys.config.redis.length > 0) {
    // take from config file
    for (let i = 0; i < keys.config.redis.length; i++) {
      hosts.push({ host: keys.config.redis[i].host, port: keys.config.redis[i].port });

      if (keys.config.redis[i].password) {
        hosts[i].password = keys.config.redis[i].password;
      }
    }

    if (keys.config.redis.length > 1) {
      isCluster = true;
    }
  } else {
    // take from env variables
    let obj = {};

    if (process.env.REDIS_SENTINEL_SERVICE_HOST || process.env.KUBERNETES_STATEFUL_REDIS_URL) {
      // this is running on Kubernetes

      if (process.env.KUBERNETES_STATEFUL_REDIS_URL) {
        process.env.KUBERNETES_STATEFUL_REDIS_URL.split(',').map(x => hosts.push({
          host: x.split(':')[0],
          port: x.split(':')[1],
          enableReadyCheck: false,
        }));

        isCluster = true;
      } else {
        obj = {
          host: process.env.REDIS_SENTINEL_SERVICE_HOST,
          port: process.env.REDIS_SENTINEL_SERVICE_PORT,
          enableReadyCheck: false,
        };
        hosts.push(obj);
      }
    } else {
      let j = 1;
      if (process.env.REDIS_PORT_6379_TCP_ADDR && process.env.REDIS_PORT_6379_TCP_PORT) {
        obj = {
          host: process.env.REDIS_PORT_6379_TCP_ADDR,
          port: process.env.REDIS_PORT_6379_TCP_PORT,
          enableReadyCheck: false,
        };

        hosts.push(obj);
      } else {
        while (process.env[`REDIS_${j}_PORT_6379_TCP_ADDR`] && process.env[`REDIS_${j}_PORT_6379_TCP_PORT`]) {
          if (j > 1) {
            isCluster = true;
          }
          obj = {
            host: process.env[`REDIS_${j}_PORT_6379_TCP_ADDR`],
            port: process.env[`REDIS_${j}_PORT_6379_TCP_PORT`],
          };
          hosts.push(obj);
          j++;
        }
      }
    }
  }

  if (isCluster) {
    keys.redisClient = new Redis.Cluster(hosts);
  } else {
    keys.redisClient = new Redis(hosts[0]);
  }

  // Configure Session,Passport,bodyparse after redisClient
  app.use(session({
    key: 'session',
    resave: false, // does not forces session to be saved even when unmodified
    saveUninitialized: false, // doesnt forces a session that is "uninitialized"(new but unmodified) to be saved to the store
    secret: 'azuresample',
    store: new RedisStore({
      client: keys.redisClient,
      ttl: 30 * 24 * 60 * 60, // 30 * 24 * 60 * 60 = 30 days.
    }),
    cookie: {
      maxAge: (2600000000),
    }, // 2600000000 is for 1 month
  }));
};
