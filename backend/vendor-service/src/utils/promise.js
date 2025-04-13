class Promise {
  static resolve(value) {
    return Promise.resolve(value);
  }

  static reject(error) {
    return Promise.reject(error);
  }

  static all(promises) {
    return Promise.all(promises);
  }

  static allSettled(promises) {
    return Promise.allSettled(promises);
  }

  static race(promises) {
    return Promise.race(promises);
  }

  static any(promises) {
    return Promise.any(promises);
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static timeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Promise timeout')), ms)
      )
    ]);
  }

  static retry(fn, retries = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
      const attempt = async (n) => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          if (n === retries) {
            reject(error);
          } else {
            setTimeout(() => attempt(n + 1), delay);
          }
        }
      };
      attempt(1);
    });
  }

  static map(array, fn, concurrency = Infinity) {
    const results = [];
    const executing = new Set();
    let index = 0;

    return new Promise((resolve, reject) => {
      function enqueue() {
        const i = index++;
        const p = Promise.resolve().then(async () => {
          try {
            results[i] = await fn(array[i], i);
          } catch (error) {
            reject(error);
          }
          executing.delete(p);
          if (index === array.length) {
            resolve(results);
          } else if (executing.size < concurrency) {
            enqueue();
          }
        });
        executing.add(p);
      }

      for (let i = 0; i < Math.min(concurrency, array.length); i++) {
        enqueue();
      }
    });
  }

  static reduce(array, fn, initial) {
    return array.reduce(
      (promise, value, index) =>
        promise.then(result => fn(result, value, index)),
      Promise.resolve(initial)
    );
  }

  static each(array, fn) {
    return array.reduce(
      (promise, value, index) =>
        promise.then(() => fn(value, index)),
      Promise.resolve()
    );
  }

  static props(obj) {
    const keys = Object.keys(obj);
    const promises = keys.map(key => obj[key]);
    return Promise.all(promises).then(values =>
      keys.reduce((result, key, index) => {
        result[key] = values[index];
        return result;
      }, {})
    );
  }

  static try(fn) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  static fromCallback(fn) {
    return new Promise((resolve, reject) => {
      fn((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }

  static toCallback(promise, callback) {
    promise
      .then(result => callback(null, result))
      .catch(error => callback(error));
  }

  static promisify(fn) {
    return function (...args) {
      return new Promise((resolve, reject) => {
        fn(...args, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    };
  }

  static promisifyAll(obj) {
    const result = {};
    for (const key in obj) {
      if (typeof obj[key] === 'function') {
        result[key] = this.promisify(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
    return result;
  }

  static defer() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  static finally(promise, fn) {
    return promise.finally(fn);
  }

  static tap(promise, fn) {
    return promise.then(async value => {
      await fn(value);
      return value;
    });
  }

  static spread(promise) {
    return promise.then(array => Promise.all(array));
  }

  static reflect(promise) {
    return promise
      .then(value => ({ status: 'fulfilled', value }))
      .catch(error => ({ status: 'rejected', error }));
  }

  static some(promises, count) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let remaining = promises.length;

      promises.forEach((promise, index) => {
        Promise.resolve(promise)
          .then(value => {
            results[index] = value;
            if (results.filter(Boolean).length === count) {
              resolve(results.filter(Boolean));
            }
          })
          .catch(error => {
            errors[index] = error;
          })
          .finally(() => {
            remaining--;
            if (remaining === 0) {
              reject(new Error('Not enough promises resolved'));
            }
          });
      });
    });
  }

  static mapSeries(array, fn) {
    return array.reduce(
      (promise, value, index) =>
        promise.then(results => {
          return fn(value, index).then(result => [...results, result]);
        }),
      Promise.resolve([])
    );
  }

  static waterfall(fns) {
    return fns.reduce(
      (promise, fn) =>
        promise.then(result => fn(result)),
      Promise.resolve()
    );
  }
}

module.exports = Promise; 