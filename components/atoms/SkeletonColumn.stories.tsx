import type { Meta, StoryObj } from '@storybook/react';
import SkeletonColumn from './SkeletonColumn';

const meta = {
  title: 'Components/Atoms/SkeletonColumn',
  component: SkeletonColumn,
} satisfies Meta<typeof SkeletonColumn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
