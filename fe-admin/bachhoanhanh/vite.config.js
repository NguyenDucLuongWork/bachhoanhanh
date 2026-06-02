import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy OCR requests to gateway or OCR service. Configure with VITE_OCR_GATEWAY
      // Example .env: VITE_OCR_GATEWAY=http://127.0.0.1:8090
      '/api/ocr': {
        target: process.env.VITE_OCR_GATEWAY || process.env.OCR_GATEWAY || 'http://bachhoanhanh',
        changeOrigin: true,
        secure: false,
      },
      '/api/ocr/': {
        target: process.env.VITE_OCR_GATEWAY || process.env.OCR_GATEWAY || 'http://bachhoanhanh',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
      },
      '/products': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
      },
      '/prototypes': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
      },
      '/catalogs': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
      },
      '/orders': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
      },
      '/payments': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
      },
      '/brands': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
      },
      '/vouchers': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
      },
      '/attribute-types': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
      },
      '/stocks': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
      },
    },
  },
});
