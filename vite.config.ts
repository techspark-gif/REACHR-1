import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Target modern browsers — smaller, faster output
      target: 'es2020',
      // Inline small assets directly (< 4 kB) → fewer HTTP requests
      assetsInlineLimit: 4096,
      // Enable CSS code-splitting per chunk
      cssCodeSplit: true,
      // Raise the warning threshold to avoid false alarms (KB)
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Manual chunk strategy: isolate large, infrequently-changing vendor libs
          manualChunks(id) {
            if (id.includes('node_modules/lucide-react')) return 'icons';
            if (id.includes('node_modules/canvas-confetti')) return 'confetti';
            if (id.includes('node_modules/motion')) return 'motion';
            if (id.includes('node_modules/react-dom')) return 'react-dom';
            if (id.includes('node_modules/react/')) return 'react';
            if (id.includes('node_modules/@google/genai')) return 'genai';
          },
        },
      },
    },
  };
});
