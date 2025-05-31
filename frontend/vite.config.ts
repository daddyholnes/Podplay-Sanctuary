
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000', // Use http, not ws for target
        ws: true,
        changeOrigin: true,
      }
    }
  },
  define: {
    // To make environment variables available in client-side code
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:5000'),
    'process.env.VITE_SOCKET_URL': JSON.stringify(process.env.VITE_SOCKET_URL || 'http://localhost:5000'),
    'process.env.VITE_APP_TITLE': JSON.stringify(process.env.VITE_APP_TITLE || 'Podplay Sanctuary'),
    'process.env.VITE_APP_VERSION': JSON.stringify(process.env.VITE_APP_VERSION || '1.0.0') // Removed trailing comma
  }
});