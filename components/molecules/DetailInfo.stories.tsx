import type { Meta, StoryObj } from '@storybook/react';
import DetailInfo from './DetailInfo';

const meta = {
  title: 'Components/Molecules/DetailInfo',
  component: DetailInfo,
} satisfies Meta<typeof DetailInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    header: 'ヘッダー',
    data: [
      { header: '項目ID', value: '12345678-0123-5678-0123-567890123456' },
      { header: '事業者ID', value: '0123ABCD4567EFGH89IJ' },
      { header: '事業者名', value: 'XXX株式会社' },
    ],
  },
};
