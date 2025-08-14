// Copyright 2019 Northern.tech AS
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
import type { DEVICE_STATES, FilterOperator } from '../constants';
import { DEVICE_FILTERING_OPTIONS } from '../constants';

export const emptyFilter = { key: null, value: '', operator: DEVICE_FILTERING_OPTIONS.$eq.key as FilterOperator, scope: 'inventory' };

// see https://github.com/mendersoftware/go-lib-micro/tree/master/ws
//     for the description of proto_header and the consts
// *Note*: this needs to be aligned with mender-connect and deviceconnect.
export const DEVICE_MESSAGE_PROTOCOLS = {
  Shell: 1
};
export const DEVICE_MESSAGE_TYPES = {
  Delay: 'delay',
  New: 'new',
  Ping: 'ping',
  Pong: 'pong',
  Resize: 'resize',
  Shell: 'shell',
  Stop: 'stop'
};

// we can't include the dismiss state with the rest since this would include dismissed devices in several queries
export const DEVICE_DISMISSAL_STATE = 'dismiss';

export type DeviceAuthState = (typeof DEVICE_STATES)[keyof typeof DEVICE_STATES];

export const DEVICE_CONNECT_STATES = {
  connected: 'connected',
  disconnected: 'disconnected',
  unknown: 'unknown'
};

export const geoAttributes = ['geo-lat', 'geo-lon'].map(attribute => ({ attribute, scope: 'inventory' }));

export const REPORT_CHART_SIZE_LIMIT = 6;
