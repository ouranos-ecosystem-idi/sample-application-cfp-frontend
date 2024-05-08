import type { Meta, StoryObj } from '@storybook/react';
import StatusBadge from '@/components/atoms/StatusBadge';
import SheetStatusHeader from './SheetStatusHeader';

const meta = {
  title: 'Components/Molecules/SheetStatusHeader',
  component: SheetStatusHeader,
} satisfies Meta<typeof SheetStatusHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    statusBadge: <StatusBadge color='blue' text='バッジ' />,
    lastUpdated: '2023/10/23',
  },
};
