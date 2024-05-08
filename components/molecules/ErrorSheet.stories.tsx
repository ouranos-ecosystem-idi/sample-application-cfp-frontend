import type { Meta, StoryObj } from '@storybook/react';

import ErrorSheet from './ErrorSheet';

const meta = {
  title: 'Components/Molecules/ErrorSheet',
  component: ErrorSheet,
} satisfies Meta<typeof ErrorSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: '内容が重複しているレコードがあります。',
    children: (
      <div>
        構成部品の1行目と3行目が重複しています。\n構成部品の2行目と6行目と10行目と14行目が重複しています。
      </div>
    ),
    isOpen: true,
  },
};
