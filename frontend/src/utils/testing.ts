/**
 * Testing Utilities
 * 
 * Provides comprehensive testing utilities, mock factories,
 * test helpers, and assertion utilities for unit and integration testing.
 */

import { ReactElement } from 'react';

/**
 * Testing configuration
 */
export const TESTING_CONFIG = {
  // Test timeouts
  timeouts: {
    unit: 5000,
    integration: 10000,
    e2e: 30000,
  },
  
  // Mock configurations
  mocks: {
    apiDelay: 100,
    socketDelay: 50,
    networkFailureRate: 0.1,
  },
  
  // Test data generation
  data: {
    stringLength: 10,
    arrayLength: 5,
    objectDepth: 3,
  },
  
  // Performance thresholds
  performance: {
    renderTime: 16, // 60fps
    apiResponseTime: 500,
    bundleSize: 250000, // 250KB
  },
} as const;

/**
 * Mock data generators
 */
export const mockGenerators = {
  /**
   * Generate random string
   */
  string(length: number = TESTING_CONFIG.data.stringLength): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  },

  /**
   * Generate random number
   */
  number(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Generate random boolean
   */
  boolean(): boolean {
    return Math.random() < 0.5;
  },

  /**
   * Generate random email
   */
  email(): string {
    const username = this.string(8);
    const domain = this.string(6);
    return `${username}@${domain}.com`;
  },

  /**
   * Generate random URL
   */
  url(): string {
    const protocol = this.boolean() ? 'https' : 'http';
    const domain = this.string(8);
    const path = this.string(6);
    return `${protocol}://${domain}.com/${path}`;
  },

  /**
   * Generate random date
   */
  date(start?: Date, end?: Date): Date {
    const startTime = start?.getTime() || Date.now() - 365 * 24 * 60 * 60 * 1000; // 1 year ago
    const endTime = end?.getTime() || Date.now();
    return new Date(startTime + Math.random() * (endTime - startTime));
  },

  /**
   * Generate random array
   */
  array<T>(generator: () => T, length: number = TESTING_CONFIG.data.arrayLength): T[] {
    return Array.from({ length }, generator);
  },

  /**
   * Generate random object
   */
  object(depth: number = TESTING_CONFIG.data.objectDepth): Record<string, any> {
    if (depth <= 0) return {};

    const obj: Record<string, any> = {};
    const numProps = this.number(1, 5);

    for (let i = 0; i < numProps; i++) {
      const key = this.string(6);
      const valueType = Math.floor(Math.random() * 6);

      switch (valueType) {
        case 0:
          obj[key] = this.string();
          break;
        case 1:
          obj[key] = this.number();
          break;
        case 2:
          obj[key] = this.boolean();
          break;
        case 3:
          obj[key] = this.date();
          break;
        case 4:
          obj[key] = this.array(() => this.string(), 3);
          break;
        case 5:
          obj[key] = this.object(depth - 1);
          break;
      }
    }

    return obj;
  },

  /**
   * Generate mock user
   */
  user(): {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
  } {
    return {
      id: this.string(12),
      name: `${this.string(6)} ${this.string(8)}`,
      email: this.email(),
      avatar: this.url(),
      role: ['admin', 'user', 'moderator'][this.number(0, 2)],
      isActive: this.boolean(),
      createdAt: this.date(),
    };
  },

  /**
   * Generate mock API response
   */
  apiResponse<T>(data: T, success: boolean = true): {
    success: boolean;
    data: T;
    message: string;
    timestamp: Date;
    meta?: any;
  } {
    return {
      success,
      data,
      message: success ? 'Operation successful' : 'Operation failed',
      timestamp: new Date(),
      meta: success ? undefined : { error: this.string() },
    };
  },

  /**
   * Generate mock error
   */
  error(): Error {
    const messages = [
      'Network error',
      'Validation failed',
      'Access denied',
      'Resource not found',
      'Internal server error',
    ];
    return new Error(messages[this.number(0, messages.length - 1)]);
  },
};

/**
 * Mock factories for common objects
 */
