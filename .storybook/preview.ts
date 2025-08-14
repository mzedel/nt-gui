import type { Preview } from '@storybook/react-vite';
import { initialize as initializeMSW, mswLoader } from 'msw-storybook-addon';

import { defaultProduct, defaultTheme, globalProductType, globalThemeType, withMuiTheme } from './utils/themeUtils';

initializeMSW();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#fff' },
        { name: 'dark', value: '#000' }
      ]
    }
  },
  decorators: [withMuiTheme],
  globalTypes: {
    product: globalProductType,
    theme: globalThemeType
  },
  initialGlobals: { theme: defaultTheme, product: defaultProduct },
  loaders: [mswLoader],
  tags: ['autodocs']
};

export default preview;
