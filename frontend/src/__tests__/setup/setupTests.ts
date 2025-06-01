import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { configure } from '@testing-library/react';
import { enableFetchMocks } from 'jest-fetch-mock';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  computedStyleSupportsPseudoElements: true
});

// Enable fetch mocks
enableFetchMocks();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: []
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock MutationObserver
global.MutationObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => [])
}));

// Mock PerformanceObserver
global.PerformanceObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => [])
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

// Mock requestIdleCallback
global.requestIdleCallback = jest.fn((cb) => setTimeout(cb, 0));
global.cancelIdleCallback = jest.fn();

// Mock scrollTo
global.scrollTo = jest.fn();
Element.prototype.scrollTo = jest.fn();
Element.prototype.scrollIntoView = jest.fn();

// Mock focus and blur
HTMLElement.prototype.focus = jest.fn();
HTMLElement.prototype.blur = jest.fn();

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 100,
  height: 100,
  top: 0,
  left: 0,
  bottom: 100,
  right: 100,
  x: 0,
  y: 0,
  toJSON: jest.fn()
}));

// Mock getComputedStyle
global.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(),
  width: '100px',
  height: '100px',
  display: 'block',
  position: 'static',
  visibility: 'visible',
  opacity: '1'
}));

// Mock matchMedia
global.matchMedia = jest.fn((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}));

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve(''))
  },
  writable: true
});

// Mock Notification API
global.Notification = jest.fn(() => ({
  close: jest.fn(),
  onclick: null,
  onclose: null,
  onerror: null,
  onshow: null
}));
global.Notification.requestPermission = jest.fn(() => Promise.resolve('granted'));
global.Notification.permission = 'granted';

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn((success) => 
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      })
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  },
  writable: true
});

// Mock battery API
Object.defineProperty(navigator, 'getBattery', {
  value: jest.fn(() => Promise.resolve({
    charging: true,
    chargingTime: 0,
    dischargingTime: Infinity,
    level: 1.0,
    onchargingchange: null,
    onchargingtimechange: null,
    ondischargingtimechange: null,
    onlevelchange: null
  })),
  writable: true
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock FileReader
global.FileReader = jest.fn(() => ({
  readAsDataURL: jest.fn(function() {
    this.onload?.({ target: { result: 'data:image/png;base64,mock-data' } });
  }),
  readAsText: jest.fn(function() {
    this.onload?.({ target: { result: 'mock text content' } });
  }),
  readAsArrayBuffer: jest.fn(function() {
    this.onload?.({ target: { result: new ArrayBuffer(8) } });
  }),
  abort: jest.fn(),
  result: null,
  error: null,
  readyState: 0,
  onload: null,
  onerror: null,
  onabort: null,
  onloadstart: null,
  onloadend: null,
  onprogress: null
}));

// Mock crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
    subtle: {
      encrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(16))),
      decrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(16))),
      sign: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
      verify: jest.fn(() => Promise.resolve(true)),
      digest: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
      generateKey: jest.fn(() => Promise.resolve({})),
      importKey: jest.fn(() => Promise.resolve({})),
      exportKey: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
      deriveKey: jest.fn(() => Promise.resolve({})),
      deriveBits: jest.fn(() => Promise.resolve(new ArrayBuffer(16)))
    }
  },
  writable: true
});

// Mock Web Workers
global.Worker = jest.fn(() => ({
  postMessage: jest.fn(),
  terminate: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  onmessage: null,
  onerror: null
}));

// Mock ServiceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn(() => Promise.resolve({
      installing: null,
      waiting: null,
      active: null,
      scope: 'http://localhost:3000/',
      update: jest.fn(() => Promise.resolve()),
      unregister: jest.fn(() => Promise.resolve(true)),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    })),
    ready: Promise.resolve({
      installing: null,
      waiting: null,
      active: null,
      scope: 'http://localhost:3000/',
      update: jest.fn(() => Promise.resolve()),
      unregister: jest.fn(() => Promise.resolve(true)),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }),
    controller: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  },
  writable: true
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
});

// Mock IndexedDB
global.indexedDB = {
  open: jest.fn(() => ({
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: jest.fn(),
      transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
          add: jest.fn(),
          get: jest.fn(),
          put: jest.fn(),
          delete: jest.fn(),
          clear: jest.fn(),
          openCursor: jest.fn()
        }))
      }))
    }
  })),
  deleteDatabase: jest.fn(),
  cmp: jest.fn()
};

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
  url: '',
  protocol: '',
  onopen: null,
  onclose: null,
  onmessage: null,
  onerror: null
}));

// Mock EventSource
global.EventSource = jest.fn(() => ({
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
  url: '',
  withCredentials: false,
  onopen: null,
  onmessage: null,
  onerror: null
}));

// Mock canvas context
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({})),
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
  measureText: jest.fn(() => ({ width: 100 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn()
}));

// Mock HTMLMediaElement
HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
HTMLMediaElement.prototype.pause = jest.fn();
HTMLMediaElement.prototype.load = jest.fn();

// Mock speech synthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: jest.fn(() => []),
    speaking: false,
    pending: false,
    paused: false,
    onvoiceschanged: null
  },
  writable: true
});

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Clean up after each test
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Clear localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset fetch mock
  fetchMock.resetMocks();
  
  // Reset timers
  jest.clearAllTimers();
  jest.useRealTimers();
  
  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

afterEach(() => {
  // Clean up any remaining timers
  jest.runOnlyPendingTimers();
  jest.clearAllTimers();
  
  // Clean up any open handlers
  cleanup();
});

// Custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
      toHaveBeenCalledBefore(mock: jest.MockedFunction<any>): R;
      toHaveBeenCalledAfter(mock: jest.MockedFunction<any>): R;
    }
  }
}

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      };
    }
  },
  
  toHaveBeenCalledBefore(received: jest.MockedFunction<any>, other: jest.MockedFunction<any>) {
    const receivedCalls = received.mock.invocationCallOrder;
    const otherCalls = other.mock.invocationCallOrder;
    
    if (receivedCalls.length === 0) {
      return {
        message: () => `expected ${received.getMockName()} to have been called`,
        pass: false
      };
    }
    
    if (otherCalls.length === 0) {
      return {
        message: () => `expected ${other.getMockName()} to have been called`,
        pass: false
      };
    }
    
    const lastReceivedCall = Math.max(...receivedCalls);
    const firstOtherCall = Math.min(...otherCalls);
    const pass = lastReceivedCall < firstOtherCall;
    
    if (pass) {
      return {
        message: () => `expected ${received.getMockName()} not to have been called before ${other.getMockName()}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received.getMockName()} to have been called before ${other.getMockName()}`,
        pass: false
      };
    }
  }
});

export {};
