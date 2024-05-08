import type { Meta, StoryObj } from '@storybook/react';
import PartsTable from './PartsTable';
import { PartsWithCfpDataType, Plant } from '@/lib/types';

const meta = {
  title: 'Components/Organisms/PartsTable',
  component: PartsTable,
} satisfies Meta<typeof PartsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const partsData: PartsWithCfpDataType[] = [
  {
    parts: {
      partsName: 'AAA',
      supportPartsName: 'AAB',
      plantId: 'plant-id-1',
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
    }
  },
  {
    parts: {
      partsName: 'AAAA',
      supportPartsName: 'AAAB',
      plantId: 'plant-id-2',
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
    }
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
  }
];

const plants: Plant[] = [
  {
    plantId: 'plant-id-1',
    plantName: '事業所1',
    openPlantId: 'open-plant-id-1',
  },
  {
    plantId: 'plant-id-2',
    plantName: '事業所2-long-long-long-long-long',
    openPlantId: 'open-plant-id-2-long-long-long-long',
  },
];

export const Primary: Story = {
  args: {
    partsWithCfpData: partsData,
    plants,
    paginationProps: {
      history: [],
      setNext: () => { },
      setHistory: () => { },
    },
    isCfpDataLoading: false,
    isPartsLoading: false,
  },
};
