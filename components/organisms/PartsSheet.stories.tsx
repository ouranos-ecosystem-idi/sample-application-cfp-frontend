import type { Meta, StoryObj } from '@storybook/react';
import PartsSheet from './PartsSheet';
import { Parts, Plant } from '@/lib/types';

const meta = {
  title: 'Components/Organisms/PartsSheet',
  component: PartsSheet,
} satisfies Meta<typeof PartsSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const plants: Plant[] = [
  {
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e0',
    plantName: '事業所1',
    openPlantId: 'open-plant-id-1',
  },
];

const partsData: Parts = {
  partsName: 'AAA',
  supportPartsName: 'AAB',
  plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e0',
  traceId: 'AAA-BBB-CCC',
  amountRequired: 1,
  amountRequiredUnit: 'kilogram',
  operatorId: 'xxx',
  terminatedFlag: false,
  level: 1,
};

export const Primary: Story = {
  args: {
    partsData,
    plants,
    isLoading: false,
  },
};
