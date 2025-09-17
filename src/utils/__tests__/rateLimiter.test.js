import RateLimiter from '../rateLimiter';

describe('RateLimiter', () => {
  let rateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter(3, 1000); // 3 requests per second
  });

  test('allows requests under limit', () => {
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(true);
  });

  test('blocks requests over limit', () => {
    rateLimiter.isAllowed('user1');
    rateLimiter.isAllowed('user1');
    rateLimiter.isAllowed('user1');
    
    expect(rateLimiter.isAllowed('user1')).toBe(false);
  });

  test('tracks different users separately', () => {
    rateLimiter.isAllowed('user1');
    rateLimiter.isAllowed('user1');
    rateLimiter.isAllowed('user1');
    
    expect(rateLimiter.isAllowed('user1')).toBe(false);
    expect(rateLimiter.isAllowed('user2')).toBe(true);
  });

  test('calculates remaining requests correctly', () => {
    expect(rateLimiter.getRemainingRequests('user1')).toBe(3);
    
    rateLimiter.isAllowed('user1');
    expect(rateLimiter.getRemainingRequests('user1')).toBe(2);
    
    rateLimiter.isAllowed('user1');
    expect(rateLimiter.getRemainingRequests('user1')).toBe(1);
  });
});