import type { Meta, StoryObj } from '@storybook/react';
import AddRowButton from '@/components/atoms/AddRowButton';

const meta = {
  title: 'Components/Atoms/AddRowButton',
  component: AddRowButton,
} satisfies Meta<typeof AddRowButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { hasBorder: true },
};
