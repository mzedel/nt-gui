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
//@ts-nocheck
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { createSerializer } from '@emotion/jest';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { yes } from '@northern.tech/utils/helpers';
import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { MessageChannel } from 'worker_threads';

import { menderEnvironment, mockDate, token as mockToken } from './mockData';
import { light } from './theme/light';

expect.addSnapshotSerializer(createSerializer({ includeStyles: true }));

export const TEST_LOCATION = 'localhost';

export const mockAbortController = { signal: { addEventListener: () => {}, removeEventListener: () => {} } };

const oldWindowLocalStorage = window.localStorage;
const oldWindowLocation = window.location;
const oldWindowSessionStorage = window.sessionStorage;

vi.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

vi.useFakeTimers({ now: mockDate });
vi.setSystemTime(mockDate);

const storage = {};
global.HTMLCanvasElement.prototype.getContext = vi.fn();

export const beforeAll = async () => {
  // Temporarily workaround for bug in @testing-library/react when use user-event with `vi.useFakeTimers()`

  // Enable the mocking in tests.
  delete window.location;
  window.location = {
    ...oldWindowLocation,
    hostname: TEST_LOCATION,
    origin: 'http://localhost',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn()
  };
  delete window.sessionStorage;
  window.sessionStorage = {
    ...oldWindowSessionStorage,
    getItem: vi.fn(yes),
    setItem: vi.fn(),
    removeItem: vi.fn()
  };
  delete window.localStorage;
  window.localStorage = {
    ...oldWindowLocalStorage,
    getItem: vi.fn(name => {
      if (name === 'JWT') {
        return JSON.stringify({ token: mockToken });
      }
      return storage[name];
    }),
    setItem: vi.fn(name => storage[name]),
    removeItem: vi.fn()
  };
  window.mender_environment = menderEnvironment;
  window.ENV = 'test';
  global.AbortController = vi.fn().mockImplementation(() => mockAbortController);
  global.MessageChannel = MessageChannel;
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));
  window.RTCPeerConnection = () => ({
    createOffer: () => {},
    setLocalDescription: () => {},
    createDataChannel: () => {}
  });

  Object.defineProperty(navigator, 'appVersion', { value: 'Test', writable: true });
  const intersectionObserverMock = () => ({
    observe: vi.fn(),
    disconnect: vi.fn()
  });
  window.prompt = vi.fn();
  window.IntersectionObserver = vi.fn().mockImplementation(intersectionObserverMock);
  vi.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect);

  //TODO: remove, once https://github.com/testing-library/react-testing-library/issues/1197 resolved
  const _jest = globalThis.jest;

  globalThis.jest = {
    ...globalThis.jest,
    advanceTimersByTime: vi.advanceTimersByTime.bind(vi)
  };
  return () => void (globalThis.jest = _jest);
};

export const afterEach = async () => cleanup();

export const afterAll = async () => {
  // restore `window.location` etc. to the original `jsdom` `Location` object
  window.localStorage = oldWindowLocalStorage;
  window.location = oldWindowLocation;
  window.sessionStorage = oldWindowSessionStorage;
  React.useEffect.mockRestore();
};

const theme = createTheme(light);

const customRender = (ui, options = {}) => {
  const { preloadedState = { users: { currentSession: { token: mockToken, expiresAt: undefined } } }, ...remainder } = options;
  const store = options.store ?? configureStore({ preloadedState });
  const AllTheProviders = ({ children }) => (
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    </ThemeProvider>
  );
  return { store, ...render(ui, { wrapper: AllTheProviders, ...remainder }) };
};

export * from '@testing-library/react';
// override render method

export { customRender as render };
