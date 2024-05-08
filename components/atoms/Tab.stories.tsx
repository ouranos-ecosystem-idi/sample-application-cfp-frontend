import type { Meta, StoryObj } from '@storybook/react';

import Tab from './Tab';

const meta = {
  title: 'Components/Atoms/Tab',
  component: Tab,
} satisfies Meta<typeof Tab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    tabs: ['タブ1', 'タブ2', 'タブ3'],
    activeTabIndex: 0,
    onSelect: () => { },
  },
};
