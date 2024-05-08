import type { Meta, StoryObj } from '@storybook/react';

import DatePickerWithStyle from './DatePickerWithStyle';

const meta = {
  title: 'Components/Atoms/DatePickerWithStyle',
  component: DatePickerWithStyle,
} satisfies Meta<typeof DatePickerWithStyle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    selected: new Date('2023-12-16T00:00:00+09:00'),
    onChange: () => { },
    maxDate: new Date('2024-01-15T00:00:00+09:00'),
    placeholderText: '開始日',
  },
};
