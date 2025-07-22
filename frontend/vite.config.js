import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '.dist'
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Point to local backend server
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
            // Fallback to production server if local server is not available
            console.log('Attempting to fallback to production server...');
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to Local Backend:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from Local Backend:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
});
