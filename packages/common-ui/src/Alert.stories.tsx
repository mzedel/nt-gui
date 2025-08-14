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

import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  component: Alert,
  title: 'common-ui/Alert',
  argTypes: {
    children: {
      options: [
        'Text',
        'Bold',
        'Empty',
        'This is a very long alert message that demonstrates how the alert component handles extended text content and wraps appropriately within the container boundaries.'
      ],
      mapping: {
        Text: <p>Italic</p>,
        Bold: <b>Bold</b>,
        Empty: <div />
      }
    }
  }
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Primary: Story = {
  render: props => <Alert {...props}>{props.children}</Alert>,
  name: 'Alert',
  args: {
    children: 'Text',
    style: {
      border: '1px solid gray'
    }
  }
};
