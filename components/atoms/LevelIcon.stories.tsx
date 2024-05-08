import type { Meta, StoryObj } from '@storybook/react';
import LevelIcon from './LevelIcon';

const meta = {
  title: 'Components/Atoms/LevelIcon',
  component: LevelIcon,
} satisfies Meta<typeof LevelIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    level: 1,
  },
};
