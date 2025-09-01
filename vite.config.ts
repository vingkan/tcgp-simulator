import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/tcgp-simulator/",
  build: {
    outDir: "tcgp-simulator",
  },
  plugins: [react()],
  server: {
    hmr: true,
  },
});
