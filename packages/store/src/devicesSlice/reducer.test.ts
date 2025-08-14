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
/*eslint import/namespace: ['error', { allowComputed: true }]*/
import { defaultState } from '@/testUtils';
import { describe, expect, it } from 'vitest';

import reducer, { actions, initialState } from '.';

describe('device reducer', () => {
  it('should handle ADD_TO_GROUP', async () => {
    const state = reducer(undefined, { type: actions.receivedGroups.type, payload: defaultState.devices.groups.byId });
    expect(reducer(state, { type: actions.addToGroup.type, payload: { group: 'testExtra', deviceIds: ['d1'] } }).groups.byId.testExtra.deviceIds).toHaveLength(
      1
    );
    expect(
      reducer(initialState, { type: actions.addToGroup.type, payload: { group: 'testGroup', deviceIds: ['123', '1243'] } }).groups.byId.testGroup.deviceIds
    ).toHaveLength(2);
  });
  it('should handle REMOVE_FROM_GROUP', async () => {
    let state = reducer(undefined, { type: actions.receivedGroups.type, payload: defaultState.devices.groups.byId });
    state = reducer(state, { type: actions.selectGroup.type, payload: 'testGroup' });
    expect(
      reducer(state, {
        type: actions.removeFromGroup.type,
        payload: { group: 'testGroup', deviceIds: [defaultState.devices.groups.byId.testGroup.deviceIds[0]] }
      }).groups.byId.testGroup.deviceIds
    ).toHaveLength(defaultState.devices.groups.byId.testGroup.deviceIds.length - 1);
    expect(
      reducer(state, { type: actions.removeFromGroup.type, payload: { group: 'testGroup', deviceIds: defaultState.devices.groups.byId.testGroup.deviceIds } })
        .groups.byId.testGroup
    ).toBeFalsy();
    expect(
      reducer(initialState, { type: actions.removeFromGroup.type, payload: { group: 'testExtra', deviceIds: ['123', '1243'] } }).groups.byId.testExtra
    ).toBeFalsy();
  });
  it('should handle ADD_DYNAMIC_GROUP', async () => {
    expect(reducer(undefined, { type: actions.addGroup.type, payload: { groupName: 'test', group: { id: 'test' } } }).groups.byId.test.id).toBeTruthy();
    expect(reducer(initialState, { type: actions.addGroup.type, payload: { groupName: 'test', group: { id: 'test' } } }).groups.byId.test.id).toBeTruthy();
  });
});
