import type { Meta, StoryObj } from '@storybook/react';

import Divider from './Divider';

const meta = {
  title: 'Components/Atoms/Divider',
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    h: 10,
  },
};
