// redisClient.js
// Responsibility: Create and export a single Redis client instance
// All modules that need persistence import from here

const { Redis } = require('@upstash/redis');

// Create Redis client using environment variables
// These are set in Railway so they never appear in code
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('Redis client initialized');

module.exports = { redis };