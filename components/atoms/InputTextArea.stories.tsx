import type { Meta, StoryObj } from '@storybook/react';

import InputTextArea from '@/components/atoms/InputTextArea';

const meta = {
  title: 'Components/Atoms/InputTextArea',
  component: InputTextArea,
} satisfies Meta<typeof InputTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { error: 'error message' },
};
