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
import type { Alert } from '@northern.tech/types/MenderTypes';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { DeviceIssueOptionKey } from '../constants';
import { DEVICE_ISSUE_OPTIONS, DEVICE_LIST_DEFAULTS, alertChannels } from '../constants';
import type { AlertChannelKey } from './constants';

export const sliceName = 'monitor';
type IssueCounts = Record<DeviceIssueOptionKey, { filtered: number; total: number }>;
type ChannelSettings = Record<AlertChannelKey, { enabled: boolean }>;
type SanitizedAlert = Alert & { fullName?: string };

type MonitorSliceType = {
  alerts: {
    alertList: {
      page: number;
      perPage: number;
      total: number;
    };
    byDeviceId: { alerts?: Record<string, SanitizedAlert>; latest?: Record<string, SanitizedAlert> };
  };
  issueCounts: { byType: IssueCounts };
  settings: {
    global: {
      channels: ChannelSettings;
    };
  };
};
export const initialState: MonitorSliceType = {
  alerts: {
    alertList: { ...DEVICE_LIST_DEFAULTS, total: 0 },
    byDeviceId: {}
  },
  issueCounts: {
    byType: Object.keys(DEVICE_ISSUE_OPTIONS).reduce<IssueCounts>((accu, key) => ({ ...accu, [key]: { filtered: 0, total: 0 } }), {} as IssueCounts)
  },
  settings: {
    global: {
      channels: {
        ...Object.keys(alertChannels).reduce((accu, item) => ({ ...accu, [item]: { enabled: true } }), {} as ChannelSettings)
      }
    }
  }
};

export const monitorSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    changeAlertChannel: (state, action: PayloadAction<{ channel: AlertChannelKey; enabled: boolean }>) => {
      const { channel, enabled } = action.payload;
      state.settings.global.channels[channel] = { enabled };
    },
    receiveDeviceAlerts: (state, action: PayloadAction<{ alerts: SanitizedAlert[]; deviceId: string }>) => {
      const { deviceId, alerts } = action.payload;
      state.alerts.byDeviceId[deviceId] = { alerts };
    },
    receiveLatestDeviceAlerts: (state, action: PayloadAction<{ alerts: SanitizedAlert[]; deviceId: string }>) => {
      const { deviceId, alerts } = action.payload;
      state.alerts.byDeviceId[deviceId] = { ...state.alerts.byDeviceId[deviceId], latest: alerts };
    },
    receiveDeviceIssueCounts: (state, action: PayloadAction<{ counts: { filtered: number; total: number }; issueType: DeviceIssueOptionKey }>) => {
      const { issueType, counts } = action.payload;
      state.issueCounts.byType[issueType] = counts;
    },
    setAlertListState: (state, action) => {
      state.alerts.alertList = { ...state.alerts.alertList, ...action.payload };
    }
  }
});

export const actions = monitorSlice.actions;
export default monitorSlice.reducer;
