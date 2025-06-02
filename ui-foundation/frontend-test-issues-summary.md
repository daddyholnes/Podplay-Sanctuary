# Podplay Sanctuary Frontend Test Environment Issues

## 1. Overview

We are encountering two primary persistent issues in the Podplay Sanctuary frontend test environment (Vitest + React Testing Library) that prevent any tests from passing:

1.  **`window.matchMedia` is not mocked or available**: This causes a `TypeError` in `ThemeContext.tsx` when trying to determine the system's preferred color scheme, leading to failures in rendering any component that relies on this context.
2.  **PostCSS/Tailwind CSS plugin loading failure**: Vitest fails to load the `tailwindcss` module when processing CSS, specifically when encountering CSS from the `react-resizable` dependency, even though `tailwindcss` is correctly installed and `postcss.config.cjs` is present.

These issues seem to be intertwined, as the `window.matchMedia` error often appears first, but the PostCSS error also occurs independently in some test suites.

## 2. Current Error Messages

### 2.1. `window.matchMedia` Error

```
TypeError: Cannot read properties of undefined (reading 'matches')
 ❯ getInitialTheme src/contexts/ThemeContext.tsx:31:73
     29|     
     30|     // Check system preference
     31|     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
       |                                                                         ^
     32|     return prefersDark ? 'dark' : 'light';
     33|   };
 ❯ mountState ../node_modules/react-dom/cjs/react-dom.development.js:16167:20
 ❯ Object.useState ../node_modules/react-dom/cjs/react-dom.development.js:16880:16
 ❯ useState ../node_modules/react/cjs/react.development.js:1622:21
 ❯ ThemeProvider src/contexts/ThemeContext.tsx:35:29
 ... (stack trace continues)
```

### 2.2. PostCSS/Tailwind CSS Error

```
Failed to load PostCSS config: Failed to load PostCSS config (searchPath: /home/woody/Podplay-Sanctuary/frontend): [Error] Loading PostCSS Plugin failed: Cannot find module 'tailwindcss'
Require stack:
- /home/woody/Podplay-Sanctuary/frontend/postcss.config.cjs

(@/home/woody/Podplay-Sanctuary/frontend/postcss.config.cjs)
Error: Loading PostCSS Plugin failed: Cannot find module 'tailwindcss'
Require stack:
- /home/woody/Podplay-Sanctuary/frontend/postcss.config.cjs

(@/home/woody/Podplay-Sanctuary/frontend/postcss.config.cjs)
    at load (file:///home/woody/Podplay-Sanctuary/node_modules/vitest/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:11776:11)
    at async Promise.all (index 0)
    at async plugins (file:///home/woody/Podplay-Sanctuary/node_modules/vitest/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:11805:12)
    at async processResult (file:///home/woody/Podplay-Sanctuary/node_modules/vitest/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:11876:14)
  Plugin: vite:css
  File: /home/woody/Podplay-Sanctuary/node_modules/react-resizable/css/styles.css
```

## 3. Relevant Code Snippets

### 3.1. `frontend/src/setupTests.ts` (Latest Attempt)

This file is intended to mock `window.matchMedia`. **Crucially, the `console.log` messages in this file do NOT appear in the test output, suggesting it's not being executed or not early enough.**

```typescript
import { vi } from 'vitest';

console.log('--- Executing setupTests.ts ---'); // Logging to confirm execution

if (typeof window !== 'undefined') {
  console.log('--- window object found in setupTests.ts ---');
  window.matchMedia = vi.fn().mockImplementation(query => {
    console.log(`--- window.matchMedia mock called with query: ${query} ---`);
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
  });
  console.log('--- window.matchMedia has been mocked in setupTests.ts ---');
} else {
  console.error('--- CRITICAL: window object NOT found in setupTests.ts ---');
}

// You can add other global test setups here if needed
```

### 3.2. `frontend/vite.config.ts` (Test Configuration Section)

```typescript
// ... other config ...
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Ensure path is imported

export default defineConfig({
  // ... other config ...
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Backend server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/socket.io': {
        target: 'ws://localhost:5001', // WebSocket server
        ws: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/setupTests.ts'] // Path to setup file
  }
})
```

