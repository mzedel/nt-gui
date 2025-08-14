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
import { initialState } from './index';

export const mockState = {
  ...initialState,
  byId: {
    d1: {
      id: 'd1',
      name: 'test deployment',
      artifact_name: 'r1',
      artifacts: ['123'],
      created: '2019-01-01T12:30:00.000Z',
      device_count: 1,
      devices: {
        a1: {
          attributes: {},
          id: 'a1',
          image: { size: 123 },
          status: 'installing'
        }
      },
      filter: undefined,
      group: undefined,
      statistics: {
        status: {
          downloading: 0,
          decommissioned: 0,
          failure: 0,
          installing: 1,
          noartifact: 0,
          pending: 0,
          rebooting: 0,
          success: 0,
          'already-installed': 0
        },
        total_size: 1234
      }
    },
    d2: {
      id: 'd2',
      name: 'test deployment 2',
      artifact_name: 'r1',
      artifacts: ['123'],
      created: '2019-01-01T12:25:00.000Z',
      device_count: 1,
      devices: {
        b1: {
          attributes: {},
          id: 'b1',
          status: 'pending'
        }
      },
      filter: undefined,
      group: undefined,
      statistics: {
        status: {
          downloading: 0,
          decommissioned: 0,
          failure: 0,
          installing: 0,
          noartifact: 0,
          pending: 1,
          rebooting: 0,
          success: 0,
          'already-installed': 0
        }
      }
    },
    d3: {
      id: 'd3',
      name: 'Test',
      phases: [
        { id: '0', batch_size: 2, device_count: 2 },
        { id: '1', start_ts: '2019-02-04T11:45:10.002Z', batch_size: 3, device_count: 3 },
        { id: '2', start_ts: '2019-02-05T11:45:10.002Z', batch_size: 5, device_count: 5 },
        { id: '3', start_ts: '2019-02-06T11:45:10.002Z', batch_size: 5, device_count: 5 },
        { id: '4', start_ts: '2019-02-21T11:45:10.002Z', batch_size: 5, device_count: 0 }
      ],
      max_devices: 0,
      created: '2019-01-31T12:59:30.020Z',
      devices: {},
      filter: undefined,
      group: undefined,
      stats: {
        pending: 3,
        decommissioned: 0,
        failure: 23,
        pause_before_committing: 0,
        pause_before_rebooting: 0,
        installing: 0,
        rebooting: 0,
        'already-installed': 0,
        pause_before_installing: 0,
        downloading: 0,
        success: 6,
        aborted: 0,
        noartifact: 0
      },
      statistics: { total_size: '1234' },
      status: 'inprogress',
      active: true,
      device_count: 100,
      retries: '0',
      type: 'software'
    }
  },
  byStatus: {
    finished: { deploymentIds: ['d1'], total: 1 },
    inprogress: { deploymentIds: ['d3'], total: 1 },
    pending: { deploymentIds: ['d2'], total: 1 },
    scheduled: { deploymentIds: ['d2'], total: 1 }
  },
  deploymentDeviceLimit: 500,
  selectedDeviceIds: [],
  selectionState: {
    finished: {
      ...initialState.selectionState.finished,
      selection: ['d1'],
      endDate: undefined,
      search: '',
      total: 1,
      type: ''
    },
    inprogress: { ...initialState.selectionState.inprogress, selection: ['d1'], total: 1 },
    pending: { ...initialState.selectionState.pending, selection: ['d2'], total: 1 },
    scheduled: { ...initialState.selectionState.scheduled, selection: ['d2'], total: 1 },
    general: {
      state: 'active',
      showCreationDialog: false,
      showReportDialog: false,
      reportType: null
    },
    selectedId: 'd1'
  }
};
