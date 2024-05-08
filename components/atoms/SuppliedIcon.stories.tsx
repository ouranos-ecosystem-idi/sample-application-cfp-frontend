import type { Meta, StoryObj } from '@storybook/react';
import SuppliedIcon from './SuppliedIcon';

const meta = {
  title: 'Components/Atoms/SuppliedIcon',
  component: SuppliedIcon,
} satisfies Meta<typeof SuppliedIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
