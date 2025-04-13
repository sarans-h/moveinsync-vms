const Bull = require('bull');
const Error = require('./error');

class Queue {
  constructor(options = {}) {
    const {
      redis = {
        host: 'localhost',
        port: 6379
      },
      prefix = 'queue',
      defaultJobOptions = {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    } = options;

    this.queues = new Map();
    this.redis = redis;
    this.prefix = prefix;
    this.defaultJobOptions = defaultJobOptions;
  }

  createQueue(name, options = {}) {
    if (this.queues.has(name)) {
      return this.queues.get(name);
    }

    const queue = new Bull(name, {
      redis: this.redis,
      prefix: this.prefix,
      defaultJobOptions: {
        ...this.defaultJobOptions,
        ...options
      }
    });

    queue.on('error', error => {
      console.error(`Queue ${name} error:`, error);
    });

    queue.on('failed', (job, error) => {
      console.error(`Job ${job.id} in queue ${name} failed:`, error);
    });

    queue.on('completed', job => {
      console.log(`Job ${job.id} in queue ${name} completed`);
    });

    this.queues.set(name, queue);
    return queue;
  }

  async add(name, data, options = {}) {
    try {
      const queue = this.createQueue(name);
      return await queue.add(data, options);
    } catch (error) {
      throw Error.Internal('Queue add error', { error });
    }
  }

  async addBulk(name, dataArray, options = {}) {
    try {
      const queue = this.createQueue(name);
      return await queue.addBulk(
        dataArray.map(data => ({ data, opts: options }))
      );
    } catch (error) {
      throw Error.Internal('Queue addBulk error', { error });
    }
  }

  async process(name, concurrency, handler) {
    try {
      const queue = this.createQueue(name);
      return queue.process(concurrency, handler);
    } catch (error) {
      throw Error.Internal('Queue process error', { error });
    }
  }

  async getJob(name, jobId) {
    try {
      const queue = this.createQueue(name);
      return await queue.getJob(jobId);
    } catch (error) {
      throw Error.Internal('Queue getJob error', { error });
    }
  }

  async getJobs(name, types = ['waiting', 'active', 'completed', 'failed', 'delayed'], start = 0, end = -1) {
    try {
      const queue = this.createQueue(name);
      return await queue.getJobs(types, start, end);
    } catch (error) {
      throw Error.Internal('Queue getJobs error', { error });
    }
  }

  async getJobCounts(name) {
    try {
      const queue = this.createQueue(name);
      return await queue.getJobCounts();
    } catch (error) {
      throw Error.Internal('Queue getJobCounts error', { error });
    }
  }

  async clean(grace, status) {
    try {
      const promises = Array.from(this.queues.values()).map(queue =>
        queue.clean(grace, status)
      );
      return await Promise.all(promises);
    } catch (error) {
      throw Error.Internal('Queue clean error', { error });
    }
  }

  async pause(name) {
    try {
      const queue = this.createQueue(name);
      return await queue.pause();
    } catch (error) {
      throw Error.Internal('Queue pause error', { error });
    }
  }

  async resume(name) {
    try {
      const queue = this.createQueue(name);
      return await queue.resume();
    } catch (error) {
      throw Error.Internal('Queue resume error', { error });
    }
  }

  async removeJob(name, jobId) {
    try {
      const queue = this.createQueue(name);
      return await queue.removeJob(jobId);
    } catch (error) {
      throw Error.Internal('Queue removeJob error', { error });
    }
  }

  async removeJobs(name, jobIds) {
    try {
      const queue = this.createQueue(name);
      return await Promise.all(jobIds.map(jobId => queue.removeJob(jobId)));
    } catch (error) {
      throw Error.Internal('Queue removeJobs error', { error });
    }
  }

  async retryJob(name, jobId) {
    try {
      const queue = this.createQueue(name);
      return await queue.retryJob(jobId);
    } catch (error) {
      throw Error.Internal('Queue retryJob error', { error });
    }
  }

  async retryJobs(name, jobIds) {
    try {
      const queue = this.createQueue(name);
      return await Promise.all(jobIds.map(jobId => queue.retryJob(jobId)));
    } catch (error) {
      throw Error.Internal('Queue retryJobs error', { error });
    }
  }

  async getEvents(name) {
    try {
      const queue = this.createQueue(name);
      return {
        waiting: await queue.getWaitingCount(),
        active: await queue.getActiveCount(),
        completed: await queue.getCompletedCount(),
        failed: await queue.getFailedCount(),
        delayed: await queue.getDelayedCount(),
        paused: await queue.getPausedCount()
      };
    } catch (error) {
      throw Error.Internal('Queue getEvents error', { error });
    }
  }

  async close(name) {
    try {
      const queue = this.createQueue(name);
      await queue.close();
      this.queues.delete(name);
    } catch (error) {
      throw Error.Internal('Queue close error', { error });
    }
  }

  async closeAll() {
    try {
      const promises = Array.from(this.queues.values()).map(queue =>
        queue.close()
      );
      await Promise.all(promises);
      this.queues.clear();
    } catch (error) {
      throw Error.Internal('Queue closeAll error', { error });
    }
  }

  async getQueue(name) {
    return this.createQueue(name);
  }

  async getQueues() {
    return Array.from(this.queues.values());
  }

  async getQueueNames() {
    return Array.from(this.queues.keys());
  }

  async isQueue(name) {
    return this.queues.has(name);
  }

  async getQueueSize(name) {
    try {
      const queue = this.createQueue(name);
      return await queue.count();
    } catch (error) {
      throw Error.Internal('Queue getQueueSize error', { error });
    }
  }

  async getQueueStatus(name) {
    try {
      const queue = this.createQueue(name);
      return {
        isPaused: await queue.isPaused(),
        isRunning: await queue.isRunning(),
        jobCounts: await queue.getJobCounts()
      };
    } catch (error) {
      throw Error.Internal('Queue getQueueStatus error', { error });
    }
  }
}

module.exports = Queue; 