// filepath: c:\Users\woodyholne\Desktop\Podplay-Sanctuary\frontend\src\__tests__\fixtures\testUtils.ts
/**
 * Test Utilities
 * 
 * This file contains utility functions and helpers for writing tests.
 * It provides common testing patterns and reusable test logic.
 */

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from 'styled-components';

// ============================================================================
// CUSTOM RENDER FUNCTIONS
// ============================================================================

/**
 * Default theme for testing
 */
const mockTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#212529',
    textSecondary: '#6c757d',
    border: '#dee2e6'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '1rem',
    full: '9999px'
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060
  }
};

/**
 * Mock Redux store for testing
 */
const createMockStore = (initialState: any = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => state,
      projects: (state = { items: [], loading: false, error: null }, action) => state,
      chat: (state = { conversations: [], activeConversation: null }, action) => state,
      workspace: (state = { files: [], activeFile: null, openFiles: [] }, action) => state,
      ui: (state = { theme: 'light', sidebarOpen: true, notifications: [] }, action) => state,
      ...initialState
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false
      })
  });
};

/**
 * Create a new QueryClient for testing
 */
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0
      },
      mutations: {
        retry: false
      }
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {}
    }
  });
};

/**
 * All the providers wrapper
 */
interface AllTheProvidersProps {
  children: React.ReactNode;
  initialEntries?: string[];
  initialState?: any;
  queryClient?: QueryClient;
  store?: any;
  theme?: any;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
  initialEntries = ['/'],
  initialState = {},
  queryClient,
  store,
  theme = mockTheme
}) => {
  const testQueryClient = queryClient || createTestQueryClient();
  const testStore = store || createMockStore(initialState);

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <Provider store={testStore}>
        <QueryClientProvider client={testQueryClient}>
          <ThemeProvider theme={theme}>
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </MemoryRouter>
  );
};

/**
 * Custom render function with all providers
 */
export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  initialState?: any;
  queryClient?: QueryClient;
  store?: any;
  theme?: any;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & {
  store: any;
  queryClient: QueryClient;
} => {
  const {
    initialEntries,
    initialState,
    queryClient,
    store,
    theme,
    ...renderOptions
  } = options;

  const testQueryClient = queryClient || createTestQueryClient();
  const testStore = store || createMockStore(initialState);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders
      initialEntries={initialEntries}
      initialState={initialState}
      queryClient={testQueryClient}
      store={testStore}
      theme={theme}
    >
      {children}
    </AllTheProviders>
  );

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    store: testStore,
    queryClient: testQueryClient
  };
};

/**
 * Render with router only
 */
export const renderWithRouter = (
  ui: React.ReactElement,
  { initialEntries = ['/'], ...renderOptions }: { initialEntries?: string[] } & RenderOptions = {}
): RenderResult => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Render with Redux store only
 */
export const renderWithStore = (
  ui: React.ReactElement,
  { initialState = {}, store, ...renderOptions }: { initialState?: any; store?: any } & RenderOptions = {}
): RenderResult & { store: any } => {
  const testStore = store || createMockStore(initialState);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={testStore}>
      {children}
    </Provider>
  );

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    store: testStore
  };
};

/**
 * Render with React Query only
 */
export const renderWithQuery = (
  ui: React.ReactElement,
  { queryClient, ...renderOptions }: { queryClient?: QueryClient } & RenderOptions = {}
): RenderResult & { queryClient: QueryClient } => {
  const testQueryClient = queryClient || createTestQueryClient();

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    queryClient: testQueryClient
  };
};

/**
 * Render with theme only
 */
export const renderWithTheme = (
  ui: React.ReactElement,
  { theme = mockTheme, ...renderOptions }: { theme?: any } & RenderOptions = {}
): RenderResult => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// ============================================================================
// EVENT SIMULATION UTILITIES
// ============================================================================

/**
 * Simulate user typing
 */
