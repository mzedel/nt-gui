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
import type { AuditLog, BillingProfile, Integration, Event as WebhookEvent } from '@northern.tech/types/MenderTypes';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { DEVICE_LIST_DEFAULTS, SORTING_OPTIONS, TENANT_LIST_DEFAULT } from '../constants';
import type { AuditLogSelectionState, Card, Organization, OrganizationState, SSOConfig, TenantList } from '../organizationSlice/types';

export const sliceName = 'organization';

export const initialState: OrganizationState = {
  card: {
    last4: '',
    expiration: { month: 1, year: 2020 },
    brand: ''
  },
  intentId: null,
  tenantList: {
    ...TENANT_LIST_DEFAULT,
    total: 0,
    tenants: [],
    selectedTenant: null,
    sort: {
      direction: SORTING_OPTIONS.desc,
      key: 'name'
    }
  },
  organization: {
    // id, name, status, tenant_token, plan
  },
  auditlog: {
    events: [],
    selectionState: {
      ...DEVICE_LIST_DEFAULTS,
      detail: undefined,
      endDate: undefined,
      selectedIssue: undefined,
      sort: { direction: SORTING_OPTIONS.desc },
      startDate: undefined,
      total: 0,
      type: undefined,
      user: undefined,
      isLoading: false
    }
  },
  externalDeviceIntegrations: [
    // { <connection_string|x509|...>, id, provider }
  ],
  ssoConfigs: [],
  webhooks: {
    // [id]: { events: [] }
    // for now:
    events: [],
    eventsTotal: 0
  }
};

export const organizationSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    receiveAuditLogs: (state, action: PayloadAction<{ events: AuditLog[]; total: number }>) => {
      const { events, total } = action.payload;
      state.auditlog.events = events;
      state.auditlog.selectionState.total = total;
    },
    setAuditLogState: (state, action: PayloadAction<Partial<AuditLogSelectionState>>) => {
      state.auditlog.selectionState = {
        ...state.auditlog.selectionState,
        ...action.payload
      };
    },
    receiveCurrentCard: (state, action: PayloadAction<Card>) => {
      state.card = action.payload;
    },
    receiveSetupIntent: (state, action: PayloadAction<string | null>) => {
      state.intentId = action.payload;
    },
    setOrganization: (state, action: PayloadAction<Partial<Organization>>) => {
      state.organization = { ...state.organization, ...action.payload };
    },
    setSubscription: (state, action) => {
      state.organization.subscription = { ...state.organization.subscription, ...action.payload };
    },
    setBillingProfile: (state, action: PayloadAction<BillingProfile>) => {
      state.organization.billing_profile = action.payload;
    },
    setTenantListState: (state, action: PayloadAction<TenantList>) => {
      state.tenantList = action.payload;
    },
    receiveExternalDeviceIntegrations: (state, action: PayloadAction<Integration[]>) => {
      state.externalDeviceIntegrations = action.payload;
    },
    receiveSsoConfigs: (state, action: PayloadAction<SSOConfig[]>) => {
      state.ssoConfigs = action.payload;
    },
    receiveWebhookEvents: (state, action: PayloadAction<{ total: number; value: WebhookEvent[] }>) => {
      const { value, total } = action.payload;
      state.webhooks.events = value;
      state.webhooks.eventsTotal = total;
    }
  }
});

export const actions = organizationSlice.actions;
export default organizationSlice.reducer;
