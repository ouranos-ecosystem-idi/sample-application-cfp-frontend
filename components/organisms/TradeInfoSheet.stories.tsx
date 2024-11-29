import type { Meta, StoryObj } from '@storybook/react';
import { TradeResponseDataType, Operator } from '@/lib/types';
import TradeInfoSheet from './TradeInfoSheet';

const meta = {
  title: 'Components/Organisms/TradeInfoSheet',
  component: TradeInfoSheet,
} satisfies Meta<typeof TradeInfoSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const tradeResponseData: TradeResponseDataType = {
  downstreamTraceId: '694q9wmf-9485-8839-kemo-83skelnr2e44',
  tradeId: '694q9wmf-9485-8839-kemo-83skelnr2e43',
  status: 'incomplete',
  downstreamOperatorId: 'xxx',
  message:
    '電池モジュールA01-01のCFP登録をお願いします。メッセージは100文字まで入力することができます。電池モジュールA01-01のCFP登録をお願いします。メッセージは100文字まで入力することができます。電池モジュールA01-01のCFP登録をお',
  upstreamTraceId: '694q9wmf-9485-8839-kemo-83skelnr2e44',
  downstreamPart: {
    amountRequired: 10,
    amountRequiredUnit: 'kilogram',
    operatorId: 'xa',
    partsName: 'xpats',
    plantId: 'plantxxx',
    supportPartsName: 'supportx',
    terminatedFlag: true,
    traceId: '694q9wmf-9485-8839-kemo-83skelnr2e44',
  },
  tradeTreeStatus: 'TERMINATED',
  responseDueDate: '2024-12-31',
};
const operatorsData: Operator[] = [
  {
    operatorId: 'xxx',
    openOperatorId: '1234567890139',
    operatorName: '化学A社',
  },
];

export const Primary: Story = {
  args: {
    tradeResponseData,
    operatorsData,
    isLoading: false,
  },
};
