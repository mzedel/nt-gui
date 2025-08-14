// Copyright 2024 Northern.tech AS
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
  AuditLog as AuditLogEvent,
  Tenant as BackendTenant,
  TenantTenantadm as BackendTenantAdminTenant,
  BillingProfile,
  Event,
  Integration,
  Product,
  SAMLMetadata
} from '@northern.tech/types/MenderTypes';

import type { AvailableAddon, SortOptions } from '../constants';
import type { SSO_TYPES } from './constants';

export interface Card {
  brand?: string;
  expiration: {
    month?: number;
    year?: number;
  };
  last4?: string;
}

export interface AuditLogSelectionState {
  detail?: string;
  endDate?: string;
  isLoading?: boolean;
  page: number;
  perPage: number;
  selectedId?: string;
  selectedIssue?: string;
  sort: SortOptions;
  startDate?: string;
  total: number;
  type?: {
    queryParameter: string;
    title: string;
    value: string;
  };
  user?: { id: string };
}

interface AuditLog {
  events: Array<AuditLogEvent>;
  selectionState: AuditLogSelectionState;
}

export interface Webhook {
  events: Event[];
  eventsTotal: number;
}
export type Tenant = BackendTenant &
  BackendTenantAdminTenant & {
    addons: Addon[];
  };

export interface TenantList {
  page: number;
  perPage: number;
  selectedTenant: BackendTenantAdminTenant | null;
  sort: SortOptions;
  tenants: BackendTenantAdminTenant[];
  total: number;
}

export type SSOConfig = SAMLMetadata & {
  config: string;
  type: [keyof typeof SSO_TYPES];
};

export interface OrganizationState {
  auditlog: AuditLog;
  card: Card;
  externalDeviceIntegrations: Integration[];
  intentId: string | null;
  organization: Partial<Organization>;
  ssoConfigs: SSOConfig[];
  tenantList: TenantList;
  webhooks: Webhook;
}

export interface Addon {
  enabled: boolean;
  name: AvailableAddon;
}

interface SubscriptionLine {
  amount: number;
  currency: string;
  description: string;
  price_id: string;
  quantity: number;
}
export interface Subscription {
  currency: string;
  id: string;
  lines: SubscriptionLine[];
  period_end: string;
  period_start: string;
  plan: string;
  products: Product[];
  status: string;
  total: number;
}

export interface Organization extends Tenant {
  addons: Addon[];
  billing_profile: BillingProfile;
  subscription: Subscription;
}
