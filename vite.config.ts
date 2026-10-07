import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const deployTarget = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.DEPLOY_TARGET;
export default defineConfig({
  plugins: [react()],
  base: deployTarget === 'github-pages' ? '/portfolio/' : '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) return 'three-core';
          if (id.includes('/node_modules/@react-three/fiber/') || id.includes('/node_modules/react-reconciler/')) return 'react-three';
          return undefined;
        },
      },
    },
  },
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
});
