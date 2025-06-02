import { vi, beforeAll, afterEach } from 'vitest';

console.log('=== setupTests.ts is executing ===');

// Ensure the mock is set up before any tests run
beforeAll(() => {
  console.log('=== Setting up global mocks in beforeAll ===');
  
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => {
      console.log(`=== window.matchMedia mock called with: ${query} ===`);
      return {
        matches: false, // Default to light mode for tests
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  });
  console.log('=== window.matchMedia mocked ===');

  // Mock localStorage for theme persistence tests
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      key: vi.fn((index: number) => Object.keys(store)[index] || null),
      get length() {
        return Object.keys(store).length;
      }
    };
  })();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  console.log('=== window.localStorage mocked ===');
});

// Optional: Clear mocks after each test if needed, especially for localStorage
afterEach(() => {
  // window.localStorage.clear(); // Clears all localStorage items
  // vi.clearAllMocks(); // Clears all vi mocks if you want fresh mocks per test
});

