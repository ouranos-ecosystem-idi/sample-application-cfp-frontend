import type { Meta, StoryObj } from '@storybook/react';
import { PartsWithCfpDataType, Plant } from '@/lib/types';
import PartsTableForLinkParts from './PartsTableForLinkParts';

const meta = {
  title: 'Components/Organisms/PartsTableForLinkParts',
  component: PartsTableForLinkParts,
} satisfies Meta<typeof PartsTableForLinkParts>;

export default meta;
type Story = StoryObj<typeof meta>;

const partsData: PartsWithCfpDataType[] = [
  {
    parts: {
      partsName: 'AAA',
      supportPartsName: 'AAB',
      plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e0',
      traceId: 'AAA-BBB-CCC',
      level: 1,
      amountRequired: 1,
      amountRequiredUnit: 'kilogram',
      operatorId: 'xxx',
      terminatedFlag: false,
    },
    cfps: {
      mainProductionResponse: {
        cfpId: 'aaa',
        traceId: '',
        emission: 200000,
        unit: 'kgCO2e/kilogram',
        dqrType: 'mainProcessingResponse',
        dqrValue: {
          TeR: 1.2,
          TiR: 3.5,
          GeR: 4.5,
        },
      },
      preProductionResponse: {
        cfpId: 'bbb',
        traceId: '',
        emission: 30000,
        unit: 'kgCO2e/kilogram',
        dqrType: 'preProcessingResponse',
        dqrValue: {
          TeR: 1.2,
          TiR: 3.5,
          GeR: 4.5,
        },
      },
    },
  },
  {
    parts: {
      partsName: 'AAAA',
      supportPartsName: 'AAAB',
      plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e1',
      traceId: 'AAA-BBB-DDD',
      level: 1,
      amountRequired: 1,
      amountRequiredUnit: 'kilogram',
      operatorId: 'xxx',
      terminatedFlag: false,
    },
    cfps: {
      mainProductionResponse: {
        cfpId: 'ccc',
        traceId: '',
        emission: 200000,
        unit: 'kgCO2e/kilogram',
        dqrType: 'mainProcessingResponse',
        dqrValue: {
          TeR: 1.2,
          TiR: 3.5,
          GeR: 4.5,
        },
      },
      preProductionResponse: {
        cfpId: 'ddd',
        traceId: '',
        emission: 123456,
        unit: 'kgCO2e/kilogram',
        dqrType: 'preProcessingResponse',
        dqrValue: {
          TeR: 1.2,
          TiR: 3.5,
          GeR: 4.5,
        },
      },
    },
  },
  {
    parts: {
      partsName: 'AAAA',
      supportPartsName: 'AAAB',
      plantId: 'plant-id-3',
      traceId: 'AAA-BBB-EEE',
      level: 1,
      amountRequired: 1,
      amountRequiredUnit: 'kilogram',
      operatorId: 'xxx',
      terminatedFlag: false,
    },
    cfps: {
      mainProductionResponse: {
        cfpId: 'ccc',
        traceId: '',
        emission: 200000,
        unit: 'kgCO2e/kilogram',
        dqrType: 'mainProcessingResponse',
        dqrValue: {
          TeR: 1.2,
          TiR: 3.5,
          GeR: 4.5,
        },
      },
      preProductionResponse: {
        cfpId: 'ddd',
        traceId: '',
        emission: 123456,
        unit: 'kgCO2e/kilogram',
        dqrType: 'preProcessingResponse',
        dqrValue: {
          TeR: 1.2,
          TiR: 3.5,
          GeR: 4.5,
        },
      },
    },
  },
];

const plants: Plant[] = [
  {
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e0',
    plantName: '事業所1',
    openPlantId: 'open-plant-id-1',
  },
  {
    plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e1',
    plantName: '事業所2-long-long-long-long-long',
    openPlantId: 'open-plant-id-2-long-long-long-long',
  },
];

export const Primary: Story = {
  args: {
    unlinkedPartsWithCfp: partsData,
    plants,
    statusId: 'status-id',
    paginationProps: {
      history: [],
      setNext: () => { },
      setHistory: () => { },
    },
    isCfpLoading: false,
    isLinkPartsLoading: false,
    isUnLinkedCfpLoading: false,
    isUnLinkPartsLoading: false,
  },
};
