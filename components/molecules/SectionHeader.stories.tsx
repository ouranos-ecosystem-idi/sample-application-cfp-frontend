import type { Meta, StoryObj } from '@storybook/react';
import SectionHeader from './SectionHeader';

const meta = {
  title: 'Components/Molecules/SectionHeader',
  component: SectionHeader,
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'タイトル',
    variant: 'h1',
    leftChildren: [<div key='1'>子1</div>, <div key='2'>子2</div>],
    rightChildren: [<div key='3'>子3</div>, <div key='4'>子4</div>],
  },
};
