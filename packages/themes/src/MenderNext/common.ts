// Copyright 2025 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import type { Components, Theme } from '@mui/material';
import { accordionClasses } from '@mui/material';
import { blue, cyan, grey, purple } from '@mui/material/colors';

// breakpoints, metadata, shape config, spacing are not adjusted in the theme
import colorDefinitions from './figma/material_colors.json' with { type: 'json' };
import typographyDefinitions from './figma/typography.json' with { type: 'json' };

const typographyTokens = typographyDefinitions.collections.find(({ name }) => name === 'typography');
const colorTokens = colorDefinitions.collections.find(({ name }) => name === 'material/colors');

const themeMode = 'Mode 1';

export const typography = {
  fontFamily: typographyTokens?.variables.fontFamily.values[themeMode],
  body1: {
    fontFamily: typographyTokens?.variables['fontFamily (body)'].values[themeMode]
  },
  mono: {
    fontFamily: typographyTokens?.variables['fontFamily (mono)'].values[themeMode]
  }
};

export const colors = {
  grey: {
    ...grey,
    50: colorTokens?.variables['grey (M)']['50'].values[themeMode] || grey[50],
    100: colorTokens?.variables['grey (M)']['100'].values[themeMode] || grey[100],
    200: colorTokens?.variables['grey (M)']['200'].values[themeMode] || grey[200],
    300: colorTokens?.variables['grey (M)']['300'].values[themeMode] || grey[300],
    400: colorTokens?.variables['grey (M)']['400'].values[themeMode] || grey[400],
    500: colorTokens?.variables['grey (M)']['500'].values[themeMode] || grey[500],
    600: colorTokens?.variables['grey (M)']['600'].values[themeMode] || grey[600],
    700: colorTokens?.variables['grey (M)']['700'].values[themeMode] || grey[700],
    800: colorTokens?.variables['grey (M)']['800'].values[themeMode] || grey[800],
    900: colorTokens?.variables['grey (M)']['900'].values[themeMode] || grey[900]
  },
  purple: {
    ...blue, // ...remainder colors (A100 - A700) should be based on 'blue'
    50: colorTokens?.variables['purple(M)']['50'].values[themeMode] || purple[50],
    100: colorTokens?.variables['purple(M)']['100'].values[themeMode] || purple[100],
    200: colorTokens?.variables['purple(M)']['200'].values[themeMode] || purple[200],
    300: colorTokens?.variables['purple(M)']['300'].values[themeMode] || purple[300],
    400: colorTokens?.variables['purple(M)']['400'].values[themeMode] || purple[400],
    500: colorTokens?.variables['purple(M)']['500'].values[themeMode] || purple[500],
    600: colorTokens?.variables['purple(M)']['600'].values[themeMode] || purple[600],
    700: colorTokens?.variables['purple(M)']['700'].values[themeMode] || purple[700],
    800: colorTokens?.variables['purple(M)']['800'].values[themeMode] || purple[800],
    900: colorTokens?.variables['purple(M)']['900'].values[themeMode] || purple[900]
  },
  cyan: {
    ...cyan,
    50: colorTokens?.variables['cyan (M)']['50'].values[themeMode] || cyan[50],
    100: colorTokens?.variables['cyan (M)']['100'].values[themeMode] || cyan[100],
    200: colorTokens?.variables['cyan (M)']['200'].values[themeMode] || cyan[200],
    300: colorTokens?.variables['cyan (M)']['300'].values[themeMode] || cyan[300],
    400: colorTokens?.variables['cyan (M)']['400'].values[themeMode] || cyan[400],
    500: colorTokens?.variables['cyan (M)']['500'].values[themeMode] || cyan[500],
    600: colorTokens?.variables['cyan (M)']['600'].values[themeMode] || cyan[600],
    700: colorTokens?.variables['cyan (M)']['700'].values[themeMode] || cyan[700],
    800: colorTokens?.variables['cyan (M)']['800'].values[themeMode] || cyan[800],
    900: colorTokens?.variables['cyan (M)']['900'].values[themeMode] || cyan[900]
  }
};

export const components: Components<Theme> = {
  MuiAccordion: {
    styleOverrides: {
      root: ({ theme }) => ({
        border: 'none',
        boxShadow: 'none',
        '&:before': {
          display: 'none'
        },
        padding: theme.spacing(1, 2),
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        [`&.${accordionClasses.expanded}`]: {
          margin: 'auto'
        }
      })
    }
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: {
        alignItems: 'flex-start',
        alignSelf: 'stretch'
      }
    }
  },
  MuiButton: {
    styleOverrides: {
      text: {
        textTransform: 'none'
      }
    }
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        minWidth: 'min-content',
        maxWidth: '80vw',
        padding: theme.spacing(3, 8)
      })
    }
  },
  MuiFormControl: {
    defaultProps: {
      variant: 'outlined'
    }
  },
  MuiInput: {
    styleOverrides: {
      root: {
        minWidth: 220
      }
    }
  },
  MuiTextField: {
    defaultProps: {
      size: 'small',
      variant: 'outlined'
    },
    styleOverrides: {
      root: {
        minWidth: 220
      }
    }
  },
  MuiSelect: {
    defaultProps: {
      autoWidth: true,
      size: 'small',
      variant: 'outlined'
    },
    styleOverrides: {
      root: {
        minWidth: 220
      }
    }
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none'
      }
    }
  }
};
