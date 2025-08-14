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

import { Code, CopyCode } from './CopyCode';

const meta: Meta<typeof CopyCode> = {
  title: 'common-ui/CopyCode',
  component: CopyCode,
  includeStories: ['Primary', 'Secondary'],
  argTypes: {
    withDescription: {
      type: 'boolean'
    }
  }
};

export default meta;

type Story = StoryObj<typeof CopyCode>;

export const Primary: Story = {
  render: props => <CopyCode {...props} />,
  name: 'CopyCode',
  args: {
    code: 'something',
    onCopy: () => alert('copied this'),
    withDescription: true
  }
};

type SecondaryStory = StoryObj<typeof Code>;

export const Secondary: SecondaryStory = {
  render: props => <Code {...props} />,
  name: 'Code',
  args: {
    className: '',
    children: 'hackety hack {} , <>/|| very 123',
    style: {}
  }
};
