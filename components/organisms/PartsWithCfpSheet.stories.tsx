import type { Meta, StoryObj } from '@storybook/react';
import { Parts, Plant } from '@/lib/types';
import PartsWithCfpSheet from './PartsWithCfpSheet';

const meta = {
  title: 'Components/Organisms/PartsWithCfpSheet',
  component: PartsWithCfpSheet,
} satisfies Meta<typeof PartsWithCfpSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const parts: Parts = {
  level: 1,
  partsName: 'A123456789A123456789',
  supportPartsName: 'A123456789',
  plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e0',
  amountRequired: 100,
  amountRequiredUnit: 'kilogram',
  operatorId: 'xxx',
  terminatedFlag: false,
};

const plants: Plant[] = [
  {
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e0',
    plantName: '事業所1',
    openPlantId: 'open-plant-id-1',
  },
];

export const Primary: Story = {
  args: {
    partsData: parts,
    plants,
    isLoading: false,
  },
};
