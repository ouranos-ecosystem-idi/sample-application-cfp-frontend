import type { Meta, StoryObj } from '@storybook/react';
import { Operator } from '@/lib/types';
import OperatorInfoSheet from './OperatorInfoSheet';

const meta = {
  title: 'Components/Organisms/OperatorInfoSheet',
  component: OperatorInfoSheet,
} satisfies Meta<typeof OperatorInfoSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const operatorsData: Operator = {
  operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
  operatorName: 'A株式会社',
  openOperatorId: '9876543210987',
  globalOperatorId: 'sampleId1',
};

export const Primary: Story = {
  args: {
    operatorData: operatorsData,
    isLoading: false,
  },
};
