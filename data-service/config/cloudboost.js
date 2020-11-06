module.exports = {
  mongo: [{
    host: process.env.MONGO_HOST || 'localhost',
    port: '27017',
  }],
  redis: [{
    host: process.env.REDIS_HOST || 'localhost',
    port: 6379,
  }],
};
