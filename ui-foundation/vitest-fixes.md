# Vitest Configuration Fixes for Podplay Sanctuary

## Issue 1: window.matchMedia Mock Not Working

### Root Cause
The `setupTests.ts` file is not being executed, which means your `window.matchMedia` mock is never applied. This is likely due to the setup file configuration in Vitest.

### Solution 1: Fix Vitest Configuration (Recommended)

**Update `vite.config.ts`:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/socket.io': {
        target: 'ws://localhost:5001',
        ws: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'], // Use relative path with ./
    // Alternative: use absolute path
    // setupFiles: [path.resolve(__dirname, 'src/setupTests.ts')],
  }
})
```

**Update `src/setupTests.ts`:**

```typescript
import { vi, beforeAll } from 'vitest';

console.log('=== setupTests.ts is executing ===');

// Ensure the mock is set up before any tests run
beforeAll(() => {
  console.log('=== Setting up global mocks ===');
  
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => {
      console.log(`=== matchMedia mock called with: ${query} ===`);
      return {
        matches: false, // Default to light mode for tests
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  });

  // Mock localStorage for theme persistence tests
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  console.log('=== Global mocks setup complete ===');
});
```

### Solution 2: Alternative Vitest-only Configuration

If the above doesn't work, create a separate `vitest.config.ts`:

**Create `vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
})
```

## Issue 2: PostCSS/Tailwind CSS Loading Failure

### Root Cause
Vitest has trouble resolving the `tailwindcss` module when processing CSS files, particularly from node_modules dependencies like `react-resizable`.

### Solution: Configure CSS Handling in Vitest

**Update your Vite/Vitest config to handle CSS properly:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/socket.io': {
        target: 'ws://localhost:5001',
        ws: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    // Handle CSS imports in tests
    css: {
      modules: {
        classNameStrategy: 'stable',
      },
    },
    // Mock CSS files to avoid PostCSS processing in tests
    transformMode: {
      web: [/\.[jt]sx?$/],
      ssr: [/\.([cm]?[jt]s|json)$/],
    },
  },
  // Ensure PostCSS config is found
  css: {
    postcss: './postcss.config.cjs',
  },
})
```

**Alternative: Mock CSS imports in tests:**

Add this to your `src/setupTests.ts`:

```typescript
// Mock CSS imports to avoid PostCSS processing
vi.mock('*.css', () => ({}));
vi.mock('*.scss', () => ({}));
vi.mock('*.sass', () => ({}));
```

**Or create a dedicated CSS mock:**

**Create `src/__mocks__/styleMock.js`:**

```javascript
module.exports = {};
```

**Update Vitest config to use the mock:**

```typescript
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
},
```

## Issue 3: Fix ThemeContext to be Test-Friendly

**Update `src/contexts/ThemeContext.tsx`:**

```typescript
// ... imports ...

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const getInitialTheme = (): Theme => {
    // Check if we're in a test environment
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'light'; // Default for tests
    }

    const savedTheme = localStorage?.getItem('podplay-theme') as Theme;
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference - now safely
    try {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch (error) {
      console.warn('matchMedia not available, defaulting to light theme');
      return 'light';
    }
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  // ... rest of the provider ...
};
```

## Quick Test to Verify Setup

**Create `src/__tests__/setup.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';

describe('Test Setup Verification', () => {
  it('should have window.matchMedia mocked', () => {
    expect(window.matchMedia).toBeDefined();
    expect(typeof window.matchMedia).toBe('function');
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    expect(mediaQuery.matches).toBe(false);
  });

  it('should have localStorage mocked', () => {
    expect(window.localStorage).toBeDefined();
    expect(typeof window.localStorage.getItem).toBe('function');
  });
});
```

## Package.json Script Updates

Ensure your test scripts are correct:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

## Final Notes

1. **Choose one configuration approach**: Either use the main `vite.config.ts` with test configuration or create a separate `vitest.config.ts`.

2. **Check for conflicting configs**: Make sure you don't have conflicting test configurations in multiple files.

3. **CSS handling**: The CSS mocking approach will prevent PostCSS errors but won't test actual styling. If you need to test CSS classes, use the PostCSS configuration approach.

4. **Debugging**: Run tests with `--reporter=verbose` to get more detailed output about what's happening during setup.

Try these solutions in order, and the console logs should start appearing, indicating that your setup files are running correctly.