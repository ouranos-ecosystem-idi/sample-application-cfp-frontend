import type { Meta, StoryObj } from '@storybook/react';
import TerminalIcon from './TerminalIcon';

const meta = {
  title: 'Components/Atoms/TerminalIcon',
  component: TerminalIcon,
} satisfies Meta<typeof TerminalIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
