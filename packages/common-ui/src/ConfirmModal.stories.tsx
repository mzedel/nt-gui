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
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ConfirmModal } from './ConfirmModal';

const meta: Meta<typeof ConfirmModal> = {
  title: 'common-ui/ConfirmModal',
  component: ConfirmModal,
  argTypes: {
    maxWidth: {
      control: { type: 'radio' },
      options: ['sm', 'md', 'lg']
    }
  }
};

export default meta;

type Story = StoryObj<typeof ConfirmModal>;

export const Primary: Story = {
  render: props => <ConfirmModal {...props} />,
  name: 'ConfirmModal',
  args: {
    toType: 'something',
    header: 'This is the header',
    description: 'something descriptive',
    open: true,
    className: '',
    maxWidth: 'md'
  }
};
