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
import type { TextInputProps } from './TextInput';
import { TextInput } from './TextInput';

const renderInput = (args: TextInputProps, initialValue = '') => (
  <Form defaultValues={{ [args.name]: initialValue }} onSubmit={() => {}}>
    <TextInput {...args} />
  </Form>
);

const meta: Meta<typeof TextInput> = {
  component: TextInput,
  title: 'common-ui/forms/TextInput'
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Primary: Story = {
  name: 'TextInput',
  render: args => renderInput(args),
  args: {
    autocomplete: 'email',
    hint: 'user@example.com',
    name: 'email',
    label: 'Email',
    required: true,
    type: 'email',
    validations: 'isEmail'
  }
};

export const WithHelperText: Story = {
  name: 'With Helper Text',
  render: args => renderInput(args),
  args: {
    ...Primary.args,
    helperText: 'We will only use this address to contact you about your account'
  }
};

export const WithValue: Story = {
  name: 'With Value',
  render: args => renderInput(args, 'production gateway'),
  args: {
    hint: 'e.g. production gateway',
    name: 'device_name',
    label: 'Device name',
    validations: 'isLength:3,trim'
  }
};

export const WithRules: Story = {
  name: 'With Additional Rules',
  render: args => renderInput(args),
  args: {
    name: 'device_name',
    label: 'Device name',
    required: true,
    rules: { maxLength: { message: 'The name may not exceed 32 characters', value: 32 } }
  }
};

export const Disabled: Story = {
  name: 'Disabled',
  render: args => renderInput(args, 'immutable-value'),
  args: {
    disabled: true,
    name: 'tenant_token',
    label: 'Tenant token'
  }
};

export const FullWidth: Story = {
  name: 'Full Width',
  render: args => renderInput(args),
  args: {
    ...Primary.args,
    width: '100%'
  }
};
