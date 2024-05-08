import type { Meta, StoryObj } from '@storybook/react';
import Tooltip from './Tooltip';

const meta = {
  title: 'Components/Atoms/Tooltip',
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    message: 'こんにちわ',
    children: (
      <button className='mt-12 bg-slate-200 px-2 py-0.5'>Hover me</button>
    ),
  },
};
