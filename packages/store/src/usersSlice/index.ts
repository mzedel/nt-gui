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
import type { User as BackendUser, DeploymentPhase, TenantInfo, TenantsIdName } from '@northern.tech/types/MenderTypes';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { FilterOperator, PermissionSet, Role } from '../constants';
import { defaultPermissionSets, rolesById } from '../constants';
import type { ReadState } from './constants';
import { READ_STATES } from './constants';

export const sliceName = 'users';
export type User = BackendUser & TenantInfo & { tenants?: TenantsIdName };
export type UserSession = {
  expiresAt?: string;
  token: string;
};
export type CustomColumn = {
  attribute: {
    name: string;
    scope: string;
  };
  size: number;
};

type FilterOption = {
  key: string;
  operator: FilterOperator;
  scope: string;
  value: string;
};
export type GlobalSettings = {
  [x: string]: any;
  id_attribute?: {
    attribute: string;
    scope: string;
  };
  previousFilters: FilterOption[];
  previousPhases: DeploymentPhase[][];
  retries: number;
};
type Column = {
  id: string;
  key: string;
  name: string;
  scope: string;
  title: string;
};
export type UserSettings = {
  [x: string]: any;
  columnSelection: Column[];
  feedbackCollectedAt?: string;
  mode?: 'light' | 'dark';
  onboarding: Partial<{
    address: string;
    approach: 'physical' | 'virtual';
    complete: boolean;
    demoArtifactPort: number;
    deviceType: string[] | string;
    progress: string;
    showTips: null | boolean;
    showTipsDialog: boolean;
  }>;
  tooltips?: object;
  trackingConsentGiven?: boolean;
};
type UserSliceState = {
  activationCode?: string;
  byId: Record<string, User>;
  currentSession?: UserSession | object;
  currentUser: string | null;
  customColumns: CustomColumn[];
  globalSettings: GlobalSettings;
  permissionSetsById: Record<string, PermissionSet>;
  qrCode: string | null;
  rolesById: Record<string, Role>;
  rolesInitialized: boolean;
  settingsInitialized: boolean;
  showConnectDeviceDialog: boolean;
  showFeedbackDialog: boolean;
  showStartupNotification: boolean;
  tooltips: {
    byId: Record<string, { readState: ReadState }>;
  };
  userSettings: UserSettings;
  userSettingsInitialized: boolean;
};
export const initialState: UserSliceState = {
  activationCode: undefined,
  byId: {},
  currentUser: null,
  currentSession: {
    // { token: window.localStorage.getItem('JWT'), expiresAt: '2023-01-01T00:15:00.000Z' | undefined }, // expiresAt depending on the stay logged in setting
  },
  customColumns: [],
  qrCode: null,
  globalSettings: {
    id_attribute: undefined,
    previousFilters: [],
    previousPhases: [],
    retries: 0
  },
  permissionSetsById: {
    ...defaultPermissionSets
  },
  rolesById: {
    ...rolesById
  },
  rolesInitialized: false,
  settingsInitialized: false,
  showConnectDeviceDialog: false,
  showFeedbackDialog: false,
  showStartupNotification: false,
  tooltips: {
    byId: {
      // <id>: { readState: <read|unread> } // this object is getting enhanced by the tooltip texts in the app constants
    }
  },
  userSettings: {
    columnSelection: [],
    onboarding: {}
  },
  userSettingsInitialized: false
};

export const usersSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    receivedQrCode: (state, action: PayloadAction<string | null>) => {
      state.qrCode = action.payload;
    },
    successfullyLoggedIn: (state, action: PayloadAction<UserSession>) => {
      state.currentSession = action.payload;
    },
    receivedUserList: (state, action: PayloadAction<Record<string, User>>) => {
      state.byId = action.payload;
    },
    receivedActivationCode: (state, action: PayloadAction<string>) => {
      state.activationCode = action.payload;
    },
    receivedUser: (state, action: PayloadAction<User>) => {
      state.byId[action.payload.id] = action.payload;
      state.currentUser = action.payload.id;
    },
    removedUser: (state, action: PayloadAction<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload]: removedUser, ...byId } = state.byId;
      state.byId = byId;
      state.currentUser = state.currentUser === action.payload ? null : state.currentUser;
    },
    updatedUser: (state, action: PayloadAction<Partial<User> & { id: string }>) => {
      state.byId[action.payload.id] = {
        ...state.byId[action.payload.id],
        ...action.payload
      };
    },
    receivedPermissionSets: (state, action: PayloadAction<Record<string, PermissionSet>>) => {
      state.permissionSetsById = action.payload;
    },
    receivedRoles: (state, action: PayloadAction<Record<string, Role>>) => {
      state.rolesById = action.payload;
      state.rolesInitialized = true;
    },
    finishedRoleInitialization: (state, action) => {
      state.rolesInitialized = action.payload;
    },
    createdRole: (state, action: PayloadAction<Role>) => {
      state.rolesById[action.payload.name] = {
        ...state.rolesById[action.payload.name],
        ...action.payload
      };
    },
    removedRole: (state, action: PayloadAction<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload]: toBeRemoved, ...rolesById } = state.rolesById;
      state.rolesById = rolesById;
    },
    setCustomColumns: (state, action: PayloadAction<CustomColumn[]>) => {
      state.customColumns = action.payload;
    },
    setGlobalSettings: (state, action: PayloadAction<GlobalSettings>) => {
      state.settingsInitialized = true;
      state.globalSettings = {
        ...state.globalSettings,
        ...action.payload
      };
    },
    setUserSettings: (state, action: PayloadAction<UserSettings>) => {
      state.userSettingsInitialized = true;
      state.userSettings = {
        ...state.userSettings,
        ...action.payload
      };
    },
    setTooltipState: (state, action: PayloadAction<{ id: string; readState: ReadState }>) => {
      const { id, readState = READ_STATES.read } = action.payload;
      state.tooltips.byId[id] = { ...state.tooltips.byId[id], readState };
    },
    setTooltipsState: (state, action: PayloadAction<UserSliceState['tooltips']['byId']>) => {
      state.tooltips.byId = {
        ...state.tooltips.byId,
        ...action.payload
      };
    },
    setShowFeedbackDialog: (state, action: PayloadAction<boolean>) => {
      state.showFeedbackDialog = action.payload;
    },
    setShowConnectingDialog: (state, action: PayloadAction<boolean>) => {
      state.showConnectDeviceDialog = action.payload;
    },
    setShowStartupNotification: (state, action: PayloadAction<boolean>) => {
      state.showStartupNotification = action.payload;
    }
  }
});

export const actions = usersSlice.actions;
export default usersSlice.reducer;
