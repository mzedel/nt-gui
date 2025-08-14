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

import { blue, commonPalette, darkBlue, gray, overrides, typography } from './common';

// @ts-ignore
const palette = {
  ...commonPalette,
  primary: {
    main: darkBlue[700],
    light: darkBlue[700],
    dark: blue[700],
    border: '#E0E0E0'
  },
  secondary: {
    main: darkBlue[700],
    light: darkBlue[700],
    dark: darkBlue[400]
  },
  border: {
    main: gray[600]
  },
  tooltip: {
    text: gray[50],
    tierTipBackground: '#f7fafb'
  },
  text: { primary: '#0B132A', muted: gray[600] },
  link: { primary: darkBlue[400], muted: gray[500] },
  background: {
    default: '#FFF',
    lightgrey: gray[50],
    code: gray[50],
    paper: gray[50]
  },
  mode: 'light'
} as Palette;

export const light: ThemeOptions = {
  palette,
  typography,
  // @ts-ignore
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
            background: palette.background.paper,
            color: '#0B132A',
            caretColor: '#3869FF'
          },
          [`& .${inputBaseClasses.input}::placeholder`]: {
            ...(overrides.MuiAutocomplete.styleOverrides.root[`& .${inputBaseClasses.input}::placeholder`] as object),
            color: gray[600]
          },
          ['.Mui-focused .MuiOutlinedInput-notchedOutline']: {
            border: `3px solid ${blue[500]} !important`
          },
          '.MuiAutocomplete-option': {
            backgroundColor: '#FFFFFFDE'
          }
        },
        popper: {
          ...(overrides.MuiAutocomplete.styleOverrides.popper as object)
        },
        noOptions: {
          ...(overrides.MuiAutocomplete.styleOverrides.noOptions as object)
        }
      }
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: gray[700],
          fontSize: 12,
          fontWeight: 500
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          ...overrides.MuiIconButton.styleOverrides,
          color: palette.text.primary
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: palette.text.primary
        }
      }
    }
  }
};
