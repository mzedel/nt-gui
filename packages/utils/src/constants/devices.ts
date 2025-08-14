'use strict';

// Copyright 2015 Northern.tech AS
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
export const DEVICE_STATES = {
  accepted: 'accepted',
  pending: 'pending',
  preauth: 'preauthorized',
  rejected: 'rejected'
};
export const ALL_DEVICE_STATES = 'any';

export const DEVICE_FILTERING_OPTIONS = {
  $eq: { key: '$eq', title: 'equals', shortform: '=' },
  $ne: { key: '$ne', title: 'not equal', shortform: '!=' },
  $gt: {
    key: '$gt',
    title: '>',
    shortform: '>',
    help: 'The "greater than" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.'
  },
  $gte: {
    title: '>=',
    shortform: '>=',
    help: 'The "greater than or equal" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.'
  },
  $lt: {
    key: '$lt',
    title: '<',
    shortform: '<',
    help: 'The "lesser than" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.'
  },
  $lte: {
    title: '<=',
    shortform: '<=',
    help: 'The "lesser than or equal" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.'
  },
  $ltne: {
    key: '$ltne',
    title: '$ltne',
    shortform: 'ltne',
    help: 'The "lesser than or does not exist" operator can work both on numbers and strings. In the latter case, the operator applies the lexicographical order to the value strings.'
  },
  $in: {
    key: '$in',
    title: 'in',
    shortform: 'in',
    help: 'The "in" operator accepts a list of comma-separated values. It matches if the selected field is equal to one of the specified values.'
  },
  $nin: {
    key: '$nin',
    title: 'not in',
    shortform: 'not in',
    help: `The "not in" operator accepts a list of comma-separated values. It matches if the selected field's value is not equal to any of the specified options.`
  },
  $exists: {
    key: '$exists',
    title: 'exists',
    shortform: 'exists',
    value: true,
    help: `The "exists" operator matches if the selected field's value has a value. No value needs to be provided for this operator.`
  },
  $nexists: {
    key: '$nexists',
    title: `doesn't exist`,
    shortform: `doesn't exist`,
    value: true,
    help: `The "doesn't exist" operator matches if the selected field's value has no value. No value needs to be provided for this operator.`
  },
  $regex: {
    key: '$regex',
    title: `matches regular expression`,
    shortform: `matches`,
    help: `The "regular expression" operator matches the selected field's value with a Perl compatible regular expression (PCRE), automatically anchored by ^. If the regular expression is not valid, the filter will produce no results. If you need to specify options and flags, you can provide the full regex in the format of /regex/flags, for example.`
  }
} as const;

export const ATTRIBUTE_SCOPES = {
  inventory: 'inventory',
  identity: 'identity',
  monitor: 'monitor',
  system: 'system',
  tags: 'tags'
} as const;

export const ALL_DEVICES = 'All devices';

export type FilterRule = {
  key: string;
  operator: keyof typeof DEVICE_FILTERING_OPTIONS;
  scope: typeof ATTRIBUTE_SCOPES;
  value: () => string | string | boolean | number;
};

export type DeviceIssueOption = {
  filterRule: FilterRule | object;
  isCategory?: boolean;
  key: string;
  needsFullFiltering?: boolean;
  needsMonitor?: boolean;
  needsReporting?: boolean;
  title: string;
};

export const DEVICE_ISSUE_OPTIONS = {
  issues: {
    isCategory: true,
    key: 'issues',
    title: 'Devices with issues',
    filterRule: {}
  },
  offline: {
    issueCategory: 'issues',
    key: 'offline',
    needsFullFiltering: true,
    needsMonitor: false,
    needsReporting: false,
    filterRule: {
      scope: 'system',
      key: 'check_in_time',
      operator: DEVICE_FILTERING_OPTIONS.$ltne.key,
      value: ({ offlineThreshold }) => offlineThreshold
    },
    title: 'Offline devices'
  },
  failedLastUpdate: {
    issueCategory: 'issues',
    key: 'failedLastUpdate',
    needsFullFiltering: false,
    needsMonitor: false,
    needsReporting: true,
    filterRule: { scope: 'monitor', key: 'failed_last_update', operator: DEVICE_FILTERING_OPTIONS.$eq.key, value: true },
    title: 'Deployment failed'
  },
  monitoring: {
    issueCategory: 'issues',
    key: 'monitoring',
    needsFullFiltering: false,
    needsMonitor: true,
    needsReporting: false,
    filterRule: { scope: 'monitor', key: 'alerts', operator: DEVICE_FILTERING_OPTIONS.$eq.key, value: true },
    title: 'Monitoring alert'
  },
  authRequests: {
    key: 'authRequests',
    needsFullFiltering: false,
    needsMonitor: false,
    needsReporting: true,
    filterRule: { scope: 'monitor', key: 'auth_requests', operator: DEVICE_FILTERING_OPTIONS.$gt.key, value: 1 },
    title: 'Devices with new authentication requests'
  },
  gatewayDevices: {
    key: 'gatewayDevices',
    needsFullFiltering: false,
    needsMonitor: false,
    needsReporting: true,
    filterRule: { scope: 'inventory', key: 'mender_is_gateway', operator: DEVICE_FILTERING_OPTIONS.$eq.key, value: 'true' },
    title: 'Gateway devices'
  }
} as const;
export type DeviceIssueOptionKey = keyof typeof DEVICE_ISSUE_OPTIONS;
