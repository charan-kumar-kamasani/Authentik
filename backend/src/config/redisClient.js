const redis = require('redis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = redis.createClient({
  url: redisUrl
});

redisClient.on('error', (err) => {
  console.error('[REDIS] Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('[REDIS] Connected to local Redis server');
});

redisClient.connect().catch(console.error);

module.exports = redisClient;
