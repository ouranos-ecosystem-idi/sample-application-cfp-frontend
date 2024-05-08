import type { Meta, StoryObj } from '@storybook/react';
import DatePickerFromTo from './DatePickerFromTo';

const meta = {
  title: 'Components/Molecules/DatePickerFromTo',
  component: DatePickerFromTo,
} satisfies Meta<typeof DatePickerFromTo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    fromDate: new Date('2023-12-16T00:00:00+09:00'),
    fromOnChange: () => { },
    fromDateMax: new Date('2024-01-15T00:00:00+09:00'),
    toDate: new Date('2024-01-15T00:00:00+09:00'),
    toOnChange: () => { },
    toDateMax: new Date('2024-01-15T00:00:00+09:00'),
  },
};
