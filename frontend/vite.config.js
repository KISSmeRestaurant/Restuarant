import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '.dist' // Add this line
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://restuarant-sh57.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false, // Optional: if you need to bypass SSL verification
      }
    }
  },
});
