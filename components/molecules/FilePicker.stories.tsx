import type { Meta, StoryObj } from '@storybook/react';
import FilePicker from './FilePicker';
import { ComponentProps } from 'react';

const meta = {
  title: 'Components/Molecules/FilesPicker',
  component: FilePicker,
} satisfies Meta<typeof FilePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const propsPrimary: ComponentProps<typeof FilePicker> = {
  onFilesAdded: function (files: FileList): void {
    throw new Error('Function not implemented.');
  }
};

export const Primary: Story = {
  args: propsPrimary,
};
