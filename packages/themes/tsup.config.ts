import { config as commonConfig } from '@northern.tech/typescript-config/tsup-config.js';
import { lessLoader } from 'esbuild-plugin-less';
import { defineConfig } from 'tsup';

const config = {
  ...commonConfig,
  esbuildPlugins: [lessLoader()]
};

export default defineConfig(options => ({
  ...config,
  ...options
}));
