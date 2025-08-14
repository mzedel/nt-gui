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
export * from './api';
export * from './app';
export * from './devices';
export * from './users';

export const alertChannels = { email: 'email' };

export const limitDefault = { min: 5, max: 100, default: 10 };

export const ALL_RELEASES = 'All releases';

export const SORTING_OPTIONS = {
  asc: 'asc',
  desc: 'desc'
} as const;

export interface SortOptions {
  direction: keyof typeof SORTING_OPTIONS;
  key?: string;
}

export const DEVICE_LIST_DEFAULTS: { page: number; perPage: number } = {
  page: 1,
  perPage: 20
};

export const twoFAStates = {
  enabled: 'enabled',
  disabled: 'disabled',
  unverified: 'unverified'
} as const;
