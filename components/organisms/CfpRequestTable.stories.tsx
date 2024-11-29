import type { Meta, StoryObj } from '@storybook/react';
import {
  Plant,
  TradeRequestDataTypeWithOperator,
} from '@/lib/types';
import CfpRequestTable from '@/components/organisms/CfpRequestTable';

const meta = {
  title: 'Components/Organisms/CfpRequestTable',
  component: CfpRequestTable,
} satisfies Meta<typeof CfpRequestTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const tradeRequestData: TradeRequestDataTypeWithOperator[] = [
  {
    downStreamPart: {
      traceId: '694q9wmf-9485-8839-kemo-83skelnr2e44',
      partsName: 'A123456789A123456789',
      supportPartsName: '0123456789',
      plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e0',
      amountRequired: 1,
      amountRequiredUnit: 'kilogram',
      operatorId: 'xxx',
      terminatedFlag: false,
      level: 2,
    },
    tradeId: '694q9wmf-9485-8839-kemo-83skelnr2e43',
    operator: {
      operatorId: 'xxx',
      openOperatorId: 'openxxx',
      operatorName: 'xxxName',
    }
  },
  {
    downStreamPart: {
      traceId: '694q9wmf-9485-8839-kemo-83skelnr2e45',
      partsName: 'A123456789A123456789',
      supportPartsName: '0123456789',
      plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e1',
      amountRequired: 1,
      amountRequiredUnit: 'kilogram',
      operatorId: 'xxx',
      terminatedFlag: false,
      level: 2,
    },
    tradeId: '694q9wmf-9485-8839-kemo-83skelnr2e42',
    operator: {
      operatorId: 'xxx',
      openOperatorId: 'openxxx',
      operatorName: 'xxxName',
    }
  },
  {
    downStreamPart: {
      traceId: '694q9wmf-9485-8839-kemo-83skelnr2e46',
      partsName: 'A123456789A123456789',
      supportPartsName: '0123456789',
      plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e0',
      terminatedFlag: false,
      level: 2,
      amountRequired: 1,
      amountRequiredUnit: 'kilogram',
      operatorId: 'yyy',
    },
    tradeId: '694q9wmf-9485-8839-kemo-83skelnr2e41',
    tradeStatus: {
      requestStatus: {
        cfpResponseStatus: 'COMPLETED',
        tradeTreeStatus: 'TERMINATED',
        completedCount: 2,
        completedCountModifiedAt:'2024-05-07T18:59:33Z',
        tradesCount: 3,
        tradesCountModifiedAt:'2024-05-06T11:43:51Z',
      },
      message:
        '電池モジュールA01-01のCFP登録をお願いします。メッセージは100文字まで入力することができます。電池モジュールA01-01のCFP登録をお願いします。メッセージは100文字まで入力することができます。電池モジュールA01-01のCFP登録をお',
      responseDueDate:'2024-06-01',
    },
    operator: {
      operatorId: 'yyy',
      openOperatorId: 'openyyy',
      operatorName: 'yyyName',
    },
    upstreamOperatorId: '12341234-1234-4444-123412341234',
  },
  {
    downStreamPart: {
      traceId: '694q9wmf-9485-8839-kemo-83skelnr2e47',
      partsName: 'A123456789A123456789',
      supportPartsName: '0123456789',
      plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e1',
      operatorId:
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
      amountRequired: 1,
      amountRequiredUnit: 'kilogram',
      terminatedFlag: false,
      level: 2,
    },

    tradeId: '694q9wmf-9485-8839-kemo-83skelnr2e40',
    tradeStatus: {
      requestStatus: {
        cfpResponseStatus: 'NOT_COMPLETED',
        tradeTreeStatus: 'UNTERMINATED',
      },
      message:
        '電池モジュールA01-01のCFP登録をお願いします。メッセージは100文字まで入力することができます。電池モジュールA01-01のCFP登録をお願いします。メッセージは100文字まで入力することができます。電池モジュールA01-01のCFP登録をお',
    },
    operator: {
      operatorId:
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
      openOperatorId:
        'open12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
      operatorName:
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890Name',
    },
    upstreamOperatorId: '12341234-1234-4444-123412341234',
  },
  {
    downStreamPart: {
      traceId: '694q9wmf-9485-8839-kemo-83skelnr2e48',
      partsName: 'A123456789A123456789',
      supportPartsName: '0123456789',
      plantId: '12345678901234567890123456',
      amountRequired: 1,
      amountRequiredUnit: 'kilogram',
      operatorId: 'xxx',
      terminatedFlag: false,
      level: 2,
    },
    tradeId: '694q9wmf-9485-8839-kemo-83skelnr2e39',
    tradeStatus: {
      requestStatus: {
        cfpResponseStatus: 'NOT_COMPLETED',
        tradeTreeStatus: 'UNTERMINATED',
      },
      message:
        '電池モジュールA01-01のCFP登録をお願いします。メッセージは100文字まで入力することができます。電池モジュールA01-01のCFP登録をお願いします。メッセージは100文字まで入力することができます。電池モジュールA01-01のCFP登録をお',

    },
    operator: {
      operatorId: 'xxx',
      openOperatorId: 'openxxx',
      operatorName: 'xxxName',
    },
    upstreamOperatorId: '12341234-1234-4444-123412341234',
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
    tradeRequestData,
    plants,
    onSubmit: () => { },
    getOperator: () => {
      return new Promise(() => { });
    },
    onCancelTradeRequest: async (
    ) => { },
    isOperatorLoading: false,
    isTradeResponseLoading: false,
  },
};
