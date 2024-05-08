import type { Meta, StoryObj } from '@storybook/react';

import StatusBadge from './StatusBadge';

const meta = {
  title: 'Components/Atoms/StatusBadge',
  component: StatusBadge,
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    color: 'red',
    text: 'status msg.',
  },
};
