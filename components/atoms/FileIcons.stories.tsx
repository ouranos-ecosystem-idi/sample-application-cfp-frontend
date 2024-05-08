import type { Meta, StoryObj } from '@storybook/react';
import FileIcons from './FileIcons';

const meta = {
  title: 'Components/Atoms/FileIcons',
  component: FileIcons,
} satisfies Meta<typeof FileIcons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { extension: 'pdf' },
};
