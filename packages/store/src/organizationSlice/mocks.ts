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
import { DEVICE_LIST_DEFAULTS } from '../constants';
import { initialState } from './index';

export const mockState = {
  ...initialState,
  card: {
    brand: 'testCorp',
    last4: '7890',
    expiration: { month: 1, year: 2024 }
  },
  auditlog: {
    events: [
      {
        actor: {
          id: 'string',
          type: 'user',
          email: 'string@example.com'
        },
        time: '2019-01-01T12:10:22.667Z',
        action: 'create',
        object: {
          id: 'string',
          type: 'user',
          user: {
            email: 'user@acme.com'
          }
        },
        change: 'change1'
      },
      {
        actor: {
          id: 'string',
          type: 'user',
          email: 'string',
          identity_data: 'string'
        },
        time: '2019-01-01T12:16:22.667Z',
        action: 'create',
        object: {
          id: 'string',
          type: 'deployment',
          deployment: {
            name: 'production',
            artifact_name: 'Application 0.0.1'
          }
        },
        change: 'change2'
      },
      {
        actor: {
          id: 'string',
          type: 'user',
          email: 'string@example.com'
        },
        time: '2019-01-01T12:10:22.669Z',
        action: 'open_terminal',
        meta: {
          session_id: ['abd313a8-ee88-48ab-9c99-fbcd80048e6e']
        },
        object: {
          id: 'a1',
          type: 'device'
        },
        change: 'change3'
      }
    ],
    selectionState: {
      ...DEVICE_LIST_DEFAULTS,
      detail: undefined,
      endDate: undefined,
      selectedIssue: undefined,
      startDate: undefined,
      type: undefined,
      user: undefined,
      isLoading: false,
      sort: {},
      total: 3
    }
  },
  intentId: 'testIntent',
  organization: {
    addons: [],
    id: '1',
    name: 'test',
    plan: 'os',
    trial: false
  }
};
