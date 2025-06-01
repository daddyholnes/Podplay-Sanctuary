/**
 * Helper Utilities Tests
 * 
 * Comprehensive tests for general utility functions including
 * debounce, throttle, deep operations, array/object helpers, and more.
 */

import {
  debounce,
  throttle,
  deepClone,
  deepMerge,
  deepEqual,
  isEmpty,
  isObject,
  isArray,
  isPrimitive,
  flattenObject,
  unflattenObject,
  pick,
  omit,
  groupBy,
  chunk,
  unique,
  intersection,
  difference,
  shuffle,
  sortBy,
  findDeep,
  mapDeep,
  filterDeep,
  memoize,
  curry,
  pipe,
  compose,
  retry,
  delay,
  timeout,
  promiseAll,
  promiseRace,
  promiseSequential,
  createEventEmitter,
  createPubSub,
  helpers
} from '../../utils/helpers';

describe('Function Utilities', () => {
  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('delays function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('resets delay on multiple calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      jest.advanceTimersByTime(50);
      debouncedFn();
      jest.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('passes arguments correctly', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    test('maintains context', () => {
      const obj = {
        value: 42,
        getValue: function() { return this.value; }
      };
      const debouncedFn = debounce(obj.getValue.bind(obj), 100);

      const result = debouncedFn();
      jest.advanceTimersByTime(100);
      expect(obj.getValue()).toBe(42);
    });

    test('supports immediate execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100, { immediate: true });

      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1); // Still only called once
    });

    test('can be cancelled', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn.cancel();
      jest.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('limits function execution frequency', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    test('executes immediately on first call', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('executes trailing call after delay', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100, { trailing: true });

      throttledFn();
      throttledFn();
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2); // Trailing call executed
    });

    test('supports leading false option', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100, { leading: false });

      throttledFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Object Utilities', () => {
  describe('deepClone', () => {
    test('clones primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });

    test('clones objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    test('clones arrays', () => {
      const arr = [1, [2, 3], { a: 4 }];
      const cloned = deepClone(arr);
      
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[1]).not.toBe(arr[1]);
      expect(cloned[2]).not.toBe(arr[2]);
    });

    test('handles circular references', () => {
      const obj: any = { a: 1 };
      obj.self = obj;
      
      const cloned = deepClone(obj);
      expect(cloned.a).toBe(1);
      expect(cloned.self).toBe(cloned);
    });

    test('clones dates', () => {
      const date = new Date('2023-06-15');
      const cloned = deepClone(date);
      
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });

    test('clones regular expressions', () => {
      const regex = /test/gi;
      const cloned = deepClone(regex);
      
      expect(cloned).toEqual(regex);
      expect(cloned).not.toBe(regex);
    });
  });

  describe('deepMerge', () => {
    test('merges simple objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const merged = deepMerge(obj1, obj2);
      
      expect(merged).toEqual({ a: 1, b: 3, c: 4 });
    });

    test('merges nested objects', () => {
      const obj1 = { a: { b: 1, c: 2 } };
      const obj2 = { a: { c: 3, d: 4 } };
      const merged = deepMerge(obj1, obj2);
      
      expect(merged).toEqual({ a: { b: 1, c: 3, d: 4 } });
    });

    test('merges arrays by concatenation', () => {
      const obj1 = { arr: [1, 2] };
      const obj2 = { arr: [3, 4] };
      const merged = deepMerge(obj1, obj2);
      
      expect(merged.arr).toEqual([1, 2, 3, 4]);
    });

    test('handles multiple objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const obj3 = { c: 3 };
      const merged = deepMerge(obj1, obj2, obj3);
      
      expect(merged).toEqual({ a: 1, b: 2, c: 3 });
    });

    test('preserves original objects', () => {
      const obj1 = { a: { b: 1 } };
      const obj2 = { a: { c: 2 } };
      const merged = deepMerge(obj1, obj2);
      
      expect(obj1).toEqual({ a: { b: 1 } });
      expect(obj2).toEqual({ a: { c: 2 } });
    });
  });

  describe('deepEqual', () => {
    test('compares primitive values', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('hello', 'hello')).toBe(true);
      expect(deepEqual(true, false)).toBe(false);
      expect(deepEqual(null, undefined)).toBe(false);
    });

    test('compares objects', () => {
      expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    test('compares nested objects', () => {
      const obj1 = { a: { b: { c: 1 } } };
      const obj2 = { a: { b: { c: 1 } } };
      const obj3 = { a: { b: { c: 2 } } };
      
      expect(deepEqual(obj1, obj2)).toBe(true);
      expect(deepEqual(obj1, obj3)).toBe(false);
    });

    test('compares arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
      expect(deepEqual([1, 2], [2, 1])).toBe(false);
    });

    test('handles different types', () => {
      expect(deepEqual([], {})).toBe(false);
      expect(deepEqual('1', 1)).toBe(false);
      expect(deepEqual(null, {})).toBe(false);
    });
  });

  describe('Type Checking Utilities', () => {
    describe('isEmpty', () => {
      test('identifies empty values', () => {
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty('')).toBe(true);
        expect(isEmpty([])).toBe(true);
        expect(isEmpty({})).toBe(true);
      });

      test('identifies non-empty values', () => {
        expect(isEmpty('hello')).toBe(false);
        expect(isEmpty([1])).toBe(false);
        expect(isEmpty({ a: 1 })).toBe(false);
        expect(isEmpty(0)).toBe(false);
        expect(isEmpty(false)).toBe(false);
      });
    });

    describe('isObject', () => {
      test('identifies objects', () => {
        expect(isObject({})).toBe(true);
        expect(isObject({ a: 1 })).toBe(true);
        expect(isObject(new Date())).toBe(true);
      });

      test('rejects non-objects', () => {
        expect(isObject(null)).toBe(false);
        expect(isObject([])).toBe(false);
        expect(isObject('string')).toBe(false);
        expect(isObject(42)).toBe(false);
      });
    });

    describe('isArray', () => {
      test('identifies arrays', () => {
        expect(isArray([])).toBe(true);
        expect(isArray([1, 2, 3])).toBe(true);
        expect(isArray(new Array(5))).toBe(true);
      });

      test('rejects non-arrays', () => {
        expect(isArray({})).toBe(false);
        expect(isArray('string')).toBe(false);
        expect(isArray(null)).toBe(false);
      });
    });

    describe('isPrimitive', () => {
      test('identifies primitive values', () => {
        expect(isPrimitive(42)).toBe(true);
        expect(isPrimitive('string')).toBe(true);
        expect(isPrimitive(true)).toBe(true);
        expect(isPrimitive(null)).toBe(true);
        expect(isPrimitive(undefined)).toBe(true);
        expect(isPrimitive(Symbol('test'))).toBe(true);
      });

      test('rejects complex values', () => {
        expect(isPrimitive({})).toBe(false);
        expect(isPrimitive([])).toBe(false);
        expect(isPrimitive(new Date())).toBe(false);
        expect(isPrimitive(() => {})).toBe(false);
      });
    });
  });

  describe('Object Transformation', () => {
    describe('flattenObject', () => {
      test('flattens nested objects', () => {
        const nested = { a: { b: { c: 1 } }, d: 2 };
        const flattened = flattenObject(nested);
        
        expect(flattened).toEqual({
          'a.b.c': 1,
          'd': 2
        });
      });

      test('handles arrays', () => {
        const obj = { a: [1, 2, { b: 3 }] };
        const flattened = flattenObject(obj);
        
        expect(flattened).toEqual({
          'a.0': 1,
          'a.1': 2,
          'a.2.b': 3
        });
      });

      test('uses custom separator', () => {
        const nested = { a: { b: 1 } };
        const flattened = flattenObject(nested, { separator: '/' });
        
        expect(flattened).toEqual({ 'a/b': 1 });
      });
    });

    describe('unflattenObject', () => {
      test('unflattens objects', () => {
        const flat = { 'a.b.c': 1, 'd': 2 };
        const unflattened = unflattenObject(flat);
        
        expect(unflattened).toEqual({
          a: { b: { c: 1 } },
          d: 2
        });
      });

      test('handles array indices', () => {
        const flat = { 'a.0': 1, 'a.1': 2 };
        const unflattened = unflattenObject(flat);
        
        expect(unflattened).toEqual({ a: [1, 2] });
      });
    });

    describe('pick', () => {
      test('picks specified properties', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const picked = pick(obj, ['a', 'c']);
        
        expect(picked).toEqual({ a: 1, c: 3 });
      });

      test('handles non-existent properties', () => {
        const obj = { a: 1 };
        const picked = pick(obj, ['a', 'b'] as any);
        
        expect(picked).toEqual({ a: 1 });
      });
    });

    describe('omit', () => {
      test('omits specified properties', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const omitted = omit(obj, ['b']);
        
        expect(omitted).toEqual({ a: 1, c: 3 });
      });

      test('handles non-existent properties', () => {
        const obj = { a: 1, b: 2 };
        const omitted = omit(obj, ['c'] as any);
        
        expect(omitted).toEqual({ a: 1, b: 2 });
      });
    });
  });
});

