import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// API base domain - configure via environment: VITE_API_BASE_URL
// Example: VITE_API_BASE_URL=http://127.0.0.1:8080
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://103.173.226.31'

// Helper function to create proxy configuration
const createProxy = (target) => ({
  target,
  changeOrigin: true,
  secure: false,
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // All API endpoints proxy to the same domain
      '/auth': createProxy(API_BASE_URL),
      '/products': createProxy(API_BASE_URL),
      '/prototypes': createProxy(API_BASE_URL),
      '/catalogs': createProxy(API_BASE_URL),
      '/orders': createProxy(API_BASE_URL),
      '/payments': createProxy(API_BASE_URL),
      '/brands': createProxy(API_BASE_URL),
      '/users': createProxy(API_BASE_URL),
      '/vouchers': createProxy(API_BASE_URL),
      '/attribute-types': createProxy(API_BASE_URL),
      '/stocks': createProxy(API_BASE_URL),
      '/api/ocr': createProxy(process.env.VITE_OCR_GATEWAY || API_BASE_URL),
      '/api/ocr/': createProxy(process.env.VITE_OCR_GATEWAY || API_BASE_URL),
    },
  },
});
