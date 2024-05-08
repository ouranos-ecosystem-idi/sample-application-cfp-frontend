import type { Meta, StoryObj } from '@storybook/react';
import type {
  ParentHeader,
  Column,
  HeaderForTabs,
} from '@/components/molecules/DataTable';
import { DataTable } from '@/components/molecules/DataTable';
import Tab from '@/components/atoms/Tab';
import { useState } from 'react';

const meta = {
  title: 'Components/Molecules/DataTable',
  component: DataTable,
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

type DataType = {
  id: string;
  name: string;
  age: number;
  address: string;
  partsName: string;
  supportPartsName: string;
  plantId: string;
  traceId: string;
  amountRequired: string;
  status: string;
  upstreamOperatorId: string;
};

const headerForTabs: HeaderForTabs<DataType> = {
  startHeaders: ['address', 'age'],
  tabHeaders: [
    ['name', 'amountRequired'],
    ['partsName', 'plantId'],
  ],
  endHeaders: [],
};

const parentHeaders: ParentHeader[] = [
  {
    id: 'parent1',
    colspan: 2,
    headerElement: <div>基本情報</div>,
  },
  {
    id: 'parent2',
    colspan: 2,
    headerElement: (
      <div>
        追加情報
        <Tab activeTabIndex={1} onSelect={useState} tabs={['aa', 'bb']} />
      </div>
    ),
  },
];

const columns: Column<DataType>[] = [
  {
    id: 'id',
    headerElement: <>ID</>,
  },
  {
    id: 'name',
    headerElement: <>名前</>,
  },
  {
    id: 'age',
    headerElement: <>年齢</>,
  },
  {
    id: 'address',
    headerElement: <>住所</>,
  },
  {
    id: 'partsName',
    headerElement: <>部品名</>,
  },
  {
    id: 'supportPartsName',
    headerElement: <>部品項目</>,
  },
  {
    id: 'plantId',
    headerElement: <>事業所名</>,
  },
  {
    id: 'traceId',
    headerElement: <>トレース識別子</>,
  },
  {
    id: 'amountRequired',
    headerElement: <>活動量</>,
  },
];

const rows: DataType[] = [
  {
    id: '1',
    name: 'aaa',
    age: 10,
    address: 'a1b2c3',
    amountRequired: 'aaa',
    partsName: 'bbb',
    plantId: 'ccc',
    status: 'ddd',
    supportPartsName: 'eee',
    traceId: 'fff',
    upstreamOperatorId: 'ggg',
  },
  {
    id: '2',
    name: 'bbb',
    age: 20,
    address: 'a1b2c3',
    amountRequired: 'aaa',
    partsName: 'bbb',
    plantId: 'ccc',
    status: 'ddd',
    supportPartsName: 'eee',
    traceId: 'fff',
    upstreamOperatorId: 'ggg',
  },
  {
    id: '3',
    name: 'ccc',
    age: 30,
    address: 'a1b2c3',
    amountRequired: 'aaa',
    partsName: 'bbb',
    plantId: 'ccc',
    status: 'ddd',
    supportPartsName: 'eee',
    traceId: 'fff',
    upstreamOperatorId: 'ggg',
  },
  {
    id: '4',
    name: 'ddd',
    age: 40,
    address: 'a1b2c3',
    amountRequired: 'aaa',
    partsName: 'bbb',
    plantId: 'ccc',
    status: 'ddd',
    supportPartsName: 'eee',
    traceId: 'fff',
    upstreamOperatorId: 'ggg',
  },
  {
    id: '5',
    name: 'eee',
    age: 50,
    address: 'a1b2c3',
    amountRequired: 'aaa',
    partsName: 'bbb',
    plantId: 'ccc',
    status: 'ddd',
    supportPartsName: 'eee',
    traceId: 'fff',
    upstreamOperatorId: 'ggg',
  },
  {
    id: '6',
    name: 'fff',
    age: 60,
    address: 'a1b2c3',
    amountRequired: 'aaa',
    partsName: 'bbb',
    plantId: 'ccc',
    status: 'ddd',
    supportPartsName: 'eee',
    traceId: 'fff',
    upstreamOperatorId: 'ggg',
  },
  {
    id: '7',
    name: 'ggg',
    age: 70,
    address: 'a1b2c3',
    amountRequired: 'aaa',
    partsName: 'bbb',
    plantId: 'ccc',
    status: 'ddd',
    supportPartsName: 'eee',
    traceId: 'fff',
    upstreamOperatorId: 'ggg',
  },
];

export const Primary: Story = {
  args: {
    parentHeaders: parentHeaders,
    headerForTabs: headerForTabs,
    activeTabIndex: 0,
    columns: columns,
    rows: rows,
    keyOfRowID: 'id',
  },
};
