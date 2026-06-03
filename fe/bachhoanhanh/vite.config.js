import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_BASE = env.BACKEND_URL || env.VITE_API_BASE || 'http://103.173.226.31'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/auth': { target: API_BASE, changeOrigin: true },
        '/products': { target: API_BASE, changeOrigin: true },
        '/prototypes': { target: API_BASE, changeOrigin: true },
        '/catalogs': { target: API_BASE, changeOrigin: true },
        '/orders': { target: API_BASE, changeOrigin: true },
        '/cart': { target: API_BASE, changeOrigin: true },
        '/payments': { target: API_BASE, changeOrigin: true },
        '/users': { target: API_BASE, changeOrigin: true },
        '/vouchers': { target: API_BASE, changeOrigin: true },
        '/attribute-types': { target: API_BASE, changeOrigin: true },
      },
    },
  }
})
