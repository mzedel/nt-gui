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

import { BENEFITS } from '@northern.tech/store/constants';
import { getConfiguredStore } from '@northern.tech/store/store';
import { mockApiResponses as defaultState } from '@northern.tech/testing/mockData';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { EnterpriseNotification } from './EnterpriseNotification';

const meta: Meta<typeof EnterpriseNotification> = {
  title: 'common-ui/EnterpriseNotification',
  component: EnterpriseNotification,
  argTypes: {
    id: {
      options: Object.values(BENEFITS).map(({ id }) => id)
    }
  }
};

export default meta;

type Story = StoryObj<typeof EnterpriseNotification>;

export const Primary: Story = {
  render: props => <EnterpriseNotification {...props} />,
  name: 'EnterpriseNotification',
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
    className: '',
    id: BENEFITS.default.id
  }
};
