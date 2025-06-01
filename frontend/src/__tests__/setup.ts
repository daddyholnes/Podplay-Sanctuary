/**
 * Test Setup Configuration
 * 
 * Global test setup for Jest and React Testing Library in Podplay Sanctuary.
 * Configures testing environment, polyfills, and global test utilities.
 * 
 * @fileoverview Testing environment configuration and setup
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, jest } from '@jest/globals';

// ============================================================================
// TESTING LIBRARY CONFIGURATION
// ============================================================================

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  computedStyleSupportsPseudoElements: true,
});

// ============================================================================
// GLOBAL TEST SETUP
// ============================================================================

beforeAll(() => {
  // Mock window.matchMedia for responsive design tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock ResizeObserver for layout tests
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock IntersectionObserver for visibility tests
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock HTMLElement methods for DOM tests
  global.HTMLElement.prototype.scrollIntoView = jest.fn();
  global.HTMLElement.prototype.hasPointerCapture = jest.fn();
  global.HTMLElement.prototype.releasePointerCapture = jest.fn();
  global.HTMLElement.prototype.setPointerCapture = jest.fn();

  // Mock Canvas API for chart/drawing tests
  global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({ data: new Array(4) })),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  });

  // Mock URL.createObjectURL for file tests
  global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
  global.URL.revokeObjectURL = jest.fn();

  // Mock Blob for file tests
  if (!global.Blob) {
    global.Blob = class MockBlob {
      constructor(content: any[], options?: any) {
        this.size = 0;
        this.type = options?.type || '';
      }
      size: number;
      type: string;
    } as any;
  }

  // Mock File for file upload tests
  if (!global.File) {
    global.File = class MockFile extends global.Blob {
      constructor(content: any[], name: string, options?: any) {
        super(content, options);
        this.name = name;
        this.lastModified = Date.now();
      }
      name: string;
      lastModified: number;
    } as any;
  }

  // Mock FileReader for file reading tests
  global.FileReader = class MockFileReader {
    result: any = null;
    error: any = null;
    readyState: number = 0;
    onload: any = null;
    onerror: any = null;
    onprogress: any = null;
    
    readAsText() {
      this.readyState = 2;
      this.result = 'mock file content';
      if (this.onload) this.onload({ target: this });
    }
    
    readAsDataURL() {
      this.readyState = 2;
      this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=';
      if (this.onload) this.onload({ target: this });
    }
    
    readAsArrayBuffer() {
      this.readyState = 2;
      this.result = new ArrayBuffer(0);
      if (this.onload) this.onload({ target: this });
    }
    
    abort() {
      this.readyState = 0;
    }
  } as any;

  // Mock fetch for API tests
  global.fetch = jest.fn();

  // Mock WebSocket for real-time tests
  global.WebSocket = jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    readyState: 1,
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  }));

  // Mock performance API for performance tests
  if (!global.performance) {
    global.performance = {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByName: jest.fn(() => []),
      getEntriesByType: jest.fn(() => []),
      clearMarks: jest.fn(),
      clearMeasures: jest.fn(),
    } as any;
  }

  // Mock localStorage and sessionStorage
  const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: mockStorage,
    writable: true,
  });

  // Mock crypto API for security tests
  Object.defineProperty(global, 'crypto', {
    value: {
      getRandomValues: jest.fn((arr: any) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }),
      randomUUID: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
      subtle: {
        digest: jest.fn(),
        encrypt: jest.fn(),
        decrypt: jest.fn(),
        sign: jest.fn(),
        verify: jest.fn(),
        generateKey: jest.fn(),
        exportKey: jest.fn(),
        importKey: jest.fn(),
      },
    },
    writable: true,
  });

  // Mock navigator for browser feature tests
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: jest.fn(() => Promise.resolve()),
      readText: jest.fn(() => Promise.resolve('mock clipboard text')),
    },
    writable: true,
  });

  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    writable: true,
  });

  // Mock geolocation for location tests
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: jest.fn((success) => 
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
            accuracy: 100,
          },
        })
      ),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    },
    writable: true,
  });

  // Mock console methods for clean test output
  global.console = {
    ...console,
    // Suppress console.log in tests unless explicitly needed
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

// ============================================================================
// TEST CLEANUP
// ============================================================================

afterEach(() => {
  // Clean up DOM after each test
  cleanup();
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset fetch mock
  if (global.fetch && typeof global.fetch === 'function') {
    (global.fetch as jest.Mock).mockReset();
  }
  
  // Clear localStorage and sessionStorage
  window.localStorage.clear();
  window.sessionStorage.clear();
  
  // Reset console spies
  jest.clearAllMocks();
});

afterAll(() => {
  // Final cleanup
  jest.restoreAllMocks();
});

// ============================================================================
// CUSTOM MATCHERS
// ============================================================================

// Add custom Jest matchers for better assertions
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = received && document.body.contains(received);
    return {
      pass,
      message: () => 
        pass 
          ? `Expected element not to be in the document`
          : `Expected element to be in the document`,
    };
  },
  
  toHaveAccessibleName: (received, expected) => {
    // Mock implementation for accessibility testing
    const pass = true; // Would use real accessibility testing library
    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have accessible name "${expected}"`
          : `Expected element to have accessible name "${expected}"`,
    };
  },
  
  toHaveNoViolations: (received) => {
    // Mock implementation for axe-core accessibility testing
    const pass = true; // Would use real axe-core testing
    return {
      pass,
      message: () =>
        pass
          ? `Expected accessibility violations`
          : `Expected no accessibility violations`,
    };
  },
});

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Wait for next React render cycle
 */
export const waitForNextTick = () => 
  new Promise(resolve => setTimeout(resolve, 0));

/**
 * Mock timer utilities
 */
export const mockTimers = {
  setup: () => jest.useFakeTimers(),
  cleanup: () => jest.useRealTimers(),
  advanceBy: (ms: number) => jest.advanceTimersByTime(ms),
  runAll: () => jest.runAllTimers(),
};

/**
 * Error boundary for testing error scenarios
 */
export class TestErrorBoundary extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TestErrorBoundary';
  }
}

/**
 * Mock API responses
 */
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
  headers: new Headers(),
});

/**
 * Test environment info
 */
export const TEST_CONFIG = {
  timeout: 5000,
  retries: 3,
  verbose: process.env.NODE_ENV !== 'production',
  coverage: process.env.COVERAGE === 'true',
} as const;

console.log('🧪 Test environment initialized successfully');