export const mockFactories = {
  /**
   * Create mock fetch function
   */
  fetch(
    responses: Record<string, any> = {},
    delay: number = TESTING_CONFIG.mocks.apiDelay
  ): jest.MockedFunction<typeof fetch> {
    return jest.fn().mockImplementation((url: string, options?: RequestInit) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const response = responses[url] || mockGenerators.apiResponse({});
          resolve({
            ok: response.success,
            status: response.success ? 200 : 400,
            json: () => Promise.resolve(response),
            text: () => Promise.resolve(JSON.stringify(response)),
          } as Response);
        }, delay);
      });
    });
  },

  /**
   * Create mock WebSocket
   */
  webSocket(): {
    mockSocket: any;
    mockOpen: jest.Mock;
    mockClose: jest.Mock;
    mockSend: jest.Mock;
    mockMessage: jest.Mock;
    mockError: jest.Mock;
  } {
    const mockOpen = jest.fn();
    const mockClose = jest.fn();
    const mockSend = jest.fn();
    const mockMessage = jest.fn();
    const mockError = jest.fn();

    const mockSocket = {
      readyState: WebSocket.OPEN,
      send: mockSend,
      close: mockClose,
      addEventListener: jest.fn((event, callback) => {
        switch (event) {
          case 'open':
            mockOpen.mockImplementation(callback);
            break;
          case 'close':
            mockClose.mockImplementation(callback);
            break;
          case 'message':
            mockMessage.mockImplementation(callback);
            break;
          case 'error':
            mockError.mockImplementation(callback);
            break;
        }
      }),
      removeEventListener: jest.fn(),
    };

    return {
      mockSocket,
      mockOpen,
      mockClose,
      mockSend,
      mockMessage,
      mockError,
    };
  },

  /**
   * Create mock localStorage
   */
  localStorage(): {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
    clear: jest.Mock;
  } {
    const storage: Record<string, string> = {};

    return {
      getItem: jest.fn((key: string) => storage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete storage[key];
      }),
      clear: jest.fn(() => {
        Object.keys(storage).forEach(key => delete storage[key]);
      }),
    };
  },

  /**
   * Create mock IntersectionObserver
   */
  intersectionObserver(): {
    mockObserver: any;
    mockObserve: jest.Mock;
    mockUnobserve: jest.Mock;
    mockDisconnect: jest.Mock;
    triggerIntersection: (entries: any[]) => void;
  } {
    const mockObserve = jest.fn();
    const mockUnobserve = jest.fn();
    const mockDisconnect = jest.fn();
    let callback: ((entries: any[]) => void) | null = null;

    const mockObserver = jest.fn().mockImplementation((cb) => {
      callback = cb;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });

    const triggerIntersection = (entries: any[]) => {
      if (callback) callback(entries);
    };

    return {
      mockObserver,
      mockObserve,
      mockUnobserve,
      mockDisconnect,
      triggerIntersection,
    };
  },

  /**
   * Create mock ResizeObserver
   */
  resizeObserver(): {
    mockObserver: any;
    mockObserve: jest.Mock;
    mockUnobserve: jest.Mock;
    mockDisconnect: jest.Mock;
    triggerResize: (entries: any[]) => void;
  } {
    const mockObserve = jest.fn();
    const mockUnobserve = jest.Mock;
    const mockDisconnect = jest.fn();
    let callback: ((entries: any[]) => void) | null = null;

    const mockObserver = jest.fn().mockImplementation((cb) => {
      callback = cb;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });

    const triggerResize = (entries: any[]) => {
      if (callback) callback(entries);
    };

    return {
      mockObserver,
      mockObserve,
      mockUnobserve,
      mockDisconnect,
      triggerResize,
    };
  },
};

/**
 * Test utilities
 */
