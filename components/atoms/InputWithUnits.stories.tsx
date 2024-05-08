import type { Meta, StoryObj } from '@storybook/react';
import InputWithUnits from './InputWithUnits';
import { useState } from 'react';

const meta = {
  title: 'Components/Atoms/InputWithUnits',
  component: InputWithUnits,
} satisfies Meta<typeof InputWithUnits>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    value: 123.4,
    setValue: () => { },
    inputWidth: 30,
    step: 0.1,
  },
  render: function Component({ ...args }) {
    const [value, setValue] = useState(args.value);
    return <meta.component {...args} value={value} setValue={setValue} />;
  },
};
