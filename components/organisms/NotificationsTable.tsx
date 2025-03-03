import {
  NotificationDataType,
  NotificationTypes,
  Operator,
  Plant,
  Parts,
  PartsWithoutLevel,
} from '@/lib/types';
import { Column, DataTable } from '@/components/molecules/DataTable';
import { Info } from '@phosphor-icons/react/dist/ssr/Info';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';
import {
  classifyNotificationBySource,
  getNotificationTypeName,
  isEmpty,
} from '@/lib/utils';
import TooltipDetailInfoHorizontal from '@/components/molecules/TooltipDetailInfoHorizontal';
import { Fragment, useState } from 'react';
import Tooltip from '@/components/atoms/Tooltip';
import { APIError } from '@/api/apiErrors';
import { NetworkError } from '@/api/networkErrors';
import NotificationSourceIcon from '@/components/atoms/NotificationSourceIcon';

type Props = {
  notificationsData: NotificationDataType[];
  partsData: {
    [key: string]: PartsWithoutLevel;
  };
  operatorsData: Operator[];
  plants: Plant[];
  onMouseEnter: (traceId: string) => Promise<void>;
  isNotificationLoading: boolean;
};

function getRelatedTraceId(
  notificationType: NotificationTypes | undefined,
  tradeRelation: NotificationDataType['tradeRelation'] | undefined
) {
  if (!notificationType) return undefined;
  if (classifyNotificationBySource(notificationType) === 'respondent') {
    return tradeRelation?.downstreamTraceId ?? undefined;
  } else {
    return tradeRelation?.upstreamTraceId ?? undefined;
  }
}

