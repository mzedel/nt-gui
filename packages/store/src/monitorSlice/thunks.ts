// Copyright 2021 Northern.tech AS
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
import type { DeviceFilter } from '@/src/devicesSlice';
import type { Alert } from '@northern.tech/types/MenderTypes';

import { actions, sliceName } from '.';
import storeActions from '../actions';
import Api from '../api/general-api';
import type { AlertChannelKey, DeviceIssueOptionKey } from '../constants';
import { DEVICE_LIST_DEFAULTS, TIMEOUTS, alertChannels, headerNames, monitorApiUrlv1 } from '../constants';
import { getDeviceFilters, getSearchEndpoint } from '../selectors';
import type { AppDispatch } from '../store';
import { commonErrorFallback, commonErrorHandler, createAppAsyncThunk } from '../store';
import { convertDeviceListStateToFilters } from '../utils';

const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

const cutoffLength = 75;
const ellipsis = '...';
const longTextTrimmer = (text: string): string =>
  text.length >= cutoffLength + ellipsis.length ? `${text.substring(0, cutoffLength + ellipsis.length)}${ellipsis}` : text;

const sanitizeDeviceAlerts = (alerts: Alert[]) => alerts.map(alert => ({ ...alert, fullName: alert.name, name: longTextTrimmer(alert.name || '') }));

interface GetDeviceAlertsPayload {
  config?: { issuedAfter?: string; issuedBefore?: string; page?: number; perPage?: number; sortAscending?: boolean };
  id: string;
}
export const getDeviceAlerts = createAppAsyncThunk(`${sliceName}/getDeviceAlerts`, ({ id, config = {} }: GetDeviceAlertsPayload, { dispatch }) => {
  const { page = defaultPage, perPage = defaultPerPage, issuedBefore, issuedAfter, sortAscending = false } = config;
  const issued_after = issuedAfter ? `&issued_after=${issuedAfter}` : '';
  const issued_before = issuedBefore ? `&issued_before=${issuedBefore}` : '';
  return Api.get<Alert[]>(
    `${monitorApiUrlv1}/devices/${id}/alerts?page=${page}&per_page=${perPage}${issued_after}${issued_before}&sort_ascending=${sortAscending}`
  )
    .catch(err => commonErrorHandler(err, `Retrieving device alerts for device ${id} failed:`, dispatch))
    .then(res =>
      Promise.all([
        dispatch(actions.receiveDeviceAlerts({ deviceId: id, alerts: sanitizeDeviceAlerts(res.data) })),
        dispatch(actions.setAlertListState({ total: Number(res.headers[headerNames.total]) }))
      ])
    );
});

interface GetLatestDeviceAlertsPayload {
  config?: { page?: number; perPage?: number };
  id: string;
}
export const getLatestDeviceAlerts = createAppAsyncThunk(
  `${sliceName}/getLatestDeviceAlerts`,
  ({ id, config = {} }: GetLatestDeviceAlertsPayload, { dispatch }) => {
    const { page = defaultPage, perPage = 10 } = config;
    return Api.get<Alert[]>(`${monitorApiUrlv1}/devices/${id}/alerts/latest?page=${page}&per_page=${perPage}`)
      .catch(err => commonErrorHandler(err, `Retrieving device alerts for device ${id} failed:`, dispatch))
      .then(res => Promise.resolve(dispatch(actions.receiveLatestDeviceAlerts({ deviceId: id, alerts: sanitizeDeviceAlerts(res.data) }))));
  }
);

interface GetIssueCountsByTypePayload {
  options?: Partial<{ filters: DeviceFilter[]; group: string; status: string; type: string }>;
  type: DeviceIssueOptionKey;
}
export const getIssueCountsByType = createAppAsyncThunk(
  `${sliceName}/getIssueCountsByType`,
  ({ type, options = {} }: GetIssueCountsByTypePayload, { dispatch, getState }) => {
    const state = getState();
    const { filters = getDeviceFilters(state), group, status, ...remainder } = options;
    const { applicableFilters: nonMonitorFilters, filterTerms } = convertDeviceListStateToFilters({
      ...remainder,
      filters,
      group,
      offlineThreshold: state.app.offlineThreshold,
      selectedIssues: [type],
      status
    });
    return Api.post(getSearchEndpoint(getState()), {
      page: 1,
      per_page: 1,
      filters: filterTerms,
      attributes: [{ scope: 'identity', attribute: 'status' }]
    })
      .catch(err => commonErrorHandler(err, `Retrieving issue counts failed:`, dispatch, commonErrorFallback))
      .then(res => {
        const total = nonMonitorFilters.length ? state.monitor.issueCounts.byType[type].total : Number(res.headers[headerNames.total]);
        const filtered = nonMonitorFilters.length ? Number(res.headers[headerNames.total]) : total;
        if (total === state.monitor.issueCounts.byType[type].total && filtered === state.monitor.issueCounts.byType[type].filtered) {
          return Promise.resolve();
        }
        return Promise.resolve(dispatch(actions.receiveDeviceIssueCounts({ counts: { filtered, total }, issueType: type }))) as ReturnType<AppDispatch>;
      });
  }
);

export const getDeviceMonitorConfig = createAppAsyncThunk(`${sliceName}/getDeviceMonitorConfig`, (id: string, { dispatch }) =>
  Api.get(`${monitorApiUrlv1}/devices/${id}/config`)
    .catch(err => commonErrorHandler(err, `Retrieving device monitor config for device ${id} failed:`, dispatch))
    .then(({ data }) => Promise.all([dispatch(storeActions.receivedDevice({ id, monitors: data }), Promise.resolve(data))]))
);

interface ChangeNotificationSettingPayload {
  channel?: AlertChannelKey;
  enabled: boolean;
}
export const changeNotificationSetting = createAppAsyncThunk(
  `${sliceName}/changeNotificationSetting`,
  ({ enabled, channel = alertChannels.email as AlertChannelKey }: ChangeNotificationSettingPayload, { dispatch }) =>
    Api.put(`${monitorApiUrlv1}/settings/global/channel/alerts/${channel}/status`, { enabled })
      .catch(err => commonErrorHandler(err, `${enabled ? 'En' : 'Dis'}abling  ${channel} alerts failed:`, dispatch))
      .then(() =>
        Promise.all([
          dispatch(actions.changeAlertChannel({ channel, enabled })),
          dispatch(
            storeActions.setSnackbar({ message: `Successfully ${enabled ? 'en' : 'dis'}abled ${channel} alerts`, autoHideDuration: TIMEOUTS.fiveSeconds })
          )
        ])
      )
);
