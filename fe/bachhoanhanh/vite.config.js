import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const API_TARGET = env.VITE_API_URL || "https://underground-complimentary-registry-efforts.trycloudflare.com";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '^/(auth|products|prototypes|catalogs|orders|cart|payments|users|vouchers|attribute-types)(.*)$': {
          target: API_TARGET,
          changeOrigin: true,
        },
      },
    },
  };
});
