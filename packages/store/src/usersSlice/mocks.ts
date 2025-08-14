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
import { emptyRole, emptyUiPermissions, rolesById, rolesByName, twoFAStates, uiPermissionsById } from '../constants';
import { initialState } from './index';

const userId = 'a30a780b-b843-5344-80e3-0fd95a4f6fc3';

export const mockState = {
  ...initialState,
  byId: {
    a1: { email: 'a@b.com', id: 'a1', created_ts: '2019-01-01T10:30:00.000Z', roles: [rolesByName.admin], verified: true },
    [userId]: { email: 'a2@b.com', id: userId, created_ts: '2019-01-01T12:30:00.000Z', roles: [rolesByName.admin], tfa_status: twoFAStates.enabled }
  },
  currentUser: 'a1',
  globalSettings: { '2fa': 'enabled', id_attribute: undefined, previousFilters: [] },
  rolesById: {
    ...rolesById,
    test: {
      ...emptyRole,
      name: 'test',
      description: 'test description',
      editable: true,
      uiPermissions: {
        ...emptyUiPermissions,
        groups: { testGroup: [uiPermissionsById.read.value] },
        releases: { bar: [uiPermissionsById.read.value] }
      }
    }
  },
  settingsInitialized: true,
  userSettings: { '2fa': 'disabled', previousFilters: [], columnSelection: [], onboarding: { something: 'here' }, tooltips: {} }
};