describe('Array Utilities', () => {
  describe('groupBy', () => {
    test('groups by property', () => {
      const items = [
        { category: 'fruit', name: 'apple' },
        { category: 'fruit', name: 'banana' },
        { category: 'vegetable', name: 'carrot' }
      ];
      
      const grouped = groupBy(items, 'category');
      
      expect(grouped.fruit).toHaveLength(2);
      expect(grouped.vegetable).toHaveLength(1);
    });

    test('groups by function', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const grouped = groupBy(numbers, n => n % 2 === 0 ? 'even' : 'odd');
      
      expect(grouped.even).toEqual([2, 4, 6]);
      expect(grouped.odd).toEqual([1, 3, 5]);
    });
  });

  describe('chunk', () => {
    test('chunks array into specified size', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7];
      const chunked = chunk(arr, 3);
      
      expect(chunked).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    test('handles exact divisions', () => {
      const arr = [1, 2, 3, 4];
      const chunked = chunk(arr, 2);
      
      expect(chunked).toEqual([[1, 2], [3, 4]]);
    });

    test('handles empty array', () => {
      expect(chunk([], 3)).toEqual([]);
    });
  });

  describe('unique', () => {
    test('removes duplicates from primitives', () => {
      const arr = [1, 2, 2, 3, 3, 3, 4];
      const uniqueArr = unique(arr);
      
      expect(uniqueArr).toEqual([1, 2, 3, 4]);
    });

    test('removes duplicates by key function', () => {
      const items = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 1, name: 'John Doe' }
      ];
      
      const uniqueItems = unique(items, item => item.id);
      
      expect(uniqueItems).toHaveLength(2);
      expect(uniqueItems[0].id).toBe(1);
      expect(uniqueItems[1].id).toBe(2);
    });
  });

  describe('intersection', () => {
    test('finds common elements', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5, 6];
      const common = intersection(arr1, arr2);
      
      expect(common).toEqual([3, 4]);
    });

    test('handles multiple arrays', () => {
      const common = intersection([1, 2, 3], [2, 3, 4], [3, 4, 5]);
      expect(common).toEqual([3]);
    });
  });

  describe('difference', () => {
    test('finds different elements', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [3, 4, 5, 6];
      const diff = difference(arr1, arr2);
      
      expect(diff).toEqual([1, 2]);
    });
  });

  describe('shuffle', () => {
    test('shuffles array', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      
      expect(shuffled).toHaveLength(5);
      expect(shuffled).toEqual(expect.arrayContaining(arr));
      // Note: This test might occasionally fail due to randomness
    });

    test('does not modify original array', () => {
      const arr = [1, 2, 3];
      const original = [...arr];
      shuffle(arr);
      
      expect(arr).toEqual(original);
    });
  });

  describe('sortBy', () => {
    test('sorts by property', () => {
      const items = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 }
      ];
      
      const sorted = sortBy(items, 'age');
      
      expect(sorted[0].age).toBe(25);
      expect(sorted[1].age).toBe(30);
      expect(sorted[2].age).toBe(35);
    });

    test('sorts by function', () => {
      const items = ['apple', 'Banana', 'cherry'];
      const sorted = sortBy(items, s => s.toLowerCase());
      
      expect(sorted).toEqual(['apple', 'Banana', 'cherry']);
    });

    test('sorts in descending order', () => {
      const numbers = [1, 3, 2];
      const sorted = sortBy(numbers, n => n, { descending: true });
      
      expect(sorted).toEqual([3, 2, 1]);
    });
  });
});

