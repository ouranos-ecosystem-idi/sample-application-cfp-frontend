import type { Meta, StoryObj } from '@storybook/react';

import InputTextBox from '@/components/atoms/InputTextBox';

const meta = {
  title: 'Components/Atoms/InputTextBox',
  component: InputTextBox,
} satisfies Meta<typeof InputTextBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { disabled: false },
};
