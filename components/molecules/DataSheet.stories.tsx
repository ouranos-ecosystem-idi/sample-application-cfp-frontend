import type { Meta, StoryObj } from '@storybook/react';
import DataSheet from './DataSheet';

const meta = {
  title: 'Components/Molecules/DataScheet',
  component: DataSheet,
} satisfies Meta<typeof DataSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const sheetData: Story['args']['data'] = [
  { header: '項目ID', value: '12345678-0123-5678-0123-567890123456' },
  { header: '事業者ID', value: '0123ABCD4567EFGH89IJ' },
  { header: '事業者名', value: 'XXX株式会社' },
];

export const Primary: Story = {
  args: {
    data: sheetData,
  },
};
