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

import { Form } from './Form';
import type { FormCheckboxProps } from './FormCheckbox';
import { FormCheckbox } from './FormCheckbox';

const renderCheckbox = (args: FormCheckboxProps, checked = false) => (
  <Form defaultValues={{ [args.name]: checked }} onSubmit={() => {}}>
    <FormCheckbox {...args} />
  </Form>
);

const meta: Meta<typeof FormCheckbox> = {
  component: FormCheckbox,
  title: 'common-ui/forms/FormCheckbox'
};

export default meta;

type Story = StoryObj<typeof FormCheckbox>;

export const Primary: Story = {
  name: 'FormCheckbox',
  render: args => renderCheckbox(args),
  args: {
    name: 'terms',
    label: 'I agree to the terms and conditions'
  }
};

export const Checked: Story = {
  name: 'Checked',
  render: args => renderCheckbox(args, true),
  args: {
    name: 'notifications',
    label: 'Send me deployment notifications by email'
  }
};

export const Required: Story = {
  name: 'Required',
  render: args => renderCheckbox(args),
  args: {
    ...Primary.args,
    required: true
  }
};

export const Disabled: Story = {
  name: 'Disabled',
  render: args => renderCheckbox(args, true),
  args: {
    name: 'auditlog',
    label: 'Enable audit logging (available in the Enterprise plan)',
    disabled: true
  }
};

export const WithClickHandler: Story = {
  name: 'With Click Handler',
  render: args => renderCheckbox(args),
  args: {
    ...Primary.args,
    handleClick: () => console.log('checkbox clicked')
  }
};

export const WithSlotProps: Story = {
  name: 'With Slot Props',
  render: args => renderCheckbox(args, true),
  args: {
    name: 'retry',
    label: 'Retry failed deployments',
    slotProps: {
      checkbox: { color: 'secondary', size: 'small' },
      label: { labelPlacement: 'start' }
    }
  }
};
