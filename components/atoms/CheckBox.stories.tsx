import type { Meta, StoryObj } from '@storybook/react';

import CheckBox from './CheckBox';

const meta = {
  title: 'Components/Atoms/CheckBox',
  component: CheckBox,
} satisfies Meta<typeof CheckBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    checked: false,
    setChecked: () => { },
  },
};
export const Checked: Story = {
  args: {
    checked: true,
  }
};
export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
  }
};
export const CheckedAndDisabled: Story = {
  args: {
    checked: true,
    disabled: true,
  }
};