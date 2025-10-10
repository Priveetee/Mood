import { RateLimiter } from 'sveltekit-rate-limiter/server';

export const authLimiter = new RateLimiter({
  IP: [5, 'm'],
});
