// Copyright 2020 Northern.tech AS
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
import { defaultState } from '@/testUtils';
import { describe, expect, it } from 'vitest';

import reducer, { actions, initialState } from '.';
import { SORTING_OPTIONS } from '../constants';

describe('organization reducer', () => {
  it('should return the initial state', async () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle RECEIVE_AUDIT_LOGS', async () => {
    expect(
      reducer(undefined, { type: actions.receiveAuditLogs.type, payload: { events: defaultState.organization.auditlog.events, total: 2 } }).auditlog
        .selectionState.total
    ).toEqual(2);
    expect(
      reducer(initialState, { type: actions.receiveAuditLogs.type, payload: { events: defaultState.organization.auditlog.events, total: 4 } }).auditlog
        .selectionState.total
    ).toEqual(4);
  });
  it('should handle SET_AUDITLOG_STATE', async () => {
    const newState = { selectedIssue: 'new' };
    expect(reducer(undefined, { type: actions.setAuditLogState.type, payload: newState }).auditlog.selectionState.selectedIssue).toEqual(
      newState.selectedIssue
    );
    expect(reducer(initialState, { type: actions.setAuditLogState.type, payload: newState }).auditlog.selectionState).toEqual({
      ...defaultState.organization.auditlog.selectionState,
      ...newState,
      sort: { direction: SORTING_OPTIONS.desc },
      total: 0
    });
  });
  it('should handle RECEIVE_CURRENT_CARD', async () => {
    expect(reducer(undefined, { type: actions.receiveCurrentCard.type, payload: defaultState.organization.card }).card).toEqual(defaultState.organization.card);
    expect(reducer(initialState, { type: actions.receiveCurrentCard.type, payload: defaultState.organization.card }).card).toEqual(
      defaultState.organization.card
    );
  });
  it('should handle RECEIVE_SETUP_INTENT', async () => {
    expect(reducer(undefined, { type: actions.receiveSetupIntent.type, payload: defaultState.organization.intentId }).intentId).toEqual(
      defaultState.organization.intentId
    );
    expect(reducer(initialState, { type: actions.receiveSetupIntent.type, payload: 4 }).intentId).toEqual(4);
  });
  it('should handle SET_ORGANIZATION', async () => {
    expect(reducer(undefined, { type: actions.setOrganization.type, payload: defaultState.organization.organization }).organization.plan).toEqual(
      defaultState.organization.organization.plan
    );
    expect(reducer(initialState, { type: actions.setOrganization.type, payload: defaultState.organization.organization }).organization.name).toEqual(
      defaultState.organization.organization.name
    );
  });
  it('should handle RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS', async () => {
    expect(reducer(undefined, { type: actions.receiveExternalDeviceIntegrations.type, payload: [] }).externalDeviceIntegrations).toEqual([]);
    expect(reducer(initialState, { type: actions.receiveExternalDeviceIntegrations.type, payload: [12, 23] }).externalDeviceIntegrations).toEqual([12, 23]);
  });
  it('should handle RECEIVE_WEBHOOK_EVENTS', async () => {
    expect(reducer(undefined, { type: actions.receiveWebhookEvents.type, payload: { value: [] } }).webhooks.events).toEqual([]);
    expect(reducer(initialState, { type: actions.receiveWebhookEvents.type, payload: { value: [12, 23], total: 5 } }).webhooks).toEqual({
      events: [12, 23],
      eventsTotal: 5
    });
  });
  it('should handle RECEIVE_SSO_CONFIGS', async () => {
    expect(reducer(undefined, { type: actions.receiveSsoConfigs.type, payload: [] }).ssoConfigs).toEqual([]);
    expect(reducer(initialState, { type: actions.receiveSsoConfigs.type, payload: [12, 23] }).ssoConfigs).toEqual([12, 23]);
  });
});
