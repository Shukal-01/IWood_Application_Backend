// Simple in-memory store for rate limiting
const rateLimit = new Map();

/**
 * Rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests in the time window
 * @param {string} options.message - Error message when limit is exceeded
 * @returns {Function} Express middleware
 */
const rateLimitMiddleware = ({
  windowMs = 60 * 1000, // 1 minute by default
  max = 100, // 100 requests per windowMs by default
  message = 'Too many requests, please try again later.'
} = {}) => {
  return (req, res, next) => {
    // Use IP as identifier (consider using user ID if authenticated)
    const key = req.ip;
    const now = Date.now();

    // Initialize or reset entry if window has passed
    if (!rateLimit.has(key) || (now - rateLimit.get(key).timestamp > windowMs)) {
      rateLimit.set(key, {
        count: 1,
        timestamp: now
      });
      return next();
    }

    // Update existing entry
    const entry = rateLimit.get(key);
    
    // Check if limit is reached
    if (entry.count >= max) {
      return res.status(429).json({
        message: 'error',
        detail: message
      });
    }

    // Increment count and continue
    entry.count++;
    return next();
  };
};

export default rateLimitMiddleware; 