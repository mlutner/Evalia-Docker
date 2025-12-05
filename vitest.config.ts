import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./client/src/test/setup.ts'],
    globals: true,
    include: [
      'server/**/*.{test,spec}.{ts,tsx}',
      'client/src/**/*.{test,spec}.{ts,tsx}',
      'shared/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'client/src/test/e2e/**',
      '**/playwright/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'client/src/test/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@core': path.resolve(__dirname, 'src/core'),
    },
  },
});
