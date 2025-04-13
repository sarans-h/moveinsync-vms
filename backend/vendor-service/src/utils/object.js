class Object {
  static isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  static isObject(val) {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
  }

  static keys(obj) {
    return Object.keys(obj);
  }

  static values(obj) {
    return Object.values(obj);
  }

  static entries(obj) {
    return Object.entries(obj);
  }

  static fromEntries(entries) {
    return Object.fromEntries(entries);
  }

  static assign(target, ...sources) {
    return Object.assign(target, ...sources);
  }

  static create(proto, properties) {
    return Object.create(proto, properties);
  }

  static freeze(obj) {
    return Object.freeze(obj);
  }

  static seal(obj) {
    return Object.seal(obj);
  }

  static preventExtensions(obj) {
    return Object.preventExtensions(obj);
  }

  static isFrozen(obj) {
    return Object.isFrozen(obj);
  }

  static isSealed(obj) {
    return Object.isSealed(obj);
  }

  static isExtensible(obj) {
    return Object.isExtensible(obj);
  }

  static getOwnPropertyDescriptor(obj, prop) {
    return Object.getOwnPropertyDescriptor(obj, prop);
  }

  static getOwnPropertyDescriptors(obj) {
    return Object.getOwnPropertyDescriptors(obj);
  }

  static getOwnPropertyNames(obj) {
    return Object.getOwnPropertyNames(obj);
  }

  static getOwnPropertySymbols(obj) {
    return Object.getOwnPropertySymbols(obj);
  }

  static getPrototypeOf(obj) {
    return Object.getPrototypeOf(obj);
  }

  static setPrototypeOf(obj, proto) {
    return Object.setPrototypeOf(obj, proto);
  }

  static hasOwn(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  static pick(obj, paths) {
    const result = {};
    paths.forEach(path => {
      if (this.hasOwn(obj, path)) {
        result[path] = obj[path];
      }
    });
    return result;
  }

  static omit(obj, paths) {
    const result = { ...obj };
    paths.forEach(path => {
      delete result[path];
    });
    return result;
  }

  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static merge(target, ...sources) {
    return sources.reduce((target, source) => {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key]) && this.isObject(target[key])) {
          target[key] = this.merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      });
      return target;
    }, target);
  }

  static flatten(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
      const pre = prefix.length ? `${prefix}.` : '';
      if (this.isObject(obj[key])) {
        Object.assign(acc, this.flatten(obj[key], pre + key));
      } else {
        acc[pre + key] = obj[key];
      }
      return acc;
    }, {});
  }

  static unflatten(obj) {
    const result = {};
    for (const key in obj) {
      const keys = key.split('.');
      let current = result;
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (i === keys.length - 1) {
          current[k] = obj[key];
        } else {
          current[k] = current[k] || {};
          current = current[k];
        }
      }
    }
    return result;
  }

  static transform(obj, iteratee) {
    return Object.keys(obj).reduce((result, key) => {
      const value = iteratee(obj[key], key, obj);
      if (value !== undefined) {
        result[key] = value;
      }
      return result;
    }, {});
  }

  static mapKeys(obj, iteratee) {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = iteratee(key, obj[key], obj);
      result[newKey] = obj[key];
      return result;
    }, {});
  }

  static mapValues(obj, iteratee) {
    return Object.keys(obj).reduce((result, key) => {
      result[key] = iteratee(obj[key], key, obj);
      return result;
    }, {});
  }

  static invert(obj) {
    return Object.keys(obj).reduce((result, key) => {
      result[obj[key]] = key;
      return result;
    }, {});
  }

  static forEach(obj, iteratee) {
    Object.keys(obj).forEach(key => {
      iteratee(obj[key], key, obj);
    });
    return obj;
  }

  static findKey(obj, predicate) {
    return Object.keys(obj).find(key => predicate(obj[key], key, obj));
  }

  static findValue(obj, predicate) {
    const key = this.findKey(obj, predicate);
    return key ? obj[key] : undefined;
  }

  static filter(obj, predicate) {
    return Object.keys(obj).reduce((result, key) => {
      if (predicate(obj[key], key, obj)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  }

  static map(obj, iteratee) {
    return Object.keys(obj).map(key => iteratee(obj[key], key, obj));
  }

  static reduce(obj, iteratee, accumulator) {
    return Object.keys(obj).reduce((result, key) => {
      return iteratee(result, obj[key], key, obj);
    }, accumulator);
  }

  static some(obj, predicate) {
    return Object.keys(obj).some(key => predicate(obj[key], key, obj));
  }

  static every(obj, predicate) {
    return Object.keys(obj).every(key => predicate(obj[key], key, obj));
  }
}

module.exports = Object; 