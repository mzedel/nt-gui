import repoConfig from './base.js';

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  ...repoConfig,
  importOrder: ['^react*', '@emotion/*|@mui/*|tss-react/*', '<THIRD_PARTY_MODULES>', '^[./]']
};

export default config;
