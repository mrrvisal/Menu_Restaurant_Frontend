// frontend/vite.config.mjs
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    // Budget for a single chunk. Vendor chunks (three.js for the landing page
    // WebGL hero) are inherently large; everything else stays well below 500 kB.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Keep big vendors in their own cache-friendly chunks.
        // "three" is loaded async via the lazy Hero3D component on the landing page.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("/three/")) return "vendor-three";
          if (/node_modules\/(vue|vue-router|pinia|@vue)\//.test(id)) return "vendor-vue";
          if (id.includes("/axios/")) return "vendor-axios";
        },
      },
    },
  },
});