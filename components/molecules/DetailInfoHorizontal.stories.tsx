import type { Meta, StoryObj } from '@storybook/react';
import DetailInfoHorizontal from './DetailInfoHorizontal';

const meta = {
  title: 'Components/Molecules/DetailInfoHorizontal',
  component: DetailInfoHorizontal,
} satisfies Meta<typeof DetailInfoHorizontal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    data: [
      {
        header: '項目ID',
        value: '12345678-0123-5678-0123-567890123456',
        width: 500,
      },
      { header: '事業者ID', value: '0123ABCD4567EFGH89IJ', width: 300 },
      { header: '事業者名', value: 'XXX株式会社', width: 200 },
    ],
  },
};
