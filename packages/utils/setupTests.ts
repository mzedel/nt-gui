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
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

const TEST_LOCATION = 'localhost';

const oldWindowLocalStorage = window.localStorage;
const oldWindowLocation = window.location;
const oldWindowSessionStorage = window.sessionStorage;

process.on('unhandledRejection', err => {
  throw err;
});

beforeAll(async () => {
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
    getItem: vi.fn(),
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

  //TODO: remove, once https://github.com/testing-library/react-testing-library/issues/1197 resolved
  const _jest = globalThis.jest;
  globalThis.jest = {
    ...globalThis.jest,
    advanceTimersByTime: vi.advanceTimersByTime.bind(vi)
  };
  return () => void (globalThis.jest = _jest);
});

afterEach(async () => {
  // Reset any runtime handlers tests may use.
});

afterAll(async () => {
  // restore `window.location` etc. to the original `jsdom` `Location` object
  window.localStorage = oldWindowLocalStorage;
  window.location = oldWindowLocation;
  window.sessionStorage = oldWindowSessionStorage;
});