export default function NotificationsTable({
  notificationsData = [],
  partsData = {},
  operatorsData = [],
  plants,
  onMouseEnter,
  isNotificationLoading,
}: Props) {
  const notificationsWithAdditionalData = notificationsData.map(
    (notificationData) => ({
      ...notificationData,
      partsInfo:
        partsData[
        getRelatedTraceId(
          notificationData.notificationType,
          notificationData.tradeRelation
        )!
        ],
      openOperatorInfo: operatorsData.find(
        (op) => op.operatorId === notificationData.notifiedFromOperatorId
      ),
    })
  );

  const [onMouseError, setOnMouseError] = useState<Error>();

  const [isTooltipLoadingStatusByTraceId, setIsTooltipLoadingStatusByTraceId] =
    useState<Record<string, boolean>>({});

  const columns: Column<
    NotificationDataType & {
      traceId: string;
      partsInfo?: Parts;
      openOperatorInfo?: Operator;
    }
  >[] = [
      {
        id: 'notificationType',
        headerElement: '通知元',
        width: 148,
        renderCell: (value) => {
          const notificationSource = classifyNotificationBySource(value);
          return (
            <>
              <NotificationSourceIcon
                notificationSource={notificationSource}
                size={20}
                className='stroke-default-text stroke-[1.5] mr-1'
              />
              <div className='font-semibold'>
                {notificationSource === 'respondent' ? '仕入先' : '納品先'}
              </div>
            </>
          );
        },
      },
      {
        id: 'notificationType',
        headerElement: '通知種別',
        width: 172,
        renderCell: (value) => (
          <div className='font-semibold text-sm'>
            {getNotificationTypeName(value)}
          </div>
        ),
      },
      {
        id: 'notifiedAt',
        headerElement: '通知日時(JST)',
        renderCell: (value) => (
          <div className='w-full text-sm'>
            {value.toLocaleString('ja-jp', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>
        ),
        width: 228,
      },
      {
        id: 'notifiedFromOperatorId',
        headerElement: (
          <div>
            事業者名
            <br />
            事業者識別子
          </div>
        ),
        renderCell: (value, row) => (
          <div className='w-full'>
            <span className='text-sm line-clamp-1'>
              {row.openOperatorInfo?.operatorName ?? ''}
            </span>
            <span className='text-sm line-clamp-1'>
              {row.openOperatorInfo?.openOperatorId ?? ''}
            </span>
          </div>
        ),
        width: 420,
      },
      {
        id: 'traceId',
        headerElement: 'トレース識別子',
        renderCell: (value, row) => (
          <div className='w-full text-sm'>
            {getRelatedTraceId(row.notificationType, row.tradeRelation) ?? (
              <DisplayHyphen />
            )}
          </div>
        ),
        width: 288,
      },
      {
        id: 'partsInfo',
        headerElement: <></>,
        width: 32,
        justify: 'center',
        renderCell: (value, row) => {
          const _traceId = getRelatedTraceId(
            row.notificationType,
            row.tradeRelation
          );
          const plant = plants.find(
            (plant) => plant.plantId === row.partsInfo?.plantId
          );
          function createPartsInfoInner(data?: {
            partsName: string;
            supportPartsName: string;
            plantName?: string;
            openPlantId?: string;
          }) {
            return [
              {
                header: '部品項目',
                value: data?.partsName ?? <DisplayHyphen className='text-white' />,
                width: 76,
              },
              {
                header: '補助項目',
                value: isEmpty(data?.supportPartsName) ? (
                  <DisplayHyphen className='text-white' />
                ) : (
                  data?.supportPartsName
                ),
                width: 76,
              },
              {
                header: '事業所名',
                value: data?.plantName ?? <DisplayHyphen className='text-white' />,
                width: 133,
              },
              {
                header: '事業所識別子',
                value: data?.openPlantId ?? <DisplayHyphen className='text-white' />,
                width: 87,
              },
            ];
          }
          async function _onMouseEnter(traceId: string) {
            setIsTooltipLoadingStatusByTraceId((prev) => ({
              ...prev,
              [traceId]: true,
            }));
            setOnMouseError(undefined);
            try {
              await onMouseEnter(traceId);
              setIsTooltipLoadingStatusByTraceId((prev) => ({
                ...prev,
                [traceId]: false,
              }));
            } catch (error) {
              setOnMouseError(error as Error);
            }
          }
          function info(isActive: boolean, traceId: string | undefined) {
            return (
              <Info
                size={28}
                className={isActive ? 'fill-primary' : 'fill-neutral'}
                onMouseEnter={
                  traceId === undefined ? undefined : () => _onMouseEnter(traceId)
                }
              />
            );
          }
          function cell() {
            if (_traceId === undefined) {
              return info(false, undefined);
            }
            if (value === undefined) {
              if (onMouseError === undefined) {
                const isPartsTooltipLoading =
                  isTooltipLoadingStatusByTraceId[_traceId] || false;
                return (
                  <TooltipDetailInfoHorizontal
                    data={createPartsInfoInner(undefined)}
                    isLoading={isPartsTooltipLoading}
                  >
                    {info(true, _traceId)}
                  </TooltipDetailInfoHorizontal>
                );
              }
              const [title, bodyStringArray] =
                onMouseError instanceof APIError ||
                  onMouseError instanceof NetworkError
                  ? [
                    onMouseError
                      .toTitleStringArray()
                      .reduce((pre, current) => pre + current),
                    onMouseError.toBodyStringArray(),
                  ]
                  : [[], []];
              return (
                <Tooltip
                  message={
                    <>
                      <div className='font-semibold mb-2 text-white'>{title}</div>
                      <div>
                        {bodyStringArray.map((s, i) => (
                          <Fragment key={i}>
                            {s}
                            <br />
                          </Fragment>
                        ))}
                      </div>
                    </>
                  }
                  position='left'
                  triangle='left'
                >
                  {info(true, _traceId)}
                </Tooltip>
              );
            }
            return (
              <TooltipDetailInfoHorizontal
                data={createPartsInfoInner({
                  partsName: value?.partsName ?? '',
                  supportPartsName: value?.supportPartsName ?? '',
                  plantName: plant?.plantName,
                  openPlantId: plant?.openPlantId,
                })}
              >
                {info(true, undefined)}
              </TooltipDetailInfoHorizontal>
            );
          }

          return <div className='w-full text-sm'>{cell()}</div>;
        },
      },
    ];

  return (
    <>
      <DataTable
        edgePaddingX={16}
        columnsGapX={8}
        rowHeight={64}
        columns={columns}
        rows={notificationsWithAdditionalData}
        keyOfRowID='notificationId'
        stickyOptions={{ top: 116 }}
        isLoading={isNotificationLoading}
      />
    </>
  );
}