export const simulateTyping = async (element: HTMLElement, text: string, delay: number = 50) => {
  const { userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup({ delay });
  
  await user.clear(element);
  await user.type(element, text);
};

/**
 * Simulate file upload
 */
export const simulateFileUpload = async (input: HTMLInputElement, files: File[]) => {
  const { userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup();
  
  await user.upload(input, files);
};

/**
 * Simulate drag and drop
 */
export const simulateDragAndDrop = async (
  source: HTMLElement,
  target: HTMLElement,
  dataTransfer: Record<string, string> = {}
) => {
  const { fireEvent } = await import('@testing-library/react');
  
  const dataTransferObj = {
    getData: jest.fn((format) => dataTransfer[format] || ''),
    setData: jest.fn((format, data) => {
      dataTransfer[format] = data;
    }),
    clearData: jest.fn(),
    dropEffect: 'none',
    effectAllowed: 'all',
    files: [],
    items: [],
    types: Object.keys(dataTransfer)
  };

  fireEvent.dragStart(source, { dataTransfer: dataTransferObj });
  fireEvent.dragEnter(target, { dataTransfer: dataTransferObj });
  fireEvent.dragOver(target, { dataTransfer: dataTransferObj });
  fireEvent.drop(target, { dataTransfer: dataTransferObj });
  fireEvent.dragEnd(source, { dataTransfer: dataTransferObj });
};

/**
 * Simulate keyboard shortcuts
 */
export const simulateKeyboardShortcut = async (element: HTMLElement, shortcut: string) => {
  const { fireEvent } = await import('@testing-library/react');
  
  const keys = shortcut.split('+');
  const modifiers: Record<string, boolean> = {};
  
  keys.forEach(key => {
    switch (key.toLowerCase()) {
      case 'ctrl':
      case 'control':
        modifiers.ctrlKey = true;
        break;
      case 'shift':
        modifiers.shiftKey = true;
        break;
      case 'alt':
        modifiers.altKey = true;
        break;
      case 'meta':
      case 'cmd':
        modifiers.metaKey = true;
        break;
    }
  });
  
  const lastKey = keys[keys.length - 1];
  
  fireEvent.keyDown(element, {
    key: lastKey,
    code: `Key${lastKey.toUpperCase()}`,
    ...modifiers
  });
};

// ============================================================================
// ASYNC TESTING UTILITIES
// ============================================================================

/**
 * Wait for element to appear
 */
export const waitForElement = async (callback: () => HTMLElement | null, timeout: number = 5000) => {
  const { waitFor } = await import('@testing-library/react');
  
  return waitFor(callback, { timeout });
};

/**
 * Wait for async operation with timeout
 */
export const waitForAsync = async <T,>(
  asyncFn: () => Promise<T>,
  timeout: number = 5000
): Promise<T> => {
  return Promise.race([
    asyncFn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Async operation timed out')), timeout)
    )
  ]);
};

/**
 * Flush all promises
 */
export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Wait for next tick
 */
export const nextTick = () => new Promise(resolve => process.nextTick(resolve));

/**
 * Wait for specific time
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// MOCK UTILITIES
// ============================================================================

/**
 * Create a mock function with implementation
 */
export const createMockFn = <T extends (...args: any[]) => any>(impl?: T) => {
  return jest.fn(impl);
};

/**
 * Mock a module with default exports
 */
export const mockModule = (moduleName: string, mockImplementation: any) => {
  jest.doMock(moduleName, () => ({
    __esModule: true,
    default: mockImplementation,
    ...mockImplementation
  }));
};

/**
 * Create mock intersection observer entries
 */
export const createMockIntersectionObserverEntry = (
  isIntersecting: boolean,
  intersectionRatio: number = isIntersecting ? 1 : 0
) => ({
  isIntersecting,
  intersectionRatio,
  time: Date.now(),
  rootBounds: {
    bottom: 1000,
    height: 1000,
    left: 0,
    right: 1000,
    top: 0,
    width: 1000,
    x: 0,
    y: 0,
    toJSON: jest.fn()
  },
  boundingClientRect: {
    bottom: 100,
    height: 100,
    left: 0,
    right: 100,
    top: 0,
    width: 100,
    x: 0,
    y: 0,
    toJSON: jest.fn()
  },
  intersectionRect: {
    bottom: isIntersecting ? 100 : 0,
    height: isIntersecting ? 100 : 0,
    left: 0,
    right: isIntersecting ? 100 : 0,
    top: 0,
    width: isIntersecting ? 100 : 0,
    x: 0,
    y: 0,
    toJSON: jest.fn()
  },
  target: document.createElement('div')
});

/**
 * Create mock resize observer entry
 */
export const createMockResizeObserverEntry = (width: number, height: number) => ({
  target: document.createElement('div'),
  contentRect: {
    bottom: height,
    height,
    left: 0,
    right: width,
    top: 0,
    width,
    x: 0,
    y: 0,
    toJSON: jest.fn()
  },
  borderBoxSize: [{
    blockSize: height,
    inlineSize: width
  }],
  contentBoxSize: [{
    blockSize: height,
    inlineSize: width
  }],
  devicePixelContentBoxSize: [{
    blockSize: height * window.devicePixelRatio,
    inlineSize: width * window.devicePixelRatio
  }]
});

// ============================================================================
// TESTING LIFECYCLE UTILITIES
// ============================================================================

/**
 * Setup function to run before each test
 */
export const setupTest = () => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset timers
  jest.clearAllTimers();
  
  // Clear local storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Reset console mocks
  jest.clearAllMocks();
  
  // Reset performance marks
  if (performance.clearMarks) {
    performance.clearMarks();
    performance.clearMeasures();
  }
};

