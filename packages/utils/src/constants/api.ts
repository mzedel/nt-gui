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

export const apiRoot = '/api/management';
export const apiUrl = {
  v1: `${apiRoot}/v1`,
  v2: `${apiRoot}/v2`
} as const;

export const auditLogsApiUrl = `${apiUrl.v1}/auditlogs`;
export const deploymentsApiUrl = `${apiUrl.v1}/deployments`;
export const deploymentsApiUrlV2 = `${apiUrl.v2}/deployments`;
export const deviceAuthV2 = `${apiUrl.v2}/devauth`;
export const deviceConfig = `${apiUrl.v1}/deviceconfig/configurations/device`;
export const deviceConnect = `${apiUrl.v1}/deviceconnect`;
export const inventoryApiUrl = `${apiUrl.v1}/inventory`;
export const inventoryApiUrlV2 = `${apiUrl.v2}/inventory`;
export const iotManagerBaseURL = `${apiUrl.v1}/iot-manager`;
export const monitorApiUrlv1 = `${apiUrl.v1}/devicemonitor`;
export const reportingApiUrl = `${apiUrl.v1}/reporting`;
export const ssoIdpApiUrlv1 = `${apiUrl.v1}/useradm/sso/idp/metadata`;
export const tenantadmApiUrlv1 = `${apiUrl.v1}/tenantadm`;
export const tenantadmApiUrlv2 = `${apiUrl.v2}/tenantadm`;
export const useradmApiUrl = `${apiUrl.v1}/useradm`;
export const useradmApiUrlv1 = `${apiUrl.v1}/useradm`;
export const useradmApiUrlv2 = `${apiUrl.v2}/useradm`;

export const maxSessionAge = 900;

export const headerNames = {
  link: 'link',
  location: 'location',
  total: 'x-total-count'
} as const;
