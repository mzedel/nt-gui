// Copyright 2024 Northern.tech AS
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
import { Palette, ThemeOptions, autocompleteClasses, inputBaseClasses } from '@mui/material';
import { buttonClasses } from '@mui/material/Button';

import { blue, commonPalette, darkBackground, darkBlue, darkThemeText, gray, orange, overrides, typography } from './common';

// @ts-ignore
const palette = {
  ...commonPalette,
  primary: {
    main: gray[600],
    light: blue[200],
    dark: gray[700],
    border: 'rgba(255, 255, 255, 0.12)'
  },
  secondary: {
    main: orange[800],
    light: darkBlue[700],
    dark: orange[850]
  },
  link: { primary: darkBlue[200], muted: gray[200] },
  text: {
    primary: darkThemeText,
    muted: gray[300]
  },
  background: {
    default: darkBackground[900],
    lightgrey: darkBackground[500],
    code: darkBackground[800]
  },
  border: {
    main: 'rgba(255, 255, 255, 0.12)'
  },
  mode: 'dark'
} as Palette;

// @ts-ignore
export const dark: ThemeOptions = {
  palette,
  typography,
  components: {
    ...overrides,
    MuiTextField: {
      ...overrides.MuiTextField,
      styleOverrides: {
        ...overrides.MuiTextField.styleOverrides,
        root: {
          ...overrides.MuiTextField.styleOverrides.root
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        ...overrides.MuiAutocomplete.styleOverrides,
        root: {
          ...overrides.MuiAutocomplete.styleOverrides.root,
          [`& .${autocompleteClasses.input}`]: {
            ...(overrides.MuiAutocomplete.styleOverrides.root[`& .${autocompleteClasses.input}`] as object),
            background: darkBackground[50],
            color: palette.text.primary,
            caretColor: palette.text.primary
          },
          [`& .${inputBaseClasses.input}::placeholder`]: {
            ...(overrides.MuiAutocomplete.styleOverrides.root[`& .${inputBaseClasses.input}::placeholder`] as object),
            color: palette.text.primary
          },
          ['.Mui-focused .MuiOutlinedInput-notchedOutline']: {
            border: `3px solid ${darkBlue[200]} !important`
          },
          '.MuiAutocomplete-option': {
            backgroundColor: darkBackground[50]
          }
        },
        popper: {
          ...overrides.MuiAutocomplete.styleOverrides.popper
        },
        noOptions: {
          ...(overrides.MuiAutocomplete.styleOverrides.noOptions as object),
          color: `${palette.text.primary} !important`,
          background: `${darkBackground[50]} !important`
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltipArrow: {
          ['> .MuiTooltip-arrow']: {
            color: gray[600]
          },
          background: gray[600]
        }
      }
    },
    MuiButton: {
      ...overrides.MuiButton,
      styleOverrides: {
        ...overrides.MuiButton.styleOverrides,
        // @ts-ignore
        root: {
          ...overrides.MuiButton.styleOverrides.root,
          [`&.${buttonClasses.colorSecondary}`]: {
            color: darkBackground[900]
          },
          [`&.${buttonClasses.disabled}`]: {
            color: 'rgba(255, 255, 255, 0.6)'
          }
        }
      }
    }
  }
};