export const testUtils = {
  /**
   * Wait for a condition to be true
   */
  async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = TESTING_CONFIG.timeouts.unit,
    interval: number = 50
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await condition();
        if (result) return;
      } catch (error) {
        // Continue waiting
      }
      
      await this.delay(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  },

  /**
   * Create a delay
   */
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Flush all promises
   */
  async flushPromises(): Promise<void> {
    await new Promise(resolve => setImmediate(resolve));
  },

  /**
   * Create a spy function with call tracking
   */
  createSpy<T extends (...args: any[]) => any>(
    implementation?: T
  ): jest.MockedFunction<T> & {
    getCallHistory: () => Array<{ args: Parameters<T>; result: ReturnType<T>; timestamp: number }>;
  } {
    const callHistory: Array<{ args: Parameters<T>; result: ReturnType<T>; timestamp: number }> = [];
    
    const spy = jest.fn().mockImplementation((...args: Parameters<T>) => {
      const timestamp = Date.now();
      let result: ReturnType<T>;
      
      if (implementation) {
        result = implementation(...args);
      }
      
      callHistory.push({ args, result, timestamp });
      return result;
    }) as jest.MockedFunction<T> & {
      getCallHistory: () => Array<{ args: Parameters<T>; result: ReturnType<T>; timestamp: number }>;
    };

    spy.getCallHistory = () => [...callHistory];
    
    return spy;
  },

  /**
   * Mock console methods
   */
  mockConsole(): {
    log: jest.Mock;
    error: jest.Mock;
    warn: jest.Mock;
    info: jest.Mock;
    restore: () => void;
  } {
    const originalConsole = { ...console };
    
    const log = jest.fn();
    const error = jest.fn();
    const warn = jest.fn();
    const info = jest.fn();
    
    console.log = log;
    console.error = error;
    console.warn = warn;
    console.info = info;
    
    return {
      log,
      error,
      warn,
      info,
      restore: () => {
        Object.assign(console, originalConsole);
      },
    };
  },

  /**
   * Create a mock timer
   */
  createMockTimer(): {
    start: () => void;
    stop: () => void;
    tick: (ms: number) => void;
    getTime: () => number;
    restore: () => void;
  } {
    let currentTime = 0;
    let isRunning = false;
    const originalSetTimeout = global.setTimeout;
    const originalClearTimeout = global.clearTimeout;
    const originalSetInterval = global.setInterval;
    const originalClearInterval = global.clearInterval;
    const originalDate = global.Date;

    const timers: Map<number, { callback: () => void; time: number; interval?: boolean }> = new Map();
    let timerId = 1;

    const start = () => {
      isRunning = true;
      
      global.setTimeout = jest.fn((callback, delay = 0) => {
        const id = timerId++;
        timers.set(id, { callback, time: currentTime + delay });
        return id;
      }) as any;

      global.clearTimeout = jest.fn((id) => {
        timers.delete(id);
      }) as any;

      global.setInterval = jest.fn((callback, delay = 0) => {
        const id = timerId++;
        timers.set(id, { callback, time: currentTime + delay, interval: true });
        return id;
      }) as any;

      global.clearInterval = jest.fn((id) => {
        timers.delete(id);
      }) as any;

      // Mock Date.now()
      global.Date.now = jest.fn(() => currentTime);
    };

    const stop = () => {
      isRunning = false;
    };

    const tick = (ms: number) => {
      if (!isRunning) return;
      
      currentTime += ms;
      
      const expiredTimers = Array.from(timers.entries())
        .filter(([, timer]) => timer.time <= currentTime);
      
      expiredTimers.forEach(([id, timer]) => {
        timer.callback();
        
        if (timer.interval) {
          // Reschedule interval
          timer.time = currentTime + (timer.time - (currentTime - ms));
        } else {
          timers.delete(id);
        }
      });
    };

    const getTime = () => currentTime;

    const restore = () => {
      global.setTimeout = originalSetTimeout;
      global.clearTimeout = originalClearTimeout;
      global.setInterval = originalSetInterval;
      global.clearInterval = originalClearInterval;
      global.Date = originalDate;
      timers.clear();
    };

    return { start, stop, tick, getTime, restore };
  },
};

/**
 * Custom assertions
 */
