class Function {
  static isFunction(val) {
    return typeof val === 'function';
  }

  static once(fn) {
    let called = false;
    let result;
    return function (...args) {
      if (!called) {
        called = true;
        result = fn.apply(this, args);
      }
      return result;
    };
  }

  static debounce(fn, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  static throttle(fn, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static memoize(fn, resolver) {
    const cache = new Map();
    return function (...args) {
      const key = resolver ? resolver.apply(this, args) : args[0];
      if (!cache.has(key)) {
        cache.set(key, fn.apply(this, args));
      }
      return cache.get(key);
    };
  }

  static compose(...fns) {
    return function (x) {
      return fns.reduceRight((y, f) => f(y), x);
    };
  }

  static pipe(...fns) {
    return function (x) {
      return fns.reduce((y, f) => f(y), x);
    };
  }

  static curry(fn, arity = fn.length) {
    return function curried(...args) {
      if (args.length >= arity) {
        return fn.apply(this, args);
      }
      return function (...moreArgs) {
        return curried.apply(this, args.concat(moreArgs));
      };
    };
  }

  static partial(fn, ...args) {
    return function (...moreArgs) {
      return fn.apply(this, [...args, ...moreArgs]);
    };
  }

  static partialRight(fn, ...args) {
    return function (...moreArgs) {
      return fn.apply(this, [...moreArgs, ...args]);
    };
  }

  static bind(fn, thisArg, ...args) {
    return fn.bind(thisArg, ...args);
  }

  static bindAll(obj, ...methodNames) {
    methodNames.forEach(method => {
      obj[method] = obj[method].bind(obj);
    });
    return obj;
  }

  static delay(fn, wait, ...args) {
    return setTimeout(() => fn.apply(this, args), wait);
  }

  static defer(fn, ...args) {
    return setTimeout(() => fn.apply(this, args), 0);
  }

  static after(n, fn) {
    return function (...args) {
      if (--n < 1) {
        return fn.apply(this, args);
      }
    };
  }

  static before(n, fn) {
    let result;
    return function (...args) {
      if (--n > 0) {
        result = fn.apply(this, args);
      }
      return result;
    };
  }

  static negate(predicate) {
    return function (...args) {
      return !predicate.apply(this, args);
    };
  }

  static ary(fn, n) {
    return function (...args) {
      return fn.apply(this, args.slice(0, n));
    };
  }

  static rearg(fn, indexes) {
    return function (...args) {
      const reordered = indexes.map(index => args[index]);
      return fn.apply(this, reordered);
    };
  }

  static spread(fn) {
    return function (args) {
      return fn.apply(this, args);
    };
  }

  static unary(fn) {
    return function (arg) {
      return fn(arg);
    };
  }

  static binary(fn) {
    return function (arg1, arg2) {
      return fn(arg1, arg2);
    };
  }

  static nAry(n, fn) {
    return function (...args) {
      return fn.apply(this, args.slice(0, n));
    };
  }

  static flip(fn) {
    return function (...args) {
      return fn.apply(this, args.reverse());
    };
  }

  static over(...fns) {
    return function (...args) {
      return fns.map(fn => fn.apply(this, args));
    };
  }

  static overEvery(...predicates) {
    return function (...args) {
      return predicates.every(predicate => predicate.apply(this, args));
    };
  }

  static overSome(...predicates) {
    return function (...args) {
      return predicates.some(predicate => predicate.apply(this, args));
    };
  }

  static overArgs(fn, transforms) {
    return function (...args) {
      const transformed = args.map((arg, index) =>
        transforms[index] ? transforms[index](arg) : arg
      );
      return fn.apply(this, transformed);
    };
  }

  static rest(fn, start = fn.length - 1) {
    return function (...args) {
      const normalArgs = args.slice(0, start);
      const restArgs = args.slice(start);
      return fn.apply(this, [...normalArgs, restArgs]);
    };
  }

  static unapply(fn) {
    return function (...args) {
      return fn(args);
    };
  }
}

module.exports = Function; 