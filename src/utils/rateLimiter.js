class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(key = 'default') {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const userRequests = this.requests.get(key);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(key, validRequests);
    
    // Check if under limit
    if (validRequests.length < this.maxRequests) {
      validRequests.push(now);
      return true;
    }
    
    return false;
  }

  getRemainingRequests(key = 'default') {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      return this.maxRequests;
    }
    
    const userRequests = this.requests.get(key);
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(key = 'default') {
    if (!this.requests.has(key)) {
      return null;
    }
    
    const userRequests = this.requests.get(key);
    if (userRequests.length === 0) {
      return null;
    }
    
    const oldestRequest = Math.min(...userRequests);
    return new Date(oldestRequest + this.windowMs);
  }
}

// Create rate limiter instances for different operations
export const createRateLimiter = new RateLimiter(5, 60000); // 5 creates per minute
export const updateRateLimiter = new RateLimiter(10, 60000); // 10 updates per minute
export const importRateLimiter = new RateLimiter(2, 300000); // 2 imports per 5 minutes

export default RateLimiter;