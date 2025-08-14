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

import FileSize from './FileSize';

const meta: Meta<typeof FileSize> = {
  title: 'common-ui/FileSize',
  component: FileSize,
  argTypes: {
    fileSize: {
      control: { type: 'radio' },
      options: [0, 512, 1024, 1048576, 1000000, 2147483648, 1099511627776]
    }
  }
};

export default meta;

type Story = StoryObj<typeof FileSize>;

export const Primary: Story = {
  render: props => <FileSize {...props} />,
  name: 'FileSize',
  args: {
    fileSize: 1000000,
    style: {}
  }
};
