import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    rollupOptions: {
      external: [],
    },
  },
  define: {
    global: 'globalThis',
    'process.env': JSON.stringify({}),
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['buffer'],
    esbuildOptions: {
      inject: ['./src/buffer-polyfill.ts'],
      define: {
        global: 'globalThis',
        'process.env': JSON.stringify({}),
      },
    },
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
});
