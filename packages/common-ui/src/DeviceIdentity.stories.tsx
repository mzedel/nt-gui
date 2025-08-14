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
import { Provider } from 'react-redux';

import { getConfiguredStore } from '@northern.tech/store/store';
import { mockApiResponses as defaultState } from '@northern.tech/testing/mockData';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { DeviceIdentityDisplay as DeviceIdentity } from './DeviceIdentity';

const meta: Meta<typeof DeviceIdentity> = {
  title: 'common-ui/DeviceIdentity',
  component: DeviceIdentity
};

export default meta;

type Story = StoryObj<typeof DeviceIdentity>;

export const Primary: Story = {
  render: props => <DeviceIdentity {...props} />,
  name: 'DeviceIdentity',
  decorators: [
    Story => {
      const store = getConfiguredStore({ preloadedState: defaultState });
      return (
        <Provider store={store}>
          <Story />
        </Provider>
      );
    }
  ],
  args: {
    device: {
      ...defaultState.devices.byId.a1,
      attributes: {
        ...defaultState.devices.byId.a1.attributes,
        mender_is_gateway: true,
        mender_gateway_system_id: '123'
      }
    },
    isEditable: true,
    hasAdornment: false,
    style: {}
  }
};
