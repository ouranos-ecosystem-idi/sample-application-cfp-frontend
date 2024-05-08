import type { Meta, StoryObj } from '@storybook/react';
import TableHeaderWithSortIcon from './TableHeaderWithSortIcon';

const meta = {
  title: 'Components/Atoms/TableHeaderWithSortIcon',
  component: TableHeaderWithSortIcon,
} satisfies Meta<typeof TableHeaderWithSortIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    text: '列タイトル',
    order: 'asc',
  },
};
