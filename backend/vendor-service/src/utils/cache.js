const Redis = require('ioredis');
const Error = require('./error');

class Cache {
  constructor(options = {}) {
    const {
      redis = {
        host: 'localhost',
        port: 6379
      },
      prefix = 'cache',
      defaultTTL = 60 * 60,
      defaultMaxSize = 1000
    } = options;

    this.redis = new Redis(redis);
    this.prefix = prefix;
    this.defaultTTL = defaultTTL;
    this.defaultMaxSize = defaultMaxSize;
  }

  async get(key) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      const value = await this.redis.get(redisKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      throw Error.Internal('Cache get error', { error });
    }
  }

  async set(key, value, options = {}) {
    try {
      const {
        ttl = this.defaultTTL,
        maxSize = this.defaultMaxSize
      } = options;

      const redisKey = `${this.prefix}:${key}`;
      const serializedValue = JSON.stringify(value);

      // Check size
      if (serializedValue.length > maxSize) {
        throw Error.BadRequest('Cache value too large', {
          size: serializedValue.length,
          maxSize
        });
      }

      await this.redis.set(redisKey, serializedValue, 'EX', ttl);
      return true;
    } catch (error) {
      if (error instanceof Error.BadRequest) {
        throw error;
      }
      throw Error.Internal('Cache set error', { error });
    }
  }

  async del(key) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      await this.redis.del(redisKey);
      return true;
    } catch (error) {
      throw Error.Internal('Cache delete error', { error });
    }
  }

  async exists(key) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      return await this.redis.exists(redisKey);
    } catch (error) {
      throw Error.Internal('Cache exists error', { error });
    }
  }

  async ttl(key) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      return await this.redis.ttl(redisKey);
    } catch (error) {
      throw Error.Internal('Cache ttl error', { error });
    }
  }

  async expire(key, ttl) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      await this.redis.expire(redisKey, ttl);
      return true;
    } catch (error) {
      throw Error.Internal('Cache expire error', { error });
    }
  }

  async clear() {
    try {
      const keys = await this.redis.keys(`${this.prefix}:*`);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
      return true;
    } catch (error) {
      throw Error.Internal('Cache clear error', { error });
    }
  }

  async getOrSet(key, fn, options = {}) {
    try {
      const value = await this.get(key);
      if (value !== null) {
        return value;
      }

      const newValue = await fn();
      await this.set(key, newValue, options);
      return newValue;
    } catch (error) {
      throw Error.Internal('Cache getOrSet error', { error });
    }
  }

  async mget(keys) {
    try {
      const redisKeys = keys.map(key => `${this.prefix}:${key}`);
      const values = await this.redis.mget(redisKeys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      throw Error.Internal('Cache mget error', { error });
    }
  }

  async mset(entries, options = {}) {
    try {
      const {
        ttl = this.defaultTTL,
        maxSize = this.defaultMaxSize
      } = options;

      const pipeline = this.redis.pipeline();
      for (const [key, value] of entries) {
        const redisKey = `${this.prefix}:${key}`;
        const serializedValue = JSON.stringify(value);

        // Check size
        if (serializedValue.length > maxSize) {
          throw Error.BadRequest('Cache value too large', {
            key,
            size: serializedValue.length,
            maxSize
          });
        }

        pipeline.set(redisKey, serializedValue, 'EX', ttl);
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      if (error instanceof Error.BadRequest) {
        throw error;
      }
      throw Error.Internal('Cache mset error', { error });
    }
  }

  async mdel(keys) {
    try {
      const redisKeys = keys.map(key => `${this.prefix}:${key}`);
      await this.redis.del(redisKeys);
      return true;
    } catch (error) {
      throw Error.Internal('Cache mdel error', { error });
    }
  }

  async increment(key, amount = 1) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      return await this.redis.incrby(redisKey, amount);
    } catch (error) {
      throw Error.Internal('Cache increment error', { error });
    }
  }

  async decrement(key, amount = 1) {
    try {
      const redisKey = `${this.prefix}:${key}`;
      return await this.redis.decrby(redisKey, amount);
    } catch (error) {
      throw Error.Internal('Cache decrement error', { error });
    }
  }

  async keys(pattern = '*') {
    try {
      const keys = await this.redis.keys(`${this.prefix}:${pattern}`);
      return keys.map(key => key.replace(`${this.prefix}:`, ''));
    } catch (error) {
      throw Error.Internal('Cache keys error', { error });
    }
  }

  async size() {
    try {
      const keys = await this.redis.keys(`${this.prefix}:*`);
      return keys.length;
    } catch (error) {
      throw Error.Internal('Cache size error', { error });
    }
  }

  async info() {
    try {
      const info = await this.redis.info();
      const keys = await this.redis.keys(`${this.prefix}:*`);
      const memory = await this.redis.info('memory');

      return {
        keys: keys.length,
        memory: memory.used_memory_human,
        info: info
      };
    } catch (error) {
      throw Error.Internal('Cache info error', { error });
    }
  }
}

module.exports = Cache; 