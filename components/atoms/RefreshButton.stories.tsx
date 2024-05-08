import type { Meta, StoryObj } from '@storybook/react';
import RefreshButton from './RefreshButton';

const meta = {
  title: 'Components/Atoms/RefreshButton',
  component: RefreshButton,
} satisfies Meta<typeof RefreshButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
