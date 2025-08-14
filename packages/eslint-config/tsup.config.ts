import { defineConfig } from 'tsup';

export default defineConfig(options => ({
  format: ['cjs', 'esm'],
  ...options
}));
