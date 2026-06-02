import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
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
