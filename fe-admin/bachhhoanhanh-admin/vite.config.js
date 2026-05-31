import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '/api': {
        target: 'http://bachhoanhanh',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})
