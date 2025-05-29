import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          // Log the original path for debugging
          console.log(`Original path: ${path}`);
          
          // Check if the path corresponds to one of the v1 endpoints
          const v1Endpoints = [
            '/api/v1/execute_python_nixos', 
            '/api/v1/job_status', 
            '/api/v1/workspaces',
            '/api/v1/scout_agent'
          ];
          
          for (const endpoint of v1Endpoints) {
            if (path.startsWith(endpoint.replace('/api/v1', '/api'))) {
              const newPath = path.replace('/api', '/api/v1');
              console.log(`Rewriting path to: ${newPath}`);
              return newPath;
            }
          }
          
          // Keep the path as is for non-v1 endpoints
          return path;
        }
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom']
        }
      }
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
})
