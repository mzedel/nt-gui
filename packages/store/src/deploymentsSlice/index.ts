// Copyright 2023 Northern.tech AS
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
import type {
  DeploymentDeployments as BackendDeployment,
  DeviceDeployments as BackendDeviceDeployment,
  Filter as BackendFilter,
  DeviceWithImage,
  FilterPredicate,
  Limit
} from '@northern.tech/types/MenderTypes';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { DEVICE_LIST_DEFAULTS, limitDefault } from '../constants';
import { DEFAULT_PENDING_INPROGRESS_COUNT, DEPLOYMENT_ROUTES, DEPLOYMENT_STATES, deploymentPrototype } from './constants';

export const sliceName = 'deployments';

type Filter = {
  key: string;
  operator: FilterPredicate.type;
  scope: string;
  value: any;
};
export type DeviceDeployment = BackendDeviceDeployment & {
  deviceId: string;
  release: string;
  route: string;
};

export type Deployment = BackendDeployment & {
  devices: Record<string, DeviceWithImage>;
  filter?: BackendFilter & { filters: Filter[]; name?: string };
  group?: string;
  totalDeviceCount: number;
};

export type DeploymentStatus = { deploymentIds: string[]; total: number };
export type DeploymentByStatus = {
  finished: DeploymentStatus;
  inprogress: DeploymentStatus;
  pending: DeploymentStatus;
  scheduled: DeploymentStatus;
};
export type DeploymentByStatusKey = keyof DeploymentByStatus;
export type DeploymentConfig = {
  binaryDelta: {
    compressionLevel: number;
    disableChecksum: boolean;
    disableDecompression: boolean;
    duplicatesWindow: number;
    inputWindow: number;
    instructionBuffer: number;
    sourceWindow: number;
    timeout: number;
  };
  binaryDeltaLimits: {
    duplicatesWindow: Limit;
    inputWindow: Limit;
    instructionBuffer: Limit;
    sourceWindow: Limit;
    timeout: Limit;
  };
};

export type SelectionListState = {
  endDate?: string;
  page?: number;
  perPage?: number;
  search?: string;
  selection: string[];
  startDate?: string;
  total?: number;
  type?: string;
};
export type SelectionState = {
  finished: SelectionListState;
  general: {
    reportType: string | null;
    showCreationDialog: boolean;
    showReportDialog: boolean;
    state: string;
  };
  inprogress: SelectionListState;
  pending: SelectionListState;
  scheduled: SelectionListState;

  selectedId?: string;
};
type DeploymentsSliceType = {
  byId: Record<string, Deployment>;
  byStatus: DeploymentByStatus;
  config: DeploymentConfig;
  deploymentDeviceLimit: number;
  selectedDeviceIds: string[];
  selectionState: SelectionState;
};

export const initialState: DeploymentsSliceType = {
  byId: {
    // [id]: { statistics: { status: {}, total_size }, devices: { [deploymentId]: { id, log } }, totalDeviceCount }
  },
  byStatus: {
    finished: { deploymentIds: [], total: 0 },
    inprogress: { deploymentIds: [], total: 0 },
    pending: { deploymentIds: [], total: 0 },
    scheduled: { deploymentIds: [], total: 0 }
  },
  config: {
    binaryDelta: {
      timeout: -1,
      duplicatesWindow: -1,
      compressionLevel: -1,
      disableChecksum: false,
      disableDecompression: false,
      inputWindow: -1,
      instructionBuffer: -1,
      sourceWindow: -1
    },
    binaryDeltaLimits: {
      timeout: { ...limitDefault, default: 60, max: 3600, min: 60 },
      sourceWindow: limitDefault,
      inputWindow: limitDefault,
      duplicatesWindow: limitDefault,
      instructionBuffer: limitDefault
    }
  },
  deploymentDeviceLimit: 5000,
  selectedDeviceIds: [],
  selectionState: {
    finished: { ...DEVICE_LIST_DEFAULTS, endDate: undefined, search: '', selection: [], startDate: undefined, total: 0, type: '' },
    inprogress: { ...DEVICE_LIST_DEFAULTS, perPage: DEFAULT_PENDING_INPROGRESS_COUNT, selection: [] },
    pending: { ...DEVICE_LIST_DEFAULTS, perPage: DEFAULT_PENDING_INPROGRESS_COUNT, selection: [] },
    scheduled: { ...DEVICE_LIST_DEFAULTS, selection: [] },
    general: {
      state: DEPLOYMENT_ROUTES.active.key,
      showCreationDialog: false,
      showReportDialog: false,
      reportType: null // DeploymentConstants.DEPLOYMENT_TYPES.configuration|DeploymentConstants.DEPLOYMENT_TYPES.software
    },
    selectedId: undefined
  }
};

export const deploymentsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    createdDeployment: (state, action) => {
      state.byId[action.payload.id] = {
        ...deploymentPrototype,
        ...action.payload
      };
      state.byStatus[DEPLOYMENT_STATES.pending].total = state.byStatus[DEPLOYMENT_STATES.pending].total + 1;
      state.byStatus[DEPLOYMENT_STATES.pending].deploymentIds = [...state.byStatus.pending.deploymentIds, action.payload.id];
      state.selectionState[DEPLOYMENT_STATES.pending].selection = [action.payload.id, ...state.selectionState[DEPLOYMENT_STATES.pending].selection];
      state.selectionState[DEPLOYMENT_STATES.pending].total = (state.selectionState[DEPLOYMENT_STATES.pending].total || 0) + 1;
    },
    removedDeployment: (state, action: PayloadAction<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload]: removedDeployment, ...remainder } = state.byId;
      state.byId = remainder;
    },
    receivedDeployment: (state, action: PayloadAction<Deployment>) => {
      state.byId[action.payload.id] = {
        ...(state.byId[action.payload.id] || {}),
        ...action.payload
      };
    },
    receivedDeploymentDeviceLog: (state, action: PayloadAction<{ deviceId: string; id: string; log: boolean }>) => {
      const { id, deviceId, log } = action.payload;
      const deployment = {
        ...deploymentPrototype,
        ...state.byId[id]
      };
      state.byId[id] = {
        ...deployment,
        devices: {
          ...deployment.devices,
          [deviceId]: {
            ...deployment.devices[deviceId],
            log
          }
        }
      };
    },
    receivedDeploymentDevices: (
      state,
      action: PayloadAction<{ devices: Record<string, DeviceWithImage>; id: string; selectedDeviceIds: string[]; totalDeviceCount: number }>
    ) => {
      const { id, devices, selectedDeviceIds, totalDeviceCount } = action.payload;
      state.byId[id] = {
        ...state.byId[id],
        devices,
        totalDeviceCount
      };
      state.selectedDeviceIds = selectedDeviceIds;
    },
    receivedDeployments: (state, action: PayloadAction<Record<string, Deployment>>) => {
      state.byId = {
        ...state.byId,
        ...action.payload
      };
    },
    receivedDeploymentsForStatus: (state, action: PayloadAction<{ deploymentIds: string[]; status: DeploymentByStatusKey; total: number }>) => {
      const { status, deploymentIds, total } = action.payload;
      state.byStatus[status].deploymentIds = deploymentIds;
      state.byStatus[status].total = total;
    },
    selectDeploymentsForStatus: (state, action: PayloadAction<{ deploymentIds: string[]; status: DeploymentByStatusKey; total: number }>) => {
      const { status, deploymentIds, total } = action.payload;
      state.selectionState[status].selection = deploymentIds;
      state.selectionState[status].total = total;
    },
    setDeploymentsState: (state, action: PayloadAction<SelectionState>) => {
      state.selectionState = action.payload;
    },
    setDeploymentsConfig: (state, action: PayloadAction<DeploymentConfig>) => {
      state.config = action.payload;
    }
  }
});

export const actions = deploymentsSlice.actions;
export default deploymentsSlice.reducer;
