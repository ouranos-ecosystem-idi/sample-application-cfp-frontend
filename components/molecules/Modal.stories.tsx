import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/atoms/Button';
import Modal from './Modal';

const meta = {
  title: 'Components/Molecules/Modal',
  component: Modal,
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'タイトル',
    button: <Button>確定</Button>,
    children: (
      <div>
        Any children
        <br />
        ...
        <br />
        ...
      </div>
    ),
    isOpen: true,
  },
};
