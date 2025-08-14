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
import { FormProvider, useForm } from 'react-hook-form';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChipSelect } from './ChipSelect';

const meta: Meta<typeof ChipSelect> = {
  title: 'common-ui/ChipSelect',
  component: ChipSelect,
  argTypes: {
    disabled: {
      control: { type: 'radio' },
      options: [true, false]
    }
  }
};

export default meta;

type Story = StoryObj<typeof ChipSelect>;

export const Primary: Story = {
  render: props => <ChipSelect {...props} />,
  name: 'ChipSelect',
  decorators: [
    Story => (
      <FormProvider {...useForm({ defaultValues: { 'chip-select': ['crackers', 'waffles', 'brunost'] } })}>
        <form noValidate>
          <Story />
        </form>
      </FormProvider>
    )
  ],
  args: {
    className: '',
    name: 'chip-select',
    disabled: false,
    label: 'some label',
    options: ['chips', 'chocolate', 'ice cream'],
    placeholder: 'select a snack'
  }
};
