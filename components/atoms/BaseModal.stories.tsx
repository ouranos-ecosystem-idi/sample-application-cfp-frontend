import type { Meta, StoryObj } from '@storybook/react';
import BaseModal from './BaseModal';

const meta = {
  title: 'Components/Atoms/BaseModal',
  component: BaseModal,
} satisfies Meta<typeof BaseModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    isOpen: true,
    children: <div>Any children</div>,
  },
};
