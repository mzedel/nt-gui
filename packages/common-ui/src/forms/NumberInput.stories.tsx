// Copyright 2026 Northern.tech AS
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

import { Form } from './Form';
import { NumberInput } from './NumberInput';

const meta: Meta<typeof NumberInput> = {
  component: NumberInput,
  title: 'common-ui/forms/NumberInput',
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium']
    }
  },
  decorators: [
    Story => (
      <Form defaultValues={{ retries: 3 }} onSubmit={data => console.log('Submitted:', data)} showButtons submitLabel="Save">
        <Story />
      </Form>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof NumberInput>;

export const Primary: Story = {
  name: 'NumberInput',
  args: {
    name: 'retries',
    label: 'Retries',
    defaultValue: 3,
    min: 0,
    max: 10,
    helperText: 'Number of times a failed deployment is retried'
  }
};

export const WithSteppers: Story = {
  name: 'With Steppers',
  args: {
    ...Primary.args,
    showSteps: true,
    step: 1,
    width: 240
  }
};

export const Small: Story = {
  name: 'Small',
  args: {
    ...WithSteppers.args,
    size: 'small'
  }
};

export const Required: Story = {
  name: 'Required',
  args: {
    ...Primary.args,
    defaultValue: null,
    required: true,
    helperText: 'Clear the field to see the validation message'
  }
};

export const WithCustomRules: Story = {
  name: 'With Custom Rules',
  args: {
    ...Primary.args,
    rules: {
      min: { value: 1, message: 'At least one retry is required' },
      max: { value: 5, message: 'No more than 5 retries are supported' }
    }
  }
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    ...WithSteppers.args,
    disabled: true
  }
};
