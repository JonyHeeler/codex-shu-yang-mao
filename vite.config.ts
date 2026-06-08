import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist/renderer",
    emptyOutDir: false
  },
  resolve: {
    alias: {
      "@shared": "/src/shared",
      "@renderer": "/src/renderer"
    }
  }
});