export const assertions = {
  /**
   * Assert that value is defined
   */
  toBeDefined<T>(value: T | undefined | null): asserts value is T {
    if (value === undefined || value === null) {
      throw new Error(`Expected value to be defined, but got ${value}`);
    }
  },

  /**
   * Assert that promise rejects
   */
  async toReject(promise: Promise<any>, expectedError?: string | RegExp): Promise<void> {
    let didReject = false;
    let error: any;

    try {
      await promise;
    } catch (e) {
      didReject = true;
      error = e;
    }

    if (!didReject) {
      throw new Error('Expected promise to reject, but it resolved');
    }

    if (expectedError) {
      const errorMessage = error?.message || String(error);
      const matches = typeof expectedError === 'string'
        ? errorMessage.includes(expectedError)
        : expectedError.test(errorMessage);

      if (!matches) {
        throw new Error(`Expected error to match ${expectedError}, but got: ${errorMessage}`);
      }
    }
  },

  /**
   * Assert that function throws
   */
  toThrow(fn: () => any, expectedError?: string | RegExp): void {
    let didThrow = false;
    let error: any;

    try {
      fn();
    } catch (e) {
      didThrow = true;
      error = e;
    }

    if (!didThrow) {
      throw new Error('Expected function to throw, but it did not');
    }

    if (expectedError) {
      const errorMessage = error?.message || String(error);
      const matches = typeof expectedError === 'string'
        ? errorMessage.includes(expectedError)
        : expectedError.test(errorMessage);

      if (!matches) {
        throw new Error(`Expected error to match ${expectedError}, but got: ${errorMessage}`);
      }
    }
  },

  /**
   * Assert deep equality
   */
  toDeepEqual<T>(actual: T, expected: T): void {
    const actualStr = JSON.stringify(actual, null, 2);
    const expectedStr = JSON.stringify(expected, null, 2);

    if (actualStr !== expectedStr) {
      throw new Error(`Expected deep equality.\nActual: ${actualStr}\nExpected: ${expectedStr}`);
    }
  },

  /**
   * Assert array contains item
   */
  toContain<T>(array: T[], item: T): void {
    if (!array.includes(item)) {
      throw new Error(`Expected array to contain ${JSON.stringify(item)}, but it did not`);
    }
  },

  /**
   * Assert string contains substring
   */
  toContainString(str: string, substring: string): void {
    if (!str.includes(substring)) {
      throw new Error(`Expected string "${str}" to contain "${substring}", but it did not`);
    }
  },

  /**
   * Assert number is within range
   */
  toBeWithinRange(value: number, min: number, max: number): void {
    if (value < min || value > max) {
      throw new Error(`Expected ${value} to be within range [${min}, ${max}], but it was not`);
    }
  },
};

/**
 * Performance testing utilities
 */
export const performanceTestUtils = {
  /**
   * Measure function execution time
   */
  async measureTime<T>(fn: () => T | Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },

  /**
   * Assert performance threshold
   */
  async assertPerformance<T>(
    fn: () => T | Promise<T>,
    maxDuration: number,
    iterations: number = 1
  ): Promise<void> {
    const durations: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { duration } = await this.measureTime(fn);
      durations.push(duration);
    }

    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    if (avgDuration > maxDuration) {
      throw new Error(
        `Performance test failed: average duration ${avgDuration.toFixed(2)}ms exceeds threshold ${maxDuration}ms`
      );
    }
  },

  /**
   * Memory leak detection
   */
  detectMemoryLeak(fn: () => void, iterations: number = 100): {
    hasLeak: boolean;
    initialMemory: number;
    finalMemory: number;
    memoryIncrease: number;
  } {
    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }

    const getMemoryUsage = (): number => {
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    };

    const initialMemory = getMemoryUsage();

    for (let i = 0; i < iterations; i++) {
      fn();
    }

    // Force garbage collection again
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }

    const finalMemory = getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    const hasLeak = memoryIncrease > 1024 * 1024; // 1MB threshold

    return {
      hasLeak,
      initialMemory,
      finalMemory,
      memoryIncrease,
    };
  },
};

/**
 * Test cleanup utilities
 */
export const cleanupUtils = {
  /**
   * Create a cleanup manager
   */
  createCleanupManager(): {
    add: (cleanupFn: () => void) => void;
    cleanup: () => void;
  } {
    const cleanupFunctions: Array<() => void> = [];

    return {
      add: (cleanupFn: () => void) => {
        cleanupFunctions.push(cleanupFn);
      },
      cleanup: () => {
        cleanupFunctions.forEach(fn => {
          try {
            fn();
          } catch (error) {
            console.error('Cleanup function failed:', error);
          }
        });
        cleanupFunctions.length = 0;
      },
    };
  },

  /**
   * Auto cleanup decorator
   */
  withCleanup<T extends (...args: any[]) => any>(
    testFn: T,
    cleanupFn: () => void
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        return testFn(...args);
      } finally {
        cleanupFn();
      }
    }) as T;
  },
};

/**
 * Export all testing utilities
 */
export default {
  // Configuration
  TESTING_CONFIG,
  
  // Mock generators
  mockGenerators,
  mockFactories,
  
  // Test utilities
  testUtils,
  
  // Assertions
  assertions,
  
  // Performance testing
  performanceTestUtils,
  
  // Cleanup utilities
  cleanupUtils,
};
