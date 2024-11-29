import type { Meta, StoryObj } from '@storybook/react';
import PartsDetailTable from './PartsDetailTable';
import { PartsStructure, Plant } from '@/lib/types';

const meta = {
  title: 'Components/Organisms/PartsDetailTable',
  component: PartsDetailTable,
} satisfies Meta<typeof PartsDetailTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const tableData: PartsStructure = {
  parentParts: {
    level: 1,
    terminatedFlag: false,
    partsName: '0123456789ああいいううええおお',
    supportPartsName: '0123456789',
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809ec',
    traceId: '694q9wmf-9485-8839-kemo-83skelnr2e41',
    amountRequired: 100,
    amountRequiredUnit: 'kilogram',
    operatorId: 'not used',
  },
  childrenParts: []
};

const plants: Plant[] = [
  {
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809ec',
    plantName:
      '事業所AAAAAAAAAAAA',
    openPlantId: 'openid46',
  },
  {
    plantId: '5c85796c-6f1e-43b0-9190-abbd4be809ec',
    plantName:
      '事業所bbbbbbbbbbbbbbb',
    openPlantId:
      'openbbbbbbbbbb',
  },
];

export const Primary: Story = {
  args: {
    onSubmit: () => {
      return new Promise(() => { });
    },
    partsStructure: tableData,
    plants: plants,
    isPartsLoading: false,
  },
};
