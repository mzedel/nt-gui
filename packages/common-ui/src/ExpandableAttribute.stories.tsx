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

import { ExpandableAttribute } from './ExpandableAttribute';

const meta: Meta<typeof ExpandableAttribute> = {
  title: 'common-ui/ExpandableAttribute',
  component: ExpandableAttribute
};

export default meta;

type Story = StoryObj<typeof ExpandableAttribute>;

export const Primary: Story = {
  render: props => <ExpandableAttribute {...props} />,
  name: 'ExpandableAttribute',
  args: {
    copyToClipboard: false,
    dividerDisabled: false,
    onExpansion: () => alert('expanding'),
    primary: 'something secondary',
    secondary:
      'something long, something long, something long, something long, something long, something long, something long, something long, something long, something long, something long',
    setSnackbar: (message: string) => alert(`snack showing: ${message}`),
    style: {
      maxWidth: 400,
      maxHeight: 200
    }
  }
};
