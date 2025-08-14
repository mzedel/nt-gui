import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import * as eslintPluginMdx from 'eslint-plugin-mdx';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginStorybook from 'eslint-plugin-storybook';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { resolve } from 'node:path';
import ts from 'typescript-eslint';

/**
 * Flat config version of the Storybook ESLint configuration.
 */
export default defineConfig([
  js.configs.recommended,
  ts.configs.recommended,
  eslintPluginMdx.flat,
  ...eslintPluginStorybook.configs['flat/recommended'],
  {
    ignores: ['node_modules/', 'dist/', '**/*.css'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser
      },
      parserOptions: {
        parser: ts.parser,
        tsconfigRootDir: resolve(process.cwd())
      }
    },
    plugins: {
      import: importPlugin,
      prettier: eslintPluginPrettier
    },
    rules: {
      'import/no-default-export': 'off'
    }
  }
]);
