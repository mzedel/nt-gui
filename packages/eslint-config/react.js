import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { resolve } from 'node:path';
import ts from 'typescript-eslint';

/**
 * Flat config version of the React ESLint configuration.
 */
export default defineConfig([
  js.configs.recommended,
  ts.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooksPlugin.configs['recommended-latest'],
  {
    ignores: ['node_modules/', 'dist/', '.eslintrc.js', '**/*.css'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        JSX: true
      },
      parserOptions: {
        parser: ts.parser,
        tsconfigRootDir: resolve(process.cwd())
      }
    },
    plugins: {
      import: importPlugin,
      prettier: eslintPluginPrettier,
      sonarjs: sonarjsPlugin
    },
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'consistent-this': ['error', 'self'],
      'import/no-named-as-default': 'off',
      'no-console': 'off',
      'no-multiple-empty-lines': 'error',
      'no-prototype-builtins': 'off',
      'no-unused-vars': 'off',
      'prettier/prettier': 'error',
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      'react/forbid-dom-props': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-pascal-case': 'error',
      'react/no-redundant-should-component-update': 'error',
      'react/no-this-in-sfc': 'error',
      'react/no-typos': 'error',
      'react/no-unsafe': 'error',
      'react/no-unused-prop-types': 'error',
      'react/prefer-es6-class': 'error',
      'react/prefer-stateless-function': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
      'react/self-closing-comp': 'error',
      'react/sort-prop-types': 'error',
      'react/state-in-constructor': 'error',
      'react/static-property-placement': 'error',
      'react/style-prop-object': 'error',
      'react/void-dom-elements-no-children': 'error',
      'sonarjs/cognitive-complexity': ['error', 17],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: {
            order: 'alphabetically-case-insensitive'
          }
        }
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
]);
