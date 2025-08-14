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
import type { DeviceIssueOption } from '@northern.tech/utils/constants';

import { DEVICE_ISSUE_OPTIONS, DEVICE_LIST_DEFAULTS } from '../constants';
import { initialState } from './index';

export const mockState = {
  ...initialState,
  alerts: {
    alertList: { ...DEVICE_LIST_DEFAULTS, total: 0 },
    byDeviceId: {
      a1: {
        alerts: [
          {
            description: 'something',
            id: '31346239-3839-6262-2d63-3365622d3437',
            name: 'SSH Daemon is not running',
            device_id: 'a1',
            level: 'CRITICAL',
            subject: {
              name: 'sshd',
              type: 'systemd',
              status: 'not-running',
              details: { description: 'Jul 22 10:40:56 raspberrypi sshd[32031]: pam_unix(sshd:session): session closed for user root' }
            },
            timestamp: '2021-07-23T12:22:36Z'
          }
        ],
        latest: []
      }
    }
  },
  issueCounts: {
    byType: Object.values<DeviceIssueOption>(DEVICE_ISSUE_OPTIONS).reduce(
      (accu, { isCategory, key }) => {
        if (isCategory) {
          return accu;
        }
        accu[key] = accu[key] ?? { filtered: 0, total: 0 };
        return accu;
      },
      {
        [DEVICE_ISSUE_OPTIONS.authRequests.key]: { filtered: 0, total: 0 },
        [DEVICE_ISSUE_OPTIONS.monitoring.key]: { filtered: 3, total: 0 },
        [DEVICE_ISSUE_OPTIONS.offline.key]: { filtered: 0, total: 0 }
      }
    )
  },
  settings: {
    global: {
      channels: { email: { enabled: true } }
    }
  }
};
