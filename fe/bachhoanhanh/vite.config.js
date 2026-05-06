import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/auth": {
        target:
          "http://bachhoanhanh/auth/realms/bachhoanhanh/protocol/openid-connect/token",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, ""),
      },
      "/api/products": {
        target: "http://bachhoanhanh/products",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/products/, ""),
      },
      "/api/orders": {
        target: "http://bachhoanhanh/orders",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/orders/, ""),
      },
      "/api/payments": {
        target: "http://bachhoanhanh/payments",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/payments/, ""),
      },
    },
  },
});
