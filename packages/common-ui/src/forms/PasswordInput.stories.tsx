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
import { PasswordInput } from './PasswordInput';

const meta: Meta<typeof PasswordInput> = {
  component: PasswordInput,
  title: 'common-ui/forms/PasswordInput',
  decorators: [
    Story => (
      <Form defaultValues={{ password: '', password_confirmation: '' }} onSubmit={data => console.log('Submitted:', data)}>
        <Story />
      </Form>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof PasswordInput>;

export const Primary: Story = {
  name: 'PasswordInput',
  args: {
    name: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    disabled: false,
    required: false,
    create: false
  }
};

export const Create: Story = {
  name: 'Create - with strength check',
  args: {
    ...Primary.args,
    label: 'New password',
    create: true,
    required: true,
    validations: 'isLength:8'
  }
};

export const WithConfirmation: Story = {
  name: 'With Confirmation',
  render: args => (
    <div className="flexbox column" style={{ gap: 15 }}>
      <PasswordInput {...args} />
      <PasswordInput name="password_confirmation" label="Confirm password" required validations="isLength:8" />
    </div>
  ),
  args: {
    ...Create.args
  }
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    ...Primary.args,
    disabled: true,
    defaultValue: 'somepassword'
  }
};
