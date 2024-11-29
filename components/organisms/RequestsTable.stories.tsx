import type { Meta, StoryObj } from '@storybook/react';
import RequestsTable from './RequestsTable';
import {
  TradeResponseDataType,
  Operator,
} from '@/lib/types';

const meta = {
  title: 'Components/Organisms/RequestsTable',
  component: RequestsTable,
} satisfies Meta<typeof RequestsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const items: TradeResponseDataType[] = [
  {
    downstreamOperatorId: '123456789abcdefghijklmnopqrstuvwxyz',
    downstreamTraceId: '694q9wmf-9485-8839-kemo-83skelnr2e43',
    status: 'sent',
    upstreamTraceId: '694q9wmf-9485-8839-kemo-83skelnr2e43',
    message:
      '電池モジュールA01-01のCFP登録をお願いします。メッセージは100文字まで入力することができます。電池モジュールA01-01のCFP登録をお願いします。メッセージは100文字まで入力することができます',
    tradeId: 'trade-1',
    downstreamPart: {
      amountRequired: 10,
      amountRequiredUnit: 'kilogram',
      operatorId: 'xa',
      partsName: '',
      plantId: 'plantxxx',
      supportPartsName: '',
      terminatedFlag: true,
      traceId: '694q9wmf-9485-8839-kemo-83skelnr2e44',
    },
    tradeTreeStatus: 'TERMINATED',
    responseDueDate: '2024-12-31'
  },
  {
    downstreamOperatorId: '123456789abcdefghijklmnopqrstuvwxyz',
    downstreamTraceId: '694q9wmf-9485-8839-kemo-83skelnr2e44',
    status: 'incomplete',
    upstreamTraceId: '694q9wmf-9485-8839-kemo-83skelnr2e44',
    message:
      '電池モジュールA01-01のCFP登録をお願いします。メッセージは100文字まで入力することができます。電池モジュールA01-01のCFP登録をお願いします。メッセージは100文字まで入力することができます',

    tradeId: 'trade-2',
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
    tradeTreeStatus: 'UNTERMINATED',
    responseDueDate: '2024-11-31'
  },
  {
    downstreamOperatorId: '123456789abcdefghijklmnopqrstuvwxyz',
    downstreamTraceId: '694q9wmf-9485-8839-kemo-83skelnr2e45',
    status: 'remanded',
    upstreamTraceId: '694q9wmf-9485-8839-kemo-83skelnr2e45',
    tradeId: 'trade-3',
    downstreamPart: {
      amountRequired: 10,
      amountRequiredUnit: 'kilogram',
      operatorId: 'xa',
      partsName: '',
      plantId: 'plantxxx',
      supportPartsName: '',
      terminatedFlag: true,
      traceId: '694q9wmf-9485-8839-kemo-83skelnr2e44',
    },
    tradeTreeStatus: 'TERMINATED',
    responseDueDate: '2024-01-31'
  },
];

const operatorsData: Operator[] = [
  {
    operatorId: '123456789abcdefghijklmnopqrstuvwxyz',
    openOperatorId: '1234567890139',
    operatorName: '化学A社',
  },
];

export const Primary: Story = {
  args: {
    items: items,
    operatorsData: operatorsData,
    onRejectTradeRequest: () => { },
    paginationProps: {
      history: [],
      setNext: () => { },
      setHistory: () => { },
    },
    isTradeRequestLoading: false,
  },
};
