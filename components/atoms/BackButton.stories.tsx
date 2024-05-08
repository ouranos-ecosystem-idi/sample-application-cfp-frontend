import type { Meta, StoryObj } from '@storybook/react';
import BackButton from './BackButton';

const meta = {
  title: 'Components/Atoms/BackButton',
  component: BackButton,
} satisfies Meta<typeof BackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    href: './',
    text: '戻る',
  },
};
