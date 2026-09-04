import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

const src = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': src('core'),
      '@project': src('project'),
      '@targets': src('targets'),
      '@ladder': src('ladder'),
      '@grafcet': src('grafcet'),
      '@exporters': src('exporters'),
      '@persistence': src('persistence'),
      '@ui': src('ui'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
