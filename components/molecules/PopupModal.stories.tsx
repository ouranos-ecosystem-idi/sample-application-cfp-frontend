import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/atoms/Button';
import PopupModal from './PopupModal';

const meta = {
  title: 'Components/Molecules/PopupModal',
  component: PopupModal,
} satisfies Meta<typeof PopupModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: '確定してよろしいですか',
    button: <Button>確定</Button>,
    children: <div>Any children</div>,
    isOpen: true,
    type: 'info',
  },
};
