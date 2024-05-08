import type { Meta, StoryObj } from '@storybook/react';

import DisplayWithUnits from './DisplayWithUnits';

const meta = {
  title: 'Components/Atoms/DisplayWithUnits',
  component: DisplayWithUnits,
} satisfies Meta<typeof DisplayWithUnits>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    value: 3,
    unit: 'kg',
    noUnit: false,
    digits: 3,
  },
};
