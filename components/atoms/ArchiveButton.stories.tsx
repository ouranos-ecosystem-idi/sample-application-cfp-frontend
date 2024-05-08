import type { Meta, StoryObj } from '@storybook/react';
import ArchiveButton from './ArchiveButton';

const meta = {
  title: 'Components/Atoms/ArchiveButton',
  component: ArchiveButton,
} satisfies Meta<typeof ArchiveButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
