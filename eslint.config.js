import reactConfig from '@northern.tech/eslint-config/react.js';
import storybookConfig from '@northern.tech/eslint-config/storybook.js';

export default [
  ...reactConfig,
  ...storybookConfig,
  {
    ignores: ['node_modules/', 'dist/', 'packages/', 'storybook-static/']
  }
];
