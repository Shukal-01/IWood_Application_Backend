// A simple in-memory cache
const cache = new Map();
const DEFAULT_EXPIRATION = 60 * 5; // 5 minutes in seconds

/**
 * Middleware for caching API responses
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (duration = DEFAULT_EXPIRATION) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create a cache key from the request URL
    const key = req.originalUrl;

    // Check if we have a cached response
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
      // Check if the cache is still valid
      if (Date.now() < cachedResponse.expiry) {
        return res.json(cachedResponse.data);
      }
      // Cache expired, remove it
      cache.delete(key);
    }

    // Store the original json method
    const originalJson = res.json;

    // Override the json method to cache the response
    res.json = function(data) {
      // Cache the response data with expiry time
      cache.set(key, {
        data,
        expiry: Date.now() + (duration * 1000)
      });
      
      // Call the original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Function to clear the entire cache
const clearCache = () => {
  cache.clear();
};

// Function to clear a specific cache entry
const clearCacheByKey = (key) => {
  cache.delete(key);
};

export { cacheMiddleware, clearCache, clearCacheByKey }; 