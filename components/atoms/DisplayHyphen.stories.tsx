import type { Meta, StoryObj } from '@storybook/react';
import DisplayHyphen from './DisplayHyphen';

const meta = {
  title: 'Components/Atoms/DisplayHyphen',
  component: DisplayHyphen,
} satisfies Meta<typeof DisplayHyphen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
