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
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const baseConfigPath = await import.meta.resolve('@northern.tech/testing/baseTestConfig.json');
const baseConfig = JSON.parse(fs.readFileSync(fileURLToPath(baseConfigPath), 'utf-8'));

export default defineConfig({
  ...baseConfig,
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@/testUtils',
        replacement: path.resolve(__dirname, 'testUtils')
      }
    ]
  },
  test: {
    ...baseConfig.test,
    setupFiles: path.resolve(__dirname, 'setupTests.ts')
  }
});
