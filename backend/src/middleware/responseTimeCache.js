const cacheStore = new Map();

/**
 * Middleware that logs response time and optionally caches GET responses for specified prefixes.
 * options: { cachePrefixes: string[], ttlSeconds: number }
 */
module.exports = function responseTimeCache(options = {}) {
  const prefixes = options.cachePrefixes || ['/dashboard'];
  const ttl = (options.ttlSeconds || 5) * 1000; // default 5s

  return (req, res, next) => {
    const start = Date.now();
    const key = req.method + ' ' + req.originalUrl;

    // serve from cache for GET requests matching prefix
    if (req.method === 'GET' && prefixes.some(p => req.originalUrl.startsWith(p))) {
      const entry = cacheStore.get(key);
      if (entry && (Date.now() - entry.ts) < ttl) {
        res.set(entry.headers || {});
        res.status(entry.status || 200).send(entry.body);
        console.log(`[CACHE HIT] ${key} (${Date.now() - start}ms)`);
        return;
      }
    }

    // capture send to record body for caching and compute duration
    const origSend = res.send.bind(res);
    res.send = function (body) {
      const duration = Date.now() - start;
      console.log(`[TIMING] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${duration}ms`);

      try {
        if (req.method === 'GET' && prefixes.some(p => req.originalUrl.startsWith(p)) && res.statusCode === 200) {
          const headers = {};
          // store minimal headers that might be useful
          const contentType = res.getHeader ? res.getHeader('content-type') : res.get('Content-Type');
          if (contentType) headers['content-type'] = contentType;
          cacheStore.set(key, { body, ts: Date.now(), status: res.statusCode, headers });
        }
      } catch (e) {
        // ignore cache errors
      }

      return origSend(body);
    };

    next();
  };
};
