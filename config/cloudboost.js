module.exports = {
  mongo: [{
    host: process.env.MONGO_HOST || 'localhost',
    port: '27017',
  }],
  elasticsearch: [{
    host: process.env.ELASTIC_SEARCH_HOST || 'localhost',
    port: '9200',
  }],
  redis: [{
    host: process.env.REDIS_HOST || 'localhost',
    port: 6379,
  }],
};
