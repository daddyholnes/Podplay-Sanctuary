import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@enhanced': path.resolve(__dirname, './src/enhanced'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types')
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    cors: true,
    strictPort: false,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, 'src/setupTests.ts')],
    css: {
      modules: {
        classNameStrategy: 'non-scoped' // Helps with CSS modules in tests
      }
    },
    deps: {
      inline: ['react-resizable'] // Inline problematic dependencies
    },
    moduleNameMapper: {
      // Mock all CSS files with our empty mock
      '\\.css$': path.resolve(__dirname, 'src/test/mocks/styleMock.js'),
      '\\.scss$': path.resolve(__dirname, 'src/test/mocks/styleMock.js'),
      '\\.sass$': path.resolve(__dirname, 'src/test/mocks/styleMock.js'),
      '\\.less$': path.resolve(__dirname, 'src/test/mocks/styleMock.js')
    }
  }
})