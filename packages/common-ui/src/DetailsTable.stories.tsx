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
import { SORTING_OPTIONS } from '@northern.tech/store/constants';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { DetailsTable } from './DetailsTable';

const meta: Meta<typeof DetailsTable> = {
  component: DetailsTable,
  includeStories: ['Primary', 'Secondary', 'Tertiary'],
  title: 'common-ui/DetailsTable'
};

export default meta;

type Story = StoryObj<typeof DetailsTable>;

const columns = [
  {
    key: 'name',
    title: 'Name',
    render: ({ name }) => name,
    sortable: true,
    defaultSortDirection: SORTING_OPTIONS.asc
  },
  {
    key: 'count',
    title: 'count',
    render: ({ count }) => count,
    renderTitle: ({ extraCount }) => <b>{extraCount}</b>,
    extras: { extraCount: 'something a little extra' },
    sortable: false,
    defaultSortDirection: SORTING_OPTIONS.asc
  },
  {
    key: 'constant',
    title: 'something constant',
    render: () => 'Yeah!'
  }
];

const items = Array.from({ length: 10 }).map((_, index) => ({ name: `list-entry ${index + 1}`, count: index }));

export const Primary: Story = {
  render: props => <DetailsTable {...props} />,
  name: 'DetailsTable',
  args: {
    className: '',
    columns,
    items,
    onChangeSorting: (...args) => alert(`sorting changed: ${JSON.stringify(args)}`),
    onItemClick: (...args) => alert(`item clicked: ${JSON.stringify(args)}`),
    style: {},
    onRowSelected: (...args) => alert(`row selected: ${JSON.stringify(args)}`),
    selectedRows: [2, 5]
  }
};

export const Secondary: Story = {
  render: props => <DetailsTable {...props} onRowSelected={undefined} />,
  name: 'DetailsTableNoSelection',
  args: {
    className: '',
    columns,
    items,
    onChangeSorting: (...args) => alert(`sorting changed: ${JSON.stringify(args)}`),
    onItemClick: (...args) => alert(`item clicked: ${JSON.stringify(args)}`),
    style: {}
  }
};

export const Tertiary: Story = {
  render: props => <DetailsTable {...props} />,
  name: 'DetailsTableNothingness',
  args: {
    className: '',
    columns,
    items: [],
    style: {}
  }
};
