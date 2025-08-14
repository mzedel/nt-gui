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
import { uiPermissionsById } from '../constants';

export type UiPermission = {
  explanations: object;
  permissionLevel: number;
  permissionSets: Record<string, string>;
  title: string;
  value: string;
  verbs: string[];
};

type ExcessiveAccessConfig = {
  selector: string;
  warning: string;
};

type EndpointDefinition = {
  path: RegExp;
  types: string[];
  uiPermissions: UiPermission[];
};

/**
 * _uiPermissions_ represent the possible permissions/ rights that can be given for the area
 * _endpoints_ represent the possible endpoints this definition might be affecting in the UI and what
 *              functionality might be affected
 *
 */
export type PermissionsArea = {
  endpoints: EndpointDefinition[];
  excessiveAccessConfig?: ExcessiveAccessConfig;
  explanation: string;
  filter?: (object) => string[];
  key: string;
  placeholder?: string;
  scope?: string;
  title: string;
  uiPermissions: UiPermission[];
};

export const itemUiPermissionsReducer = (accu, { item, uiPermissions }) => (item ? { ...accu, [item]: uiPermissions } : accu);

const checkSinglePermission = (permission, requiredPermission) =>
  requiredPermission === permission || uiPermissionsById[permission].permissionLevel > uiPermissionsById[requiredPermission].permissionLevel;

export const checkPermissionsObject = (permissions, requiredPermission, scopedAccess, superAccess) =>
  permissions[superAccess]?.some(permission => checkSinglePermission(permission, requiredPermission)) ||
  permissions[scopedAccess]?.some(permission => checkSinglePermission(permission, requiredPermission));

export const USER_LOGOUT = 'USER_LOGOUT';

export const OWN_USER_ID = 'me';

export const settingsKeys = { initialized: 'settings-initialized' };

export const READ_STATES = {
  read: 'read',
  seen: 'seen',
  unread: 'unread'
} as const;
export type ReadState = keyof typeof READ_STATES;
