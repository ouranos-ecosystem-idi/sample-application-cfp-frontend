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
    partsName: 'A01',
    supportPartsName: '001',
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809ec',
    traceId: '694q9wmf-9485-8839-kemo-83skelnr2e41',
    amountRequired: 100,
    amountRequiredUnit: 'kilogram',
    operatorId: 'not used',
  },
  childrenParts: [
    {
      level: 2,
      terminatedFlag: false,
      partsName: 'A123456789\nA123456789',
      supportPartsName: '0123456789',
      plantId: '4c85796c-6f1e-43b0-9190-abbd4be809ec',
      traceId: '694q9wmf-9485-8839-kemo-83skelnr2e42',
      amountRequired: 1000,
      amountRequiredUnit: 'kilogram',
      operatorId: 'not used',
    },
    {
      level: 2,
      terminatedFlag: true,
      partsName: 'B123456789\nB123456789',
      supportPartsName: '0123456789',
      plantId: '5c85796c-6f1e-43b0-9190-abbd4be809ec',
      traceId: '694q9wmf-9485-8839-kemo-83skelnr2e43',
      amountRequired: 1000000000.1111,
      amountRequiredUnit: 'kilogram',
      operatorId: 'not used',
    },
  ],
};

const plants: Plant[] = [
  {
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809ec',
    plantName:
      '事業所AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    openPlantId: 'openid46',
  },
  {
    plantId: '5c85796c-6f1e-43b0-9190-abbd4be809ec',
    plantName:
      '事業所bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    openPlantId:
      'openbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
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
