import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';

const meta: Meta<typeof Button> = {
  component: Button,
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['button', 'submit', 'reset']
    }
  },
  title: 'common/Button'
};

export default meta;

type Story = StoryObj<typeof Button>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: props => (
    <Button
      onClick={(): void => {
        console.log('Hello from Turborepo!');
      }}
      {...props}
    >
      {props.children}
    </Button>
  ),
  name: 'Button',
  args: {
    children: 'Hello',
    type: 'submit',
    style: {
      color: 'blue',
      border: '1px solid gray',
      padding: 10,
      borderRadius: 10
    }
  }
};
