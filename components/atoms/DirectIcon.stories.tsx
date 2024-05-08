import type { Meta, StoryObj } from '@storybook/react';
import DirectIcon from './DirectIcon';

const meta = {
  title: 'Components/Atoms/DirectIcon',
  component: DirectIcon,
} satisfies Meta<typeof DirectIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
