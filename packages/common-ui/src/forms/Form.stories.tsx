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
import type { FieldValues } from 'react-hook-form';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { FormProps } from './Form';
import { Form } from './Form';
import { TextInput } from './TextInput';

const SampleFormContent = () => (
  <div className="flexbox column" style={{ gap: 20 }}>
    <TextInput name="name" label="Name" required validations="isLength:3" />
    <TextInput hint="user@example.com" name="email" label="Email" required type="email" validations="isEmail" />
  </div>
);

const renderForm = (args: FormProps) => (
  <Form {...args}>
    <SampleFormContent />
  </Form>
);

const meta: Meta<typeof Form> = {
  component: Form,
  title: 'common-ui/forms/Form'
};

export default meta;

type Story = StoryObj<typeof Form>;

export const Primary: Story = {
  name: 'Form',
  render: renderForm,
  args: {
    defaultValues: { email: '', name: '' },
    onSubmit: (data: FieldValues) => console.log('form submitted:', data),
    showButtons: true,
    submitLabel: 'Save'
  }
};

export const WithCancel: Story = {
  name: 'With Cancel Button',
  render: renderForm,
  args: {
    ...Primary.args,
    handleCancel: () => console.log('form cancelled')
  }
};

export const WithInitialValues: Story = {
  name: 'With Initial Values',
  render: renderForm,
  args: {
    ...Primary.args,
    initialValues: { email: 'ada@example.com', name: 'Ada Lovelace' }
  }
};

export const ResetOnSubmit: Story = {
  name: 'Reset On Submit',
  render: renderForm,
  args: {
    ...Primary.args,
    resetOnSubmit: true,
    submitLabel: 'Add another'
  }
};

export const SubmitTimeValidation: Story = {
  name: 'Submit Time Validation',
  render: renderForm,
  args: {
    ...Primary.args,
    buttonColor: 'secondary',
    validationMode: 'onSubmit'
  }
};

export const WithoutButtons: Story = {
  name: 'Without Buttons',
  render: renderForm,
  args: {
    ...Primary.args,
    showButtons: false
  }
};
