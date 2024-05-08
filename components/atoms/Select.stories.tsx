import type { Meta, StoryObj } from '@storybook/react';

import { Select } from './Select';

const meta = {
  title: 'Components/Atoms/Select',
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    selectOptions: { '1': 'aaa', '2': 'bbb' },
    hidden: true,
    hiddenText: 'Please select...',
    children: 'Primary',
    className: 'w-32',
  },
};