describe('Deep Array/Object Operations', () => {
  describe('findDeep', () => {
    test('finds nested values', () => {
      const data = {
        users: [
          { id: 1, name: 'John', profile: { age: 30 } },
          { id: 2, name: 'Jane', profile: { age: 25 } }
        ]
      };
      
      const result = findDeep(data, (value, key) => key === 'age' && value > 28);
      expect(result).toBe(30);
    });

    test('returns undefined when not found', () => {
      const data = { a: 1, b: 2 };
      const result = findDeep(data, (value) => value === 3);
      expect(result).toBeUndefined();
    });
  });

  describe('mapDeep', () => {
    test('transforms nested values', () => {
      const data = { a: 1, b: { c: 2, d: 3 } };
      const mapped = mapDeep(data, (value) => 
        typeof value === 'number' ? value * 2 : value
      );
      
      expect(mapped).toEqual({ a: 2, b: { c: 4, d: 6 } });
    });
  });

  describe('filterDeep', () => {
    test('filters nested values', () => {
      const data = {
        a: 1,
        b: {
          c: 2,
          d: 3,
          e: { f: 4 }
        }
      };
      
      const filtered = filterDeep(data, (value) => 
        typeof value !== 'number' || value % 2 === 0
      );
      
      expect(filtered.a).toBeUndefined();
      expect(filtered.b.c).toBe(2);
      expect(filtered.b.d).toBeUndefined();
      expect(filtered.b.e.f).toBe(4);
    });
  });
});