/**
 * Cleanup function to run after each test
 */
export const cleanupTest = () => {
  // Cleanup any remaining timers
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset modules
  jest.resetModules();
  
  // Clear storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Cleanup any remaining event listeners
  window.removeAllListeners?.();
};

/**
 * Create a test suite wrapper with setup and cleanup
 */
export const createTestSuite = (suiteName: string, tests: () => void) => {
  describe(suiteName, () => {
    beforeEach(setupTest);
    afterEach(cleanupTest);
    tests();
  });
};

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Assert that an element has specific accessibility attributes
 */
export const assertAccessibility = (element: HTMLElement, attributes: Record<string, string>) => {
  Object.entries(attributes).forEach(([attr, value]) => {
    expect(element).toHaveAttribute(attr, value);
  });
};

/**
 * Assert that an element is properly labeled
 */
export const assertProperLabeling = (element: HTMLElement) => {
  const hasAriaLabel = element.hasAttribute('aria-label');
  const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
  const hasAssociatedLabel = element.id && document.querySelector(`label[for="${element.id}"]`);
  
  expect(hasAriaLabel || hasAriaLabelledBy || hasAssociatedLabel).toBe(true);
};

/**
 * Assert that an error was logged
 */
export const assertErrorLogged = (errorMessage: string) => {
  expect(console.error).toHaveBeenCalledWith(
    expect.stringContaining(errorMessage)
  );
};

/**
 * Assert that a performance mark was created
 */
export const assertPerformanceMark = (markName: string) => {
  const marks = performance.getEntriesByName(markName, 'mark');
  expect(marks.length).toBeGreaterThan(0);
};

/**
 * Assert that an analytics event was fired
 */
export const assertAnalyticsEvent = (eventName: string, properties?: Record<string, any>) => {
  // This would depend on your analytics implementation
  // Example for a global analytics mock:
  expect(window.analytics?.track).toHaveBeenCalledWith(
    eventName,
    properties ? expect.objectContaining(properties) : expect.any(Object)
  );
};

// ============================================================================
// PERFORMANCE TESTING UTILITIES
// ============================================================================

/**
 * Measure component render time
 */
export const measureRenderTime = async (renderFn: () => RenderResult) => {
  const startTime = performance.now();
  const result = renderFn();
  const endTime = performance.now();
  
  return {
    renderTime: endTime - startTime,
    result
  };
};

/**
 * Test component performance with multiple renders
 */
export const performanceTest = async (
  renderFn: () => RenderResult,
  iterations: number = 100
) => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const { renderTime } = await measureRenderTime(renderFn);
    times.push(renderTime);
  }
  
  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  return {
    averageTime,
    minTime,
    maxTime,
    times
  };
};

// ============================================================================
// VISUAL REGRESSION TESTING UTILITIES
// ============================================================================

/**
 * Capture component screenshot for visual testing
 */
export const captureScreenshot = async (element: HTMLElement, name: string) => {
  // This would depend on your visual testing setup
  // Example implementation placeholder
  return Promise.resolve(`screenshot-${name}-${Date.now()}.png`);
};

/**
 * Compare visual snapshots
 */
export const compareVisualSnapshot = async (element: HTMLElement, snapshotName: string) => {
  // This would depend on your visual testing setup
  // Example implementation placeholder
  return Promise.resolve({ match: true, diff: null });
};

// Export default render function for convenience
export { render } from '@testing-library/react';
export default renderWithProviders;
