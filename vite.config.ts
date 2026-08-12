import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // The default "forks" pool hangs waiting for the worker to respond on
    // some Windows setups (sandboxed/restricted process spawning). The
    // "threads" pool is more portable and verified working on both Windows
    // and the Linux CI runner.
    pool: 'threads',
  },
});
