class Array {
  static isEmpty(arr) {
    return arr.length === 0;
  }

  static isArray(arr) {
    return Array.isArray(arr);
  }

  static first(arr) {
    return arr[0];
  }

  static last(arr) {
    return arr[arr.length - 1];
  }

  static head(arr) {
    return arr.slice(0, -1);
  }

  static tail(arr) {
    return arr.slice(1);
  }

  static initial(arr) {
    return arr.slice(0, -1);
  }

  static rest(arr) {
    return arr.slice(1);
  }

  static compact(arr) {
    return arr.filter(Boolean);
  }

  static unique(arr) {
    return [...new Set(arr)];
  }

  static flatten(arr, depth = 1) {
    return arr.flat(depth);
  }

  static flattenDeep(arr) {
    return arr.flat(Infinity);
  }

  static chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  static groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const val = typeof key === 'function' ? key(item) : item[key];
      groups[val] = groups[val] || [];
      groups[val].push(item);
      return groups;
    }, {});
  }

  static countBy(arr, key) {
    return arr.reduce((counts, item) => {
      const val = typeof key === 'function' ? key(item) : item[key];
      counts[val] = (counts[val] || 0) + 1;
      return counts;
    }, {});
  }

  static sortBy(arr, key) {
    return [...arr].sort((a, b) => {
      const valA = typeof key === 'function' ? key(a) : a[key];
      const valB = typeof key === 'function' ? key(b) : b[key];
      return valA > valB ? 1 : -1;
    });
  }

  static sortByDesc(arr, key) {
    return [...arr].sort((a, b) => {
      const valA = typeof key === 'function' ? key(a) : a[key];
      const valB = typeof key === 'function' ? key(b) : b[key];
      return valA < valB ? 1 : -1;
    });
  }

  static shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  static sample(arr, size = 1) {
    const shuffled = this.shuffle(arr);
    return size === 1 ? shuffled[0] : shuffled.slice(0, size);
  }

  static range(start, end, step = 1) {
    const range = [];
    for (let i = start; i <= end; i += step) {
      range.push(i);
    }
    return range;
  }

  static zip(...arrays) {
    const maxLength = Math.max(...arrays.map(arr => arr.length));
    return Array.from({ length: maxLength }, (_, i) =>
      arrays.map(arr => arr[i])
    );
  }

  static unzip(arrays) {
    return arrays[0].map((_, i) => arrays.map(arr => arr[i]));
  }

  static intersection(...arrays) {
    return arrays.reduce((a, b) => a.filter(c => b.includes(c)));
  }

  static union(...arrays) {
    return [...new Set(arrays.flat())];
  }

  static difference(arr1, arr2) {
    return arr1.filter(x => !arr2.includes(x));
  }

  static symmetricDifference(arr1, arr2) {
    return arr1
      .filter(x => !arr2.includes(x))
      .concat(arr2.filter(x => !arr1.includes(x)));
  }

  static partition(arr, predicate) {
    return arr.reduce(
      (result, item) => {
        result[predicate(item) ? 0 : 1].push(item);
        return result;
      },
      [[], []]
    );
  }

  static count(arr, predicate) {
    return arr.filter(predicate).length;
  }

  static sum(arr, key) {
    return arr.reduce((sum, item) => {
      const val = typeof key === 'function' ? key(item) : item[key];
      return sum + (val || 0);
    }, 0);
  }

  static average(arr, key) {
    return this.sum(arr, key) / arr.length;
  }

  static min(arr, key) {
    return Math.min(...arr.map(item => (typeof key === 'function' ? key(item) : item[key])));
  }

  static max(arr, key) {
    return Math.max(...arr.map(item => (typeof key === 'function' ? key(item) : item[key])));
  }

  static pluck(arr, key) {
    return arr.map(item => item[key]);
  }

  static where(arr, properties) {
    return arr.filter(item =>
      Object.entries(properties).every(([key, value]) => item[key] === value)
    );
  }

  static orderBy(arr, key, order = 'asc') {
    return [...arr].sort((a, b) => {
      const valA = typeof key === 'function' ? key(a) : a[key];
      const valB = typeof key === 'function' ? key(b) : b[key];
      return order === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }

  static groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const val = typeof key === 'function' ? key(item) : item[key];
      groups[val] = groups[val] || [];
      groups[val].push(item);
      return groups;
    }, {});
  }

  static countBy(arr, key) {
    return arr.reduce((counts, item) => {
      const val = typeof key === 'function' ? key(item) : item[key];
      counts[val] = (counts[val] || 0) + 1;
      return counts;
    }, {});
  }

  static sortBy(arr, key) {
    return [...arr].sort((a, b) => {
      const valA = typeof key === 'function' ? key(a) : a[key];
      const valB = typeof key === 'function' ? key(b) : b[key];
      return valA > valB ? 1 : -1;
    });
  }

  static sortByDesc(arr, key) {
    return [...arr].sort((a, b) => {
      const valA = typeof key === 'function' ? key(a) : a[key];
      const valB = typeof key === 'function' ? key(b) : b[key];
      return valA < valB ? 1 : -1;
    });
  }
}

module.exports = Array; 