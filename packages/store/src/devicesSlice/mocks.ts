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
import { DEVICE_STATES, SORTING_OPTIONS } from '../constants';
import { initialState } from './index';

const deviceTypes = { qemu: 'qemux86-64' };
const checkInTimeRounded = '2019-01-01T00:00:00.000Z';
const checkInTimeExact = '2019-01-01T10:25:00.000Z';
const defaultMacAddress = 'dc:a6:32:12:ad:bf';
const defaultCreationDate = '2019-01-13T06:25:00.000Z';

export const mockState = {
  ...initialState,
  byId: {
    a1: {
      id: 'a1',
      attributes: {
        device_type: ['raspberrypi4'],
        ipv4_wlan0: '192.168.10.141/24'
      },
      system: {
        check_in_time: checkInTimeRounded
      },
      check_in_time: checkInTimeExact,
      check_in_time_exact: checkInTimeExact,
      check_in_time_rounded: checkInTimeRounded,
      identity_data: { mac: defaultMacAddress },
      status: 'accepted',
      decommissioning: false,
      created_ts: defaultCreationDate,
      updated_ts: '2019-01-01T09:25:00.000Z',
      auth_sets: [
        {
          id: 'auth1',
          identity_data: { mac: defaultMacAddress },
          pubkey: '-----BEGIN PUBLIC KEY-----\nMIIBojWELzgJ62hcXIhAfqfoNiaB1326XZByZwcnHr5BuSPAgMBAAE=\n-----END PUBLIC KEY-----\n',
          ts: defaultCreationDate,
          status: 'accepted'
        }
      ]
    },
    b1: {
      id: 'b1',
      attributes: {
        ipv4_wlan0: '192.168.10.141/24',
        device_type: [deviceTypes.qemu]
      },
      system: {
        check_in_time: checkInTimeRounded
      },
      check_in_time: checkInTimeExact,
      check_in_time_exact: checkInTimeExact,
      check_in_time_rounded: checkInTimeRounded,
      identity_data: { mac: defaultMacAddress },
      status: 'accepted',
      decommissioning: false,
      created_ts: defaultCreationDate,
      updated_ts: '2019-01-01T09:25:00.000Z',
      auth_sets: [
        {
          id: 'auth1',
          identity_data: { mac: defaultMacAddress },
          pubkey: '-----BEGIN PUBLIC KEY-----\nMIIBojWELzgJ62hcXIhAfqfoNiaB1326XZByZwcnHr5BuSPAgMBAAE=\n-----END PUBLIC KEY-----\n',
          ts: defaultCreationDate,
          status: 'accepted'
        }
      ]
    },
    c1: {
      id: 'c1',
      auth_sets: [],
      attributes: {
        device_type: ['qemux86-128']
      }
    }
  },
  byStatus: {
    accepted: { deviceIds: ['a1', 'b1'], total: 2 },
    active: { deviceIds: [], total: 0 },
    inactive: { deviceIds: [], total: 0 },
    pending: { deviceIds: ['c1'], total: 1 },
    preauthorized: { deviceIds: [], total: 0 },
    rejected: { deviceIds: [], total: 0 }
  },
  deviceList: {
    deviceIds: [],
    isLoading: false,
    page: 1,
    perPage: 20,
    selectedAttributes: [],
    selectedIssues: [],
    selection: [],
    sort: {
      direction: SORTING_OPTIONS.desc
      // key: null,
      // scope: null
    },
    state: DEVICE_STATES.accepted,
    total: 0
  },
  filteringAttributes: {
    identityAttributes: ['mac'],
    inventoryAttributes: ['artifact_name'],
    systemAttributes: [],
    tagAttributes: []
  },
  filteringAttributesLimit: 10,
  filters: [],
  groups: {
    byId: {
      testGroup: {
        deviceIds: ['a1', 'b1'],
        filters: [],
        total: 2
      },
      testGroupDynamic: {
        id: 'filter1',
        name: 'filter1',
        filters: [{ scope: 'system', key: 'group', operator: '$eq', value: 'things' }]
      } as const
    },
    selectedGroup: undefined
  },
  limit: 500
};
