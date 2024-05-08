import type { Meta, StoryObj } from '@storybook/react';
import TooltipDetailInfoHorizontal from './TooltipDetailInfoHorizontal';
import { Info } from '@phosphor-icons/react/dist/ssr/Info';

const meta = {
  title: 'Components/Molecules/TooltipDetailInfoHorizontal',
  component: TooltipDetailInfoHorizontal,
} satisfies Meta<typeof TooltipDetailInfoHorizontal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: <Info size='28' color='fill-primary' />,
    data: [
      {
        header: '部品項目',
        value: 'A123456789A1234567890',
        width: 100,
      },
      {
        header: '補助項目',
        value: 'A123456789',
        width: 100,
      },
      {
        header: '事業所識別子',
        value: 'a1234567-1234-1234-1234-12345678901',
        width: 228,
      },
    ],
  },
};

Primary.decorators = [
  (Story) => (
    <div className='mt-20 ml-[500px]'>
      <Story />
    </div>
  ),
];