describe('Functional Programming Utilities', () => {
  describe('memoize', () => {
    test('caches function results', () => {
      const expensiveFn = jest.fn((n: number) => n * n);
      const memoized = memoize(expensiveFn);
      
      expect(memoized(5)).toBe(25);
      expect(memoized(5)).toBe(25);
      expect(expensiveFn).toHaveBeenCalledTimes(1);
    });

    test('handles multiple arguments', () => {
      const fn = jest.fn((a: number, b: number) => a + b);
      const memoized = memoize(fn);
      
      expect(memoized(1, 2)).toBe(3);
      expect(memoized(1, 2)).toBe(3);
      expect(memoized(2, 3)).toBe(5);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('supports custom key function', () => {
      const fn = jest.fn((obj: { id: number; name: string }) => obj.name.toUpperCase());
      const memoized = memoize(fn, (obj) => obj.id.toString());
      
      expect(memoized({ id: 1, name: 'john' })).toBe('JOHN');
      expect(memoized({ id: 1, name: 'jane' })).toBe('JOHN'); // Uses cached result
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('curry', () => {
    test('curries functions', () => {
      const add = (a: number, b: number, c: number) => a + b + c;
      const curried = curry(add);
      
      expect(curried(1)(2)(3)).toBe(6);
      expect(curried(1, 2)(3)).toBe(6);
      expect(curried(1)(2, 3)).toBe(6);
    });

    test('returns partial functions', () => {
      const multiply = (a: number, b: number) => a * b;
      const curried = curry(multiply);
      const double = curried(2);
      
      expect(double(5)).toBe(10);
      expect(double(10)).toBe(20);
    });
  });

  describe('pipe', () => {
    test('pipes functions left to right', () => {
      const add1 = (n: number) => n + 1;
      const multiply2 = (n: number) => n * 2;
      const subtract3 = (n: number) => n - 3;
      
      const piped = pipe(add1, multiply2, subtract3);
      
      expect(piped(5)).toBe(9); // ((5 + 1) * 2) - 3
    });

    test('handles single function', () => {
      const double = (n: number) => n * 2;
      const piped = pipe(double);
      
      expect(piped(5)).toBe(10);
    });
  });

  describe('compose', () => {
    test('composes functions right to left', () => {
      const add1 = (n: number) => n + 1;
      const multiply2 = (n: number) => n * 2;
      const subtract3 = (n: number) => n - 3;
      
      const composed = compose(subtract3, multiply2, add1);
      
      expect(composed(5)).toBe(9); // ((5 + 1) * 2) - 3
    });
  });
});

describe('Async Utilities', () => {
  describe('delay', () => {
    test('delays execution', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90);
    });

    test('resolves with value', async () => {
      const result = await delay(10, 'hello');
      expect(result).toBe('hello');
    });
  });

  describe('timeout', () => {
    test('resolves if promise completes in time', async () => {
      const promise = delay(50, 'success');
      const result = await timeout(promise, 100);
      
      expect(result).toBe('success');
    });

    test('rejects if promise takes too long', async () => {
      const promise = delay(200, 'success');
      
      await expect(timeout(promise, 100)).rejects.toThrow('Operation timed out');
    });
  });

  describe('retry', () => {
    test('retries failed operations', async () => {
      let attempts = 0;
      const failingFn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      };
      
      const result = await retry(failingFn, { maxAttempts: 5 });
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    test('throws after max attempts', async () => {
      const alwaysFailsFn = async () => {
        throw new Error('Always fails');
      };
      
      await expect(retry(alwaysFailsFn, { maxAttempts: 3 })).rejects.toThrow('Always fails');
    });

    test('uses exponential backoff', async () => {
      let attempts = 0;
      const failingFn = async () => {
        attempts++;
        throw new Error('Always fails');
      };
      
      const start = Date.now();
      try {
        await retry(failingFn, { maxAttempts: 3, delay: 50, exponentialBackoff: true });
      } catch (error) {
        // Expected to fail
      }
      const end = Date.now();
      
      // Should have delays of 50ms, 100ms = 150ms total minimum
      expect(end - start).toBeGreaterThanOrEqual(140);
    });
  });

  describe('promiseAll', () => {
    test('resolves all promises', async () => {
      const promises = [
        delay(50, 'first'),
        delay(30, 'second'),
        delay(70, 'third')
      ];
      
      const results = await promiseAll(promises);
      expect(results).toEqual(['first', 'second', 'third']);
    });

    test('rejects if any promise fails', async () => {
      const promises = [
        delay(50, 'success'),
        Promise.reject(new Error('failure')),
        delay(30, 'also success')
      ];
      
      await expect(promiseAll(promises)).rejects.toThrow('failure');
    });
  });

  describe('promiseSequential', () => {
    test('executes promises sequentially', async () => {
      const order: number[] = [];
      const promises = [
        () => delay(50).then(() => order.push(1)),
        () => delay(30).then(() => order.push(2)),
        () => delay(70).then(() => order.push(3))
      ];
      
      await promiseSequential(promises);
      expect(order).toEqual([1, 2, 3]);
    });

    test('stops on first error', async () => {
      const order: number[] = [];
      const promises = [
        () => delay(10).then(() => order.push(1)),
        () => Promise.reject(new Error('failure')),
        () => delay(10).then(() => order.push(3))
      ];
      
      await expect(promiseSequential(promises)).rejects.toThrow('failure');
      expect(order).toEqual([1]); // Third promise should not execute
    });
  });
});

describe('Event Utilities', () => {
  describe('createEventEmitter', () => {
    test('emits and listens to events', () => {
      const emitter = createEventEmitter();
      const listener = jest.fn();
      
      emitter.on('test', listener);
      emitter.emit('test', 'data');
      
      expect(listener).toHaveBeenCalledWith('data');
    });

    test('supports multiple listeners', () => {
      const emitter = createEventEmitter();
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.emit('test', 'data');
      
      expect(listener1).toHaveBeenCalledWith('data');
      expect(listener2).toHaveBeenCalledWith('data');
    });

    test('removes listeners', () => {
      const emitter = createEventEmitter();
      const listener = jest.fn();
      
      emitter.on('test', listener);
      emitter.off('test', listener);
      emitter.emit('test', 'data');
      
      expect(listener).not.toHaveBeenCalled();
    });

    test('supports once listeners', () => {
      const emitter = createEventEmitter();
      const listener = jest.fn();
      
      emitter.once('test', listener);
      emitter.emit('test', 'first');
      emitter.emit('test', 'second');
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('first');
    });
  });

  describe('createPubSub', () => {
    test('publishes and subscribes to topics', () => {
      const pubsub = createPubSub();
      const subscriber = jest.fn();
      
      pubsub.subscribe('topic', subscriber);
      pubsub.publish('topic', 'message');
      
      expect(subscriber).toHaveBeenCalledWith('message');
    });

    test('supports pattern matching', () => {
      const pubsub = createPubSub();
      const subscriber = jest.fn();
      
      pubsub.subscribe('user.*', subscriber);
      pubsub.publish('user.created', { id: 1 });
      pubsub.publish('user.updated', { id: 2 });
      
      expect(subscriber).toHaveBeenCalledTimes(2);
    });

    test('unsubscribes correctly', () => {
      const pubsub = createPubSub();
      const subscriber = jest.fn();
      
      const unsubscribe = pubsub.subscribe('topic', subscriber);
      unsubscribe();
      pubsub.publish('topic', 'message');
      
      expect(subscriber).not.toHaveBeenCalled();
    });
  });
});

describe('Helpers Default Export', () => {
  test('exports all helper functions', () => {
    expect(typeof helpers.debounce).toBe('function');
    expect(typeof helpers.throttle).toBe('function');
    expect(typeof helpers.deepClone).toBe('function');
    expect(typeof helpers.memoize).toBe('function');
  });

  test('provides consistent API', () => {
    const fn = () => 42;
    const debouncedHelper = helpers.debounce(fn, 100);
    const debouncedDirect = debounce(fn, 100);
    
    expect(typeof debouncedHelper).toBe(typeof debouncedDirect);
  });
});

describe('Edge Cases and Error Handling', () => {
  test('handles null and undefined inputs', () => {
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  test('handles empty collections', () => {
    expect(chunk([], 3)).toEqual([]);
    expect(unique([])).toEqual([]);
    expect(groupBy([], 'key')).toEqual({});
  });

  test('handles invalid function arguments', () => {
    expect(() => debounce(null as any, 100)).toThrow();
    expect(() => throttle(undefined as any, 100)).toThrow();
    expect(() => memoize('not a function' as any)).toThrow();
  });

  test('handles large datasets efficiently', () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => i);
    
    const start = Date.now();
    const chunked = chunk(largeArray, 100);
    const uniqueValues = unique(largeArray);
    const end = Date.now();
    
    expect(chunked).toHaveLength(100);
    expect(uniqueValues).toHaveLength(10000);
    expect(end - start).toBeLessThan(100); // Should be fast
  });
});
