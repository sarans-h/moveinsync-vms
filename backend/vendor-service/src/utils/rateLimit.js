const Redis = require('ioredis');
const Error = require('./error');

class RateLimit {
  constructor(options = {}) {
    const {
      redis = {
        host: 'localhost',
        port: 6379
      },
      prefix = 'ratelimit',
      defaultLimit = 100,
      defaultWindow = 60,
      defaultBlockDuration = 60 * 60
    } = options;

    this.redis = new Redis(redis);
    this.prefix = prefix;
    this.defaultLimit = defaultLimit;
    this.defaultWindow = defaultWindow;
    this.defaultBlockDuration = defaultBlockDuration;
  }

  async check(key, options = {}) {
    try {
      const {
        limit = this.defaultLimit,
        window = this.defaultWindow,
        blockDuration = this.defaultBlockDuration
      } = options;

      const redisKey = `${this.prefix}:${key}`;
      const now = Date.now();
      const windowStart = now - window * 1000;

      // Get current count
      const count = await this.redis.zcount(redisKey, windowStart, '+inf');

      // Check if blocked
      const blocked = await this.redis.get(`${redisKey}:blocked`);
      if (blocked) {
        throw Error.TooManyRequests('Rate limit exceeded', {
          retryAfter: parseInt(blocked) - now
        });
      }

      // Check if limit exceeded
      if (count >= limit) {
        // Set block
        await this.redis.set(
          `${redisKey}:blocked`,
          now + blockDuration * 1000,
          'PX',
          blockDuration * 1000
        );

        throw Error.TooManyRequests('Rate limit exceeded', {
          retryAfter: blockDuration
        });
      }

      // Add request
      await this.redis.zadd(redisKey, now, `${now}-${Math.random()}`);
      await this.redis.expire(redisKey, window);

      return {
        remaining: limit - count - 1,
        reset: now + window * 1000
      };
    } catch (error) {
      if (error instanceof Error.TooManyRequests) {
        throw error;
      }
      throw Error.Internal('Rate limit check error', { error });
    }
  }

  async reset(key) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      await this.redis.del(redisKey, `${redisKey}:blocked`);
    } catch (error) {
      throw Error.Internal('Rate limit reset error', { error });
    }
  }

  async get(key) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      const now = Date.now();
      const windowStart = now - this.defaultWindow * 1000;

      const count = await this.redis.zcount(redisKey, windowStart, '+inf');
      const blocked = await this.redis.get(`${redisKey}:blocked`);

      return {
        count,
        remaining: this.defaultLimit - count,
        reset: blocked ? parseInt(blocked) : now + this.defaultWindow * 1000,
        blocked: !!blocked
      };
    } catch (error) {
      throw Error.Internal('Rate limit get error', { error });
    }
  }

  async set(key, options = {}) {
    try {
      const {
        limit = this.defaultLimit,
        window = this.defaultWindow,
        blockDuration = this.defaultBlockDuration
      } = options;

      const redisKey = `${this.prefix}:${key}`;
      const now = Date.now();

      // Clear existing data
      await this.redis.del(redisKey, `${redisKey}:blocked`);

      // Set new limit
      await this.redis.zadd(redisKey, now, `${now}-${Math.random()}`);
      await this.redis.expire(redisKey, window);

      return {
        limit,
        window,
        blockDuration,
        remaining: limit - 1,
        reset: now + window * 1000
      };
    } catch (error) {
      throw Error.Internal('Rate limit set error', { error });
    }
  }

  async increment(key, options = {}) {
    try {
      const {
        limit = this.defaultLimit,
        window = this.defaultWindow,
        blockDuration = this.defaultBlockDuration
      } = options;

      const redisKey = `${this.prefix}:${key}`;
      const now = Date.now();
      const windowStart = now - window * 1000;

      // Get current count
      const count = await this.redis.zcount(redisKey, windowStart, '+inf');

      // Check if blocked
      const blocked = await this.redis.get(`${redisKey}:blocked`);
      if (blocked) {
        throw Error.TooManyRequests('Rate limit exceeded', {
          retryAfter: parseInt(blocked) - now
        });
      }

      // Check if limit exceeded
      if (count >= limit) {
        // Set block
        await this.redis.set(
          `${redisKey}:blocked`,
          now + blockDuration * 1000,
          'PX',
          blockDuration * 1000
        );

        throw Error.TooManyRequests('Rate limit exceeded', {
          retryAfter: blockDuration
        });
      }

      // Add request
      await this.redis.zadd(redisKey, now, `${now}-${Math.random()}`);
      await this.redis.expire(redisKey, window);

      return {
        count: count + 1,
        remaining: limit - count - 1,
        reset: now + window * 1000
      };
    } catch (error) {
      if (error instanceof Error.TooManyRequests) {
        throw error;
      }
      throw Error.Internal('Rate limit increment error', { error });
    }
  }

  async decrement(key) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      const now = Date.now();
      const windowStart = now - this.defaultWindow * 1000;

      // Remove oldest request
      const oldest = await this.redis.zrange(redisKey, 0, 0);
      if (oldest.length > 0) {
        await this.redis.zrem(redisKey, oldest[0]);
      }

      // Get current count
      const count = await this.redis.zcount(redisKey, windowStart, '+inf');

      return {
        count,
        remaining: this.defaultLimit - count,
        reset: now + this.defaultWindow * 1000
      };
    } catch (error) {
      throw Error.Internal('Rate limit decrement error', { error });
    }
  }

  async isLimited(key) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      const blocked = await this.redis.get(`${redisKey}:blocked`);
      return !!blocked;
    } catch (error) {
      throw Error.Internal('Rate limit isLimited error', { error });
    }
  }

  async getRemaining(key) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      const now = Date.now();
      const windowStart = now - this.defaultWindow * 1000;

      const count = await this.redis.zcount(redisKey, windowStart, '+inf');
      return this.defaultLimit - count;
    } catch (error) {
      throw Error.Internal('Rate limit getRemaining error', { error });
    }
  }

  async getReset(key) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      const blocked = await this.redis.get(`${redisKey}:blocked`);
      return blocked ? parseInt(blocked) : Date.now() + this.defaultWindow * 1000;
    } catch (error) {
      throw Error.Internal('Rate limit getReset error', { error });
    }
  }
}

module.exports = RateLimit; 