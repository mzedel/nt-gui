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
//@ts-nocheck
import {
  ALL_DEVICES,
  ALL_DEVICE_STATES,
  ALL_RELEASES,
  APPLICATION_JSON_CONTENT_TYPE,
  APPLICATION_JWT_CONTENT_TYPE,
  ATTRIBUTE_SCOPES,
  DEVICE_FILTERING_OPTIONS,
  DEVICE_ISSUE_OPTIONS,
  DEVICE_LIST_DEFAULTS,
  DEVICE_STATES,
  PermissionTypes,
  SORTING_OPTIONS,
  alertChannels,
  apiRoot,
  apiUrl,
  auditLogsApiUrl,
  defaultPermissionSets,
  deploymentsApiUrl,
  deploymentsApiUrlV2,
  deviceAuthV2,
  deviceConfig,
  deviceConnect,
  emptyRole,
  emptyUiPermissions,
  headerNames,
  inventoryApiUrl,
  inventoryApiUrlV2,
  iotManagerBaseURL,
  limitDefault,
  maxSessionAge,
  monitorApiUrlv1,
  reportingApiUrl,
  rolesById,
  rolesByName,
  scopedPermissionAreas,
  serviceProviderRolesById,
  ssoIdpApiUrlv1,
  tenantadmApiUrlv1,
  tenantadmApiUrlv2,
  twoFAStates,
  uiPermissionsByArea,
  uiPermissionsById,
  useradmApiUrl,
  useradmApiUrlv1,
  useradmApiUrlv2
} from '@northern.tech/utils/constants';
import type {
  AnyPermission,
  AuditLogPermission,
  DeploymentPermission,
  DeviceIssueOptionKey,
  GroupsPermission,
  PermissionObject,
  PermissionSet,
  PermissionSetId,
  ReleasesPermission,
  Role,
  ScopedPermissionsByAreaKey,
  SortOptions,
  UiPermissionsByAreaKey,
  UiPermissionsByIdKey,
  UiPermissionsDefinition,
  UserManagementPermission
} from '@northern.tech/utils/constants';

export {
  alertChannels,
  ALL_DEVICE_STATES,
  ALL_DEVICES,
  ALL_RELEASES,
  APPLICATION_JSON_CONTENT_TYPE,
  APPLICATION_JWT_CONTENT_TYPE,
  ATTRIBUTE_SCOPES,
  apiRoot,
  apiUrl,
  auditLogsApiUrl,
  defaultPermissionSets,
  deploymentsApiUrl,
  deploymentsApiUrlV2,
  DEVICE_FILTERING_OPTIONS,
  DEVICE_ISSUE_OPTIONS,
  DEVICE_LIST_DEFAULTS,
  DEVICE_STATES,
  deviceAuthV2,
  deviceConfig,
  deviceConnect,
  emptyRole,
  emptyUiPermissions,
  headerNames,
  inventoryApiUrl,
  inventoryApiUrlV2,
  iotManagerBaseURL,
  monitorApiUrlv1,
  limitDefault,
  maxSessionAge,
  PermissionTypes,
  reportingApiUrl,
  rolesById,
  rolesByName,
  scopedPermissionAreas,
  serviceProviderRolesById,
  SORTING_OPTIONS,
  ssoIdpApiUrlv1,
  tenantadmApiUrlv1,
  tenantadmApiUrlv2,
  twoFAStates,
  uiPermissionsByArea,
  uiPermissionsById,
  useradmApiUrl,
  useradmApiUrlv1,
  useradmApiUrlv2
};

export type {
  AnyPermission,
  AuditLogPermission,
  DeploymentPermission,
  DeviceIssueOptionKey,
  GroupsPermission,
  PermissionObject,
  PermissionSet,
  PermissionSetId,
  ReleasesPermission,
  Role,
  ScopedPermissionsByAreaKey,
  SortOptions,
  UiPermissionsByAreaKey,
  UiPermissionsByIdKey,
  UiPermissionsDefinition,
  UserManagementPermission
};

export * from './appSlice/constants';
export * from './commonConstants';
export * from './deploymentsSlice/constants';
export * from './devicesSlice/constants';
export * from './monitorSlice/constants';
export * from './onboardingSlice/constants';
export * from './organizationSlice/constants';
export * from './releasesSlice/constants';
export * from './usersSlice/constants';