### 3.3. `frontend/postcss.config.cjs` (Latest Attempt)

**The `console.log` messages for resolving `tailwindcss` also do NOT appear in the test output related to the PostCSS error, suggesting this config might not be fully processed in the context where the error occurs, or the error happens before these logs can run during the Vite CSS plugin's attempt to load it.**

```javascript
console.log('--- Loading postcss.config.cjs ---');
try {
  console.log('--- Attempting to resolve tailwindcss from postcss.config.cjs ---');
  const tailwindPath = require.resolve('tailwindcss');
  console.log(`--- Successfully resolved tailwindcss at: ${tailwindPath} ---`);
} catch (e) {
  console.error('--- CRITICAL: Failed to resolve tailwindcss from postcss.config.cjs ---', e);
}

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 3.4. `frontend/src/contexts/ThemeContext.tsx` (Relevant Part)

```typescript
// ... imports ...
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem('podplay-theme') as Theme;
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    // THIS IS THE LINE CAUSING THE ERROR (line 31 in the actual file)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; 
    return prefersDark ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  // ... rest of the provider ...
};
```

### 3.5. `frontend/package.json` (Relevant Scripts & Dependencies)

```json
{
  "name": "podplay-sanctuary",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    // ... other dependencies ...
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-resizable": "^3.0.5", // CSS from this triggers PostCSS error
    "tailwindcss": "^3.3.6" // Listed here but also in devDependencies
    // ... other dependencies ...
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    // ... other devDependencies ...
    "autoprefixer": "^10.4.16",
    "jsdom": "^23.0.1",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6", // Correctly listed
    "vite": "^5.0.7",
    "vitest": "^1.0.4" // Test runner
  }
}
```
*Note: `tailwindcss` is listed in both `dependencies` and `devDependencies`. This is usually fine but worth noting.*

## 4. Summary of Attempts

### 4.1. For `window.matchMedia`
*   **Various mocking styles in `src/setupTests.ts`**:
    *   `Object.defineProperty(window, 'matchMedia', ...)`
    *   `Object.defineProperty(global.window, 'matchMedia', ...)`
    *   `global.matchMedia = ...`
    *   `window.matchMedia = vi.fn().mockImplementation(...)` (current)
*   **Ensuring `setupFiles` path in `vite.config.ts` is correct**:
    *   Tried `'./src/setupTests.ts'`
    *   Tried `['./src/setupTests.ts']`
    *   Tried `['src/setupTests.ts']` (current)
*   Added extensive `console.log` statements to `src/setupTests.ts` to verify execution. **These logs are consistently absent from test output.**

### 4.2. For PostCSS/Tailwind CSS
*   Verified `tailwindcss` and `autoprefixer` are in `devDependencies`.
*   Ensured `postcss.config.cjs` exists and is correctly formatted (CommonJS).
*   Initially tried explicit PostCSS plugin configuration within `vite.config.ts`'s `css.postcss` option, but this led to ES Module vs CommonJS import issues for the plugins themselves. Reverted to relying on Vite's automatic detection of `postcss.config.cjs`.
*   Added `console.log` statements to `postcss.config.cjs` to trace its loading and `tailwindcss` resolution. **These logs are also absent when the PostCSS error occurs during CSS processing by Vite's CSS plugin.**

## 5. Key Observations & Hypotheses

*   **`setupTests.ts` is likely not running**: The absence of its console logs is strong evidence. This means no `window.matchMedia` mock is ever applied. The reason for this is unclear, as the `vite.config.ts` path seems correct.
*   **Tailwind CSS module resolution fails specifically in the Vitest/Vite CSS processing pipeline**: While `tailwindcss` is installed, the Vite CSS plugin, when invoked by Vitest, cannot find it for `postcss.config.cjs`. This might be a pathing issue, an environment issue specific to how Vitest invokes Vite's plugins, or a conflict.
*   The `react-resizable/css/styles.css` file is consistently cited as the file being processed when the PostCSS error occurs. This suggests the issue isn't with our own CSS files directly but with how dependencies' CSS is handled.

This detailed breakdown should provide the necessary information for further investigation.
