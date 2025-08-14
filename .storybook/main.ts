import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../packages/**/*.stories.tsx'],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  staticDirs: ['./public'],

  async viteFinal(config) {
    // customize the Vite config here
    return {
      ...config,
      define: { 'process.env': {} }
    };
  }
};

export default config;
