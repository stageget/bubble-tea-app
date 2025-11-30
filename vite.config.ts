import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    // Proxy /api requests to localhost:3000 when running 'npm run dev'
    // This allows fallback testing if not using 'vercel dev' directly.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});