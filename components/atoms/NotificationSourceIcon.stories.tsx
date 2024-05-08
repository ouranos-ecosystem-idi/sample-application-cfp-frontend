import type { Meta, StoryObj } from '@storybook/react';
import NotificationSourceIcon from './NotificationSourceIcon';

const meta = {
  title: 'Components/Atoms/NotificationSourceIcon',
  component: NotificationSourceIcon,
} satisfies Meta<typeof NotificationSourceIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Respondent: Story = {
  args: {
    notificationSource: 'respondent',
  },
};
export const Requestor: Story = {
  args: {
    notificationSource: 'requestor',
  },
};
