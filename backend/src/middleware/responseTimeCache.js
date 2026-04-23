const redisClient = require('../config/redisClient');

/**
 * Middleware that logs response time and optionally caches GET responses for specified prefixes.
 * options: { cachePrefixes: string[], ttlSeconds: number }
 */
module.exports = function responseTimeCache(options = {}) {
  const prefixes = options.cachePrefixes || ['/'];
  const ttl = options.ttlSeconds || 15; // default 15s for Redis

  return async (req, res, next) => {
    const start = Date.now();
    
    // Extract userId from JWT if available to make cache user-aware
    let userId = 'guest';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token); // Use decode to be fast, verification happens in authMiddleware
        if (decoded && (decoded.userId || decoded.id)) {
          userId = decoded.userId || decoded.id;
        }
      } catch (e) {
        // ignore decoding errors
      }
    }

    const key = `cache:${userId}:${req.method}:${req.originalUrl}`;

    // serve from cache for GET requests matching prefix
    if (req.method === 'GET' && prefixes.some(p => req.originalUrl.startsWith(p))) {
      try {
        if (redisClient.isReady) {
          const cachedData = await redisClient.get(key);
          if (cachedData) {
            const entry = JSON.parse(cachedData);
            res.set(entry.headers || {});
            res.status(entry.status || 200).send(entry.body);
            console.log(`[REDIS HIT] ${key} (${Date.now() - start}ms)`);
            return;
          }
        }
      } catch (e) {
        console.error('[REDIS CACHE ERROR]', e.message);
        // Fallback to regular DB query if Redis fails
      }
    }

    // capture send to record body for caching and compute duration
    const origSend = res.send.bind(res);
    res.send = function (body) {
      const duration = Date.now() - start;
      console.log(`[TIMING] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${duration}ms`);

      try {
        if (req.method === 'GET' && prefixes.some(p => req.originalUrl.startsWith(p)) && res.statusCode === 200) {
          if (redisClient.isReady) {
            const headers = {};
            // store minimal headers that might be useful
            const contentType = res.getHeader ? res.getHeader('content-type') : res.get('Content-Type');
            if (contentType) headers['content-type'] = contentType;
            
            const cacheEntry = JSON.stringify({ body, status: res.statusCode, headers });
            redisClient.setEx(key, ttl, cacheEntry).catch(e => {
              console.error('[REDIS SET ERROR]', e.message);
            });
          }
        }
      } catch (e) {
        // ignore cache errors
      }

      return origSend(body);
    };

    next();
  };
};
