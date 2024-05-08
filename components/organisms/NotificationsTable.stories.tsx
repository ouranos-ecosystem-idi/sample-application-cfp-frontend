import type { Meta, StoryObj } from '@storybook/react';
import NotificationsTable from './NotificationsTable';
import {
  NotificationDataType,
  Operator,
  Plant,
  Parts,
  PartsWithoutLevel,
} from '@/lib/types';
import Tab from '@/components/atoms/Tab';
import { ReactNode, useState } from 'react';
import { NetworkError } from '@/api/networkErrors';

const meta = {
  title: 'Components/Organisms/NotificationsTable',
  component: NotificationPage,
} satisfies Meta<typeof NotificationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const notificationsData: NotificationDataType[] = [
  {
    notificationId: '1a0a51e8-d769-4b09-b75c-b97bd5dc5ab1',
    notificationType: 'REQUEST_NEW',
    notifiedFromOperatorId: 'a1234567-1234-1234-1234-123456789012',
    tradeRelation: {
      downstreamTraceId: '94078880-cfc3-43db-931b-84downstream',
      upstreamTraceId: undefined,
    },
    notifiedAt: new Date('2024-02-07T11:43:51Z'),
  },
  {
    notificationId: '1a0a51e8-d769-4b09-b75c-b97bd5dc5ab2',
    notificationType: 'REQUEST_CANCELED',
    notifiedFromOperatorId: 'a1234567-1234-1234-1234-123456789012',
    tradeRelation: {
      downstreamTraceId: '94078880-cfc3-43db-931b-84downstream',
      upstreamTraceId: 'a85e4e5c-e8c9-4f7f-a9c1-475d85df5b1e2',
    },
    notifiedAt: new Date('2024-02-06T11:43:51Z'),
  },
  {
    notificationId: '1a0a51e8-d769-4b09-b75c-b97bd5dc5ab3',
    notificationType: 'CFP_RESPONSED',
    notifiedFromOperatorId: 'a1234567-1234-1234-1234-123456789012',
    tradeRelation: {
      downstreamTraceId: 'f85e4e5c-e8c9-4f7f-a9c1-475d85df5b1e',
      upstreamTraceId: '94078880-cfc3-43db-931b-8410upstream',
    },
    notifiedAt: new Date('2024-02-06T11:43:51Z'),
  },
  {
    notificationId: '1a0a51e8-d769-4b09-b75c-b97bd5dc5ab4',
    notificationType: 'CFP_UPDATED',
    notifiedFromOperatorId: 'a1234567-1234-1234-1234-123456789012',
    tradeRelation: {
      downstreamTraceId: 'idToNetWorkError',
      upstreamTraceId: '94078880-cfc3-43db-931b-8410upstream',
    },
    notifiedAt: new Date('2024-02-06T11:43:51Z'),
  },
  {
    notificationId: '1a0a51e8-d769-4b09-b75c-b97bd5dc5ab5',
    notificationType: 'REQUEST_REJECTED',
    notifiedFromOperatorId: 'a1234567-1234-1234-1234-123456789012',
    tradeRelation: {
      downstreamTraceId: 'idToApiError',
      upstreamTraceId: '94078880-cfc3-43db-931b-8410upstream',
    },
    notifiedAt: new Date('2024-02-06T11:43:51Z'),
  },
  {
    notificationId: '1a0a51e8-d769-4b09-b75c-b97bd5dc5ab6',
    notificationType: 'REQUEST_REJECTED',
    notifiedFromOperatorId: 'a1234567-1234-1234-1234-123456789012',
    tradeRelation: {
      downstreamTraceId: 'idToApiResponseEmpty',
      upstreamTraceId: '94078880-cfc3-43db-931b-8410upstream',
    },
    notifiedAt: new Date('2024-02-06T11:43:51Z'),
  },
];

const operatorsData: Operator[] = [
  {
    operatorId: 'a1234567-1234-1234-1234-123456789012',
    openOperatorId: '1234567890139',
    operatorName: '化学A社',
  },
  {
    operatorId: '718263ee-2ffc-42a1-1b93-a58f95600c74',
    openOperatorId: '987654321',
    operatorName: '化学B社',
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

type Props = {
  notificationsData: NotificationDataType[];
  partsData: PartsWithoutLevel[];
  operatorsData: Operator[];
  plants: Plant[];
  tab: ReactNode;
  onMouseEnter: (traceId: string) => Promise<void>;
  isLoading: boolean;
};

function NotificationPage({
  notificationsData,
  operatorsData,
  plants,
}: Props) {
  const [partsData, setPartsData] = useState<{
    [key: string]: PartsWithoutLevel;
  }>({});

  async function onMouseEnter(traceId: string) {
    function getParts(): Parts | undefined {
      const parts: Parts[] = [
        {
          traceId: 'f85e4e5c-e8c9-4f7f-a9c1-475d85df5b1e',
          operatorId: '718263ee-2ffc-42a1-1b93-a58f95600c74',
          plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e0',
          partsName: '00_部品00A',
          supportPartsName: 'modelAAA',
          terminatedFlag: false,
          amountRequired: null,
          amountRequiredUnit: 'kilogram',
          level: 1,
        },
        {
          traceId: 'a85e4e5c-e8c9-4f7f-a9c1-475d85df5b1e2',
          operatorId: '718263ee-2ffc-42a1-1b93-a58f95600c74',
          plantId: '4c85796c-6f1e-43b0-9190-abbd4be809e1',
          partsName: '00_部品00B',
          supportPartsName: 'modelBBB',
          terminatedFlag: false,
          amountRequired: null,
          amountRequiredUnit: 'kilogram',
          level: 1,
        },
      ];
      if (traceId === 'idToNetWorkError') {
        throw new NetworkError('network error');
      }
      return parts.find((d) => d.traceId === traceId);
    }

    const maybeParts = getParts();
    if (maybeParts === undefined) return;
    setPartsData({ ...partsData, [traceId]: maybeParts });
  }

  return (
    <NotificationsTable
      onMouseEnter={onMouseEnter}
      notificationsData={notificationsData}
      partsData={partsData}
      operatorsData={operatorsData}
      plants={plants}
      isNotificationLoading={false}
    />
  );
}

export const Primary: Story = {
  args: {
    onMouseEnter: async () => { },
    notificationsData,
    partsData: [],
    operatorsData,
    plants,
    tab: (
      <Tab
        key='tab'
        tabs={['依頼先', '依頼元']}
        className='mb-2'
        width={80}
        activeTabIndex={1}
        onSelect={() => {
          return;
        }}
      />
    ),
    isLoading: false,
  },
};
