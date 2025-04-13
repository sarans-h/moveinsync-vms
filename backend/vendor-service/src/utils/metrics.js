const prometheus = require('prom-client');
const Error = require('./error');

class Metrics {
  constructor(options = {}) {
    const {
      prefix = '',
      defaultLabels = {},
      collectDefaultMetrics = true,
      collectInterval = 10000
    } = options;

    this.prefix = prefix;
    this.defaultLabels = defaultLabels;
    this.registry = new prometheus.Registry();

    if (collectDefaultMetrics) {
      prometheus.collectDefaultMetrics({
        register: this.registry,
        prefix,
        labels: defaultLabels,
        gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
        defaultLabels: defaultLabels
      });
    }

    this.collectInterval = collectInterval;
    this.metrics = new Map();
  }

  counter(name, help, labelNames = []) {
    const fullName = this.getFullName(name);
    const counter = new prometheus.Counter({
      name: fullName,
      help,
      labelNames: [...new Set([...labelNames, ...Object.keys(this.defaultLabels)])],
      registers: [this.registry]
    });

    this.metrics.set(name, counter);
    return counter;
  }

  gauge(name, help, labelNames = []) {
    const fullName = this.getFullName(name);
    const gauge = new prometheus.Gauge({
      name: fullName,
      help,
      labelNames: [...new Set([...labelNames, ...Object.keys(this.defaultLabels)])],
      registers: [this.registry]
    });

    this.metrics.set(name, gauge);
    return gauge;
  }

  histogram(name, help, labelNames = [], buckets = null) {
    const fullName = this.getFullName(name);
    const histogram = new prometheus.Histogram({
      name: fullName,
      help,
      labelNames: [...new Set([...labelNames, ...Object.keys(this.defaultLabels)])],
      buckets,
      registers: [this.registry]
    });

    this.metrics.set(name, histogram);
    return histogram;
  }

  summary(name, help, labelNames = [], percentiles = null) {
    const fullName = this.getFullName(name);
    const summary = new prometheus.Summary({
      name: fullName,
      help,
      labelNames: [...new Set([...labelNames, ...Object.keys(this.defaultLabels)])],
      percentiles,
      registers: [this.registry]
    });

    this.metrics.set(name, summary);
    return summary;
  }

  increment(name, value = 1, labels = {}) {
    const metric = this.metrics.get(name);
    if (!metric) {
      throw new Error.Base('Metric not found', { name });
    }

    metric.inc({ ...this.defaultLabels, ...labels }, value);
  }

  decrement(name, value = 1, labels = {}) {
    const metric = this.metrics.get(name);
    if (!metric) {
      throw new Error.Base('Metric not found', { name });
    }

    metric.dec({ ...this.defaultLabels, ...labels }, value);
  }

  set(name, value, labels = {}) {
    const metric = this.metrics.get(name);
    if (!metric) {
      throw new Error.Base('Metric not found', { name });
    }

    metric.set({ ...this.defaultLabels, ...labels }, value);
  }

  observe(name, value, labels = {}) {
    const metric = this.metrics.get(name);
    if (!metric) {
      throw new Error.Base('Metric not found', { name });
    }

    metric.observe({ ...this.defaultLabels, ...labels }, value);
  }

  startTimer(name, labels = {}) {
    const metric = this.metrics.get(name);
    if (!metric) {
      throw new Error.Base('Metric not found', { name });
    }

    return metric.startTimer({ ...this.defaultLabels, ...labels });
  }

  async getMetrics() {
    return await this.registry.metrics();
  }

  reset() {
    this.registry.clear();
    this.metrics.clear();
  }

  getFullName(name) {
    return this.prefix ? `${this.prefix}_${name}` : name;
  }

  // HTTP metrics middleware
  httpMetrics() {
    const httpRequestDuration = this.histogram(
      'http_request_duration_seconds',
      'Duration of HTTP requests in seconds',
      ['method', 'route', 'status_code'],
      [0.1, 0.5, 1, 2, 5]
    );

    const httpRequestTotal = this.counter(
      'http_requests_total',
      'Total number of HTTP requests',
      ['method', 'route', 'status_code']
    );

    return (req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;
        const labels = {
          method: req.method,
          route,
          status_code: res.statusCode
        };

        httpRequestDuration.observe(labels, duration);
        httpRequestTotal.inc(labels);
      });
      next();
    };
  }

  // Database metrics
  dbMetrics(pool) {
    const dbConnections = this.gauge(
      'db_connections',
      'Number of database connections',
      ['state']
    );

    const dbQueryDuration = this.histogram(
      'db_query_duration_seconds',
      'Duration of database queries in seconds',
      ['query'],
      [0.1, 0.5, 1, 2, 5]
    );

    const dbQueryTotal = this.counter(
      'db_queries_total',
      'Total number of database queries',
      ['query', 'status']
    );

    setInterval(() => {
      dbConnections.set({ state: 'total' }, pool.totalCount);
      dbConnections.set({ state: 'idle' }, pool.idleCount);
      dbConnections.set({ state: 'waiting' }, pool.waitingCount);
    }, this.collectInterval);

    return {
      query: (query, params) => {
        const start = Date.now();
        return pool.query(query, params)
          .then(result => {
            const duration = (Date.now() - start) / 1000;
            dbQueryDuration.observe({ query }, duration);
            dbQueryTotal.inc({ query, status: 'success' });
            return result;
          })
          .catch(error => {
            dbQueryTotal.inc({ query, status: 'error' });
            throw error;
          });
      }
    };
  }

  // Cache metrics
  cacheMetrics(cache) {
    const cacheHits = this.counter(
      'cache_hits_total',
      'Total number of cache hits'
    );

    const cacheMisses = this.counter(
      'cache_misses_total',
      'Total number of cache misses'
    );

    const cacheSize = this.gauge(
      'cache_size',
      'Current size of cache'
    );

    const cacheOperations = this.counter(
      'cache_operations_total',
      'Total number of cache operations',
      ['operation']
    );

    setInterval(async () => {
      const info = await cache.info();
      cacheSize.set(info.size);
    }, this.collectInterval);

    return {
      get: async (key) => {
        const value = await cache.get(key);
        if (value) {
          cacheHits.inc();
        } else {
          cacheMisses.inc();
        }
        cacheOperations.inc({ operation: 'get' });
        return value;
      },
      set: async (key, value, options) => {
        await cache.set(key, value, options);
        cacheOperations.inc({ operation: 'set' });
      },
      del: async (key) => {
        await cache.del(key);
        cacheOperations.inc({ operation: 'del' });
      }
    };
  }
}

module.exports = Metrics; 