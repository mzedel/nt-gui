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
  DeviceDeviceauth as BackendDeviceAuth,
  DeviceStateDeviceconnect as BackendDeviceState,
  DeviceConfiguration,
  DeviceState,
  MonitorConfiguration,
  SortCriteria
} from '@northern.tech/types/MenderTypes';
// @ts-nocheck
import { deepCompare, duplicateFilter } from '@northern.tech/utils/helpers';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { ALL_DEVICE_STATES, DeviceIssueOptionKey, FilterOperator, SortOptions } from '../constants';
import { DEVICE_LIST_DEFAULTS, DEVICE_STATES, SORTING_OPTIONS } from '../constants';
import type { DeviceDeployment } from '../deploymentsSlice';
import type { DeviceAuthState } from './constants';

export const sliceName = 'devices';
export type DeviceSelectedAttribute = { attribute: string; scope: string };
export type DeviceListState = {
  detailsTab: string;
  deviceIds: string[];
  isLoading: boolean;
  open?: boolean;
  page: number;
  perPage: number;
  refreshTrigger: boolean;
  selectedAttributes: DeviceSelectedAttribute[];
  selectedId?: string;
  selectedIssues: DeviceIssueOptionKey[];
  selection: number[];
  setOnly?: boolean;
  sort: SortOptions & Partial<SortCriteria>;
  state?: DeviceAuthState | typeof ALL_DEVICE_STATES;
  total: number;
};
type DeviceReport = {
  items: { count: number; key: string }[];
  otherCount: number;
  total: number;
};
export type DeviceGroup = { deviceIds?: string[]; filters?: DeviceFilter[]; id?: string; total?: number };
export type InventoryAttributes = {
  [key: string]: string | string[];
  artifact_name: string;
  device_type: string[];
};

// based on the api docs the Record values might be even: "Supported types: number, string, array of numbers, array of strings" - but I guess "string" or "string | sting[]" should be good enough
type UiDeviceAttributes = {
  attributes: InventoryAttributes;
  identity?: Record<string, string>;
  monitor?: Record<string, string>;
  system: Record<string, string>;
  tags?: Record<string, string>;
};

export type Device = BackendDeviceAuth &
  UiDeviceAttributes & {
    check_in_time_exact?: string;
    check_in_time_rounded?: string;
    config?: DeviceConfiguration;
    connect_status?: BackendDeviceState['status'];
    connect_updated_ts?: string;
    deploymentsCount?: number;
    deviceDeployments?: DeviceDeployment;
    etag?: string;
    gatewayIds?: string[];
    group?: string;
    id: string;
    isNew?: boolean;
    isOffline?: boolean;
    monitors?: MonitorConfiguration[];
    status: BackendDeviceAuth.status;
    twinsByIntegration?: Record<string, DeviceState & { twinError?: string }>;
  };
export type DeviceFilter = {
  key: string;
  operator: FilterOperator;
  scope: string;
  value: string | string[];
};
type FilteringAttributes = {
  identityAttributes: string[];
  inventoryAttributes: string[];
  systemAttributes: string[];
  tagAttributes: string[];
};
type FilteringAttributesConfig = {
  attributes: Record<string, string[]>;
  count: number;
  limit: number;
};
export type DeviceStatus = DeviceAuthState | 'active' | 'inactive';

export type DeviceGroups = {
  byId: Record<string, DeviceGroup>;
  selectedGroup?: string;
};
export type DeviceSliceType = {
  byId: Record<string, Device>;
  byStatus: Record<DeviceStatus, { deviceIds: string[]; total: number }>;
  deviceList: DeviceListState;
  filteringAttributes: FilteringAttributes;
  filteringAttributesConfig: FilteringAttributesConfig;
  filteringAttributesLimit: number;
  filters: DeviceFilter[];
  groups: DeviceGroups;
  limit: number;
  reports: DeviceReport[];
  total: number;
};
export const initialState: DeviceSliceType = {
  byId: {
    // [deviceId]: {
    //   ...,
    //   twinsByIntegration: { [external.provider.id]: twinData }
    // }
  },
  byStatus: {
    [DEVICE_STATES.accepted]: { deviceIds: [], total: 0 },
    active: { deviceIds: [], total: 0 },
    inactive: { deviceIds: [], total: 0 },
    [DEVICE_STATES.pending]: { deviceIds: [], total: 0 },
    [DEVICE_STATES.preauth]: { deviceIds: [], total: 0 },
    [DEVICE_STATES.rejected]: { deviceIds: [], total: 0 }
  },
  deviceList: {
    deviceIds: [],
    ...DEVICE_LIST_DEFAULTS,
    selectedAttributes: [],
    selectedIssues: [],
    selection: [],
    sort: {
      direction: SORTING_OPTIONS.desc
      // key: null,
      // scope: null
    },
    state: DEVICE_STATES.accepted,
    total: 0,
    refreshTrigger: false,
    isLoading: false,
    detailsTab: '',
    open: false
  },
  filters: [
    // { key: 'device_type', value: 'raspberry', operator: '$eq', scope: 'inventory' }
  ],
  filteringAttributes: { identityAttributes: [], inventoryAttributes: [], systemAttributes: [], tagAttributes: [] },
  filteringAttributesLimit: 10,
  filteringAttributesConfig: {
    attributes: {
      // inventory: ['some_attribute']
    },
    count: 0,
    limit: 100
  },
  reports: [
    // { items: [{ key: "someKey", count: 42  }], otherCount: 123, total: <otherCount + itemsCount> }
  ],
  total: 0,
  limit: 0,
  groups: {
    byId: {
      // groupName: { deviceIds: [], total: 0, filters: [] },
      // dynamo: { deviceIds: [], total: 3, filters: [{ a: 1 }] }
    },
    selectedGroup: undefined
  }
};

export const devicesSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    receivedGroups: (state, action: PayloadAction<Record<string, DeviceGroup>>) => {
      state.groups.byId = action.payload;
    },
    addToGroup: (state, action: PayloadAction<{ deviceIds: string[]; group: string }>) => {
      const { group, deviceIds } = action.payload;
      const maybeExistingGroup = {
        filters: [],
        deviceIds: [],
        ...state.groups.byId[group]
      };
      state.groups.byId[group] = {
        ...maybeExistingGroup,
        deviceIds: [...maybeExistingGroup.deviceIds, ...deviceIds].filter(duplicateFilter),
        total: (maybeExistingGroup.total || 0) + 1
      };
    },
    removeFromGroup: (state, action: PayloadAction<{ deviceIds: string[]; group: string }>) => {
      const { group, deviceIds: removedIds } = action.payload;
      const { deviceIds = [], total = 0, ...maybeExistingGroup } = state.groups.byId[group] || {};
      const changedGroup = {
        ...maybeExistingGroup,
        deviceIds: deviceIds.filter(id => !removedIds.includes(id)),
        total: Math.max(total - removedIds.length, 0)
      };
      if (changedGroup.total || changedGroup.deviceIds.length) {
        state.groups.byId[group] = changedGroup;
        return;
      } else if (state.groups.selectedGroup === group) {
        state.groups.selectedGroup = undefined;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [group]: removal, ...remainingById } = state.groups.byId;
      state.groups.byId = remainingById;
    },
    addGroup: (state, action: PayloadAction<{ group: DeviceGroup; groupName: string }>) => {
      const { groupName, group } = action.payload;
      state.groups.byId[groupName] = {
        ...state.groups.byId[groupName],
        ...group
      };
    },
    selectGroup: (state, { payload: group }: PayloadAction<string | undefined>) => {
      state.deviceList.deviceIds =
        group && state.groups.byId[group] && state.groups.byId[group].deviceIds && state.groups.byId[group].deviceIds.length > 0
          ? state.groups.byId[group].deviceIds
          : [];
      state.groups.selectedGroup = group;
    },
    removeGroup: (state, action: PayloadAction<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload]: removal, ...remainingById } = state.groups.byId;
      state.groups.byId = remainingById;
      state.groups.selectedGroup = state.groups.selectedGroup === action.payload ? undefined : state.groups.selectedGroup;
    },
    setDeviceListState: (state, action: PayloadAction<Partial<DeviceListState>>) => {
      state.deviceList = {
        ...state.deviceList,
        ...action.payload,
        sort: {
          ...state.deviceList.sort,
          ...action.payload.sort
        }
      };
    },
    setFilterAttributes: (state, action: PayloadAction<FilteringAttributes>) => {
      state.filteringAttributes = action.payload;
    },
    setFilterablesConfig: (state, action: PayloadAction<FilteringAttributesConfig>) => {
      state.filteringAttributesConfig = action.payload;
    },
    receivedDevices: (state, action: PayloadAction<Record<string, Device>>) => {
      state.byId = {
        ...state.byId,
        ...action.payload
      };
    },
    setDeviceFilters: (state, action: PayloadAction<DeviceFilter[]>) => {
      if (deepCompare(action.payload, state.filters)) {
        return;
      }
      state.filters = action.payload.filter(filter => filter.key && filter.operator && filter.scope && typeof filter.value !== 'undefined');
    },
    setInactiveDevices: (state, action: PayloadAction<{ activeDeviceTotal: number; inactiveDeviceTotal: number }>) => {
      const { activeDeviceTotal, inactiveDeviceTotal } = action.payload;
      state.byStatus.active.total = activeDeviceTotal;
      state.byStatus.inactive.total = inactiveDeviceTotal;
    },
    setDeviceReports: (state, action: PayloadAction<DeviceReport[]>) => {
      state.reports = action.payload;
    },
    setDevicesByStatus: (state, action: PayloadAction<{ deviceIds: string[]; forceUpdate?: boolean; status: DeviceStatus; total: number }>) => {
      const { forceUpdate, status, total, deviceIds } = action.payload;
      state.byStatus[status] = total || forceUpdate ? { deviceIds, total } : state.byStatus[status];
    },
    setDevicesCountByStatus: (state, action: PayloadAction<{ count: number; status: DeviceStatus }>) => {
      const { count, status } = action.payload;
      state.byStatus[status].total = count;
    },
    setDeviceLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    receivedDevice: (state, action: PayloadAction<{ id: string } & Partial<Device>>) => {
      state.byId[action.payload.id] = {
        ...state.byId[action.payload.id],
        ...action.payload
      };
    },
    maybeUpdateDevicesByStatus: (state, action: PayloadAction<{ authId?: string; deviceId: string }>) => {
      const { deviceId, authId } = action.payload;
      const device = state.byId[deviceId];
      const hasMultipleAuthSets = authId && device.auth_sets ? device.auth_sets.filter(authset => authset.id !== authId).length > 0 : false;
      if (!hasMultipleAuthSets && (Object.values(DEVICE_STATES) as string[]).includes(device.status)) {
        const deviceIds = state.byStatus[device.status].deviceIds.filter(id => id !== deviceId);
        state.byStatus[device.status] = { deviceIds, total: Math.max(0, state.byStatus[device.status].total - 1) };
      }
    }
  }
});

export const actions = devicesSlice.actions;
export default devicesSlice.reducer;
