import { defineConfig } from 'tsup';

export const config = {
  format: ['cjs', 'esm'],
  dts: true,
  entry: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.test.{js,jsx,ts,tsx}', '!src/**/*.stories.{js,jsx,ts,tsx}'],
  sourcemap: true,
  skipNodeModulesBundle: true,
  clean: true,
  loader: {
    '.js': 'jsx'
  },
  outExtension: ({ format }) => ({ js: format === 'esm' ? `.js` : '.cjs' })
};

export default defineConfig(options => ({
  ...config,
  ...options
}));
