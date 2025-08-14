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

import { DrawerTitle } from './DrawerTitle';

const meta: Meta<typeof DrawerTitle> = {
  component: DrawerTitle,
  includeStories: ['Primary', 'Secondary'],
  title: 'common-ui/DrawerTitle'
};

export default meta;

type Story = StoryObj<typeof DrawerTitle>;

export const Primary: Story = {
  render: props => <DrawerTitle {...props} />,
  name: 'DrawerTitle',
  args: {
    onClose: () => alert('closing the drawer'),
    title: 'Some title'
  }
};

export const Secondary: Story = {
  render: props => <DrawerTitle {...props} />,
  name: 'DrawerTitleFull',
  args: {
    onClose: () => alert('closing the drawer'),
    onLinkCopy: () => alert('callback to copy what is linked to here'),
    postTitle: <div>anything can follow here</div>,
    preCloser: <div>anything can be put here</div>,
    title: 'Some title'
  }
};
