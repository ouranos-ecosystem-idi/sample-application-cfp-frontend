import type { Meta, StoryObj } from '@storybook/react';

import Pagination from './Pagination';

const meta = {
  title: 'Components/Atoms/Pagination',
  component: Pagination,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    next: 'a',
    history: [],
  },
};
export const Secondary: Story = {
  args: { history: ['a', 'b', 'c'] },
};
