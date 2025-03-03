'use client';

import { Button } from '@/components/atoms/Button';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';
import Pagination from '@/components/atoms/Pagination';
import StatusBadge from '@/components/atoms/StatusBadge';
import Tooltip from '@/components/atoms/Tooltip';
import {
  Column,
  DataTable,
  ParentHeader,
} from '@/components/molecules/DataTable';
import PopupModal from '@/components/molecules/PopupModal';
import TooltipDetailInfoHorizontal from '@/components/molecules/TooltipDetailInfoHorizontal';
import {
  Operator,
  PartsWithoutLevel,
  TradeResponseDataType,
} from '@/lib/types';
import { isEmpty, tradeResponseStatusAttributes } from '@/lib/utils';
import { Info } from '@phosphor-icons/react';
import { ChatCenteredText } from '@phosphor-icons/react/dist/ssr';
import { ComponentProps, useCallback, useMemo, useState } from 'react';

function getColumns(
  gotoLinkPartsPage: ComponentProps<typeof RequestsTable>['onPartsSelection'],
  handleRejectClick: (rowIndex: number) => void,
): Column<
  TradeResponseDataType & {
    openOperatorInfo?: Operator;
    selectButton: void;
    rejectButton: void;
    downstreamPart: PartsWithoutLevel;
  }
>[] {
  return [
    {
      id: 'status',
      headerElement: 'ステータス',
      width: 72,
      justifyHeader: 'center',
      justify: 'center',
      renderCell: (value) => (
        <span className='text-xs font-normal break-all'>
          <StatusBadge
            color={tradeResponseStatusAttributes[value].badgeColor}
            text={tradeResponseStatusAttributes[value].label}
          />
        </span>
      ),
    },
    {
      id: 'downstreamOperatorId',
      headerElement: (
        <div>
          事業者名
          <br />
          事業者識別子
        </div>
      ),
      width: 200,
      renderCell: (value, row) => (
        <div className='font-normal break-all'>
          <span className='text-xs line-clamp-1'>
            {row.openOperatorInfo?.operatorName ?? ''}
          </span>
          <span className='text-xs line-clamp-1'>
            {row.openOperatorInfo?.openOperatorId ?? ''}
          </span>
        </div>
      ),
    },
    {
      id: 'downstreamPart',
      headerElement: '部品項目',
      width: 110,
      renderCell: (value) =>
        isEmpty(value.partsName) ? (
          <DisplayHyphen className='text-xs ' />
        ) : (
          <span className='text-xs font-normal break-all '>
            {value.partsName}
          </span>
        ),
    },
    {
      id: 'downstreamPart',
      headerElement: '補助項目',
      width: 110,
      renderCell: (value) =>
        isEmpty(value.supportPartsName) ? (
          <DisplayHyphen className='text-xs ' />
        ) : (
          <span className='text-xs font-normal break-all '>
            {value.supportPartsName}
          </span>
        ),
    },
    {
      id: 'responseDueDate',
      headerElement: '回答希望日',
      width: 110,
      renderCell: (value) =>
        isEmpty(value) ? (
          <DisplayHyphen className='text-xs ' />
        ) : (
          <span className='text-xs font-normal break-all'>
            {value!.replaceAll('-', '/')}
          </span>
        ),
    },
    {
      id: 'downstreamTraceId',
      headerElement: '',
      width: 24,
      renderCell: (value) => (
        <TooltipDetailInfoHorizontal
          data={[
            {
              header: 'トレース識別子',
              value,
            },
          ]}
          position='center'
          triangle='center'
        >
          <div className='fill-primary'>
            <Info size='24' color='fill-primary' />
          </div>
        </TooltipDetailInfoHorizontal>
      ),
    },
    {
      id: 'message',
      headerElement: '',
      divideAfter: true,
      width: 24,
      renderCell: (value) => {
        return value ? (
          <Tooltip
            message={
              <>
                <div className='font-semibold mb-2 text-xs text-white'>メッセージ</div>
                <div className='font-normal text-xs text-white truncate ... max-w-[250px]'>
                  {isEmpty(value) ? <DisplayHyphen className='text-xs' /> : value}
                </div>
              </>
            }
          >
            <div className='fill-primary'>
              <ChatCenteredText size='24' color='fill-primary' />
            </div>
          </Tooltip>
        ) : (
          <div className='fill-neutral'>
            <ChatCenteredText size='24' color='fill-neutral' />
          </div>
        );
      },
    },
    {
      id: 'upstreamTraceId',
      headerElement: 'トレース識別子',
      width: 312,
      renderCell: (value) =>
        value === null || isEmpty(value) ? (
          <DisplayHyphen className='text-xs ' />
        ) : (
          <span className='text-s font-normal break-all '>{value}</span>
        ),
    },
    {
      id: 'selectButton',
      headerElement: '',
      width: 80,
      renderCell: (_, { statusId }) => {
        return (
          <Button
            size='tight'
            className='text-xs h-8 w-20'
            onClick={() => statusId && gotoLinkPartsPage(statusId)}
          >
            部品選択
          </Button>
        );
      },
    },
    {
      id: 'rejectButton',
      headerElement: '',
      width: 80,
      renderCell: (_, row, index) => {
        return (
          <Button
            className='text-xs h-8 w-20'
            size='tight'
            color='error'
            variant='outline'
            onClick={() => handleRejectClick(index)}
            disabled={row.status !== 'incomplete'}
          >
            差戻し
          </Button>
        );
      },
    },
  ];
}

const parentHeaders: ParentHeader[] = [
  {
    id: 'requestInfo',
    colspan: 7,
    headerElement: '依頼情報',
  },
  {
    id: 'cfpInfo',
    colspan: 5,
    headerElement: '自社部品情報',
  },
];

type Props = {
  isTradeRequestLoading: boolean;
  items: Omit<TradeResponseDataType, 'upstreamPart'>[];
  operatorsData: Operator[];
  onPartsSelection: (statusId: string) => void;
  onRejectTradeRequest: (tradeResponse: TradeResponseDataType) => void;
  paginationProps: ComponentProps<typeof Pagination>;
};

export default function RequestsTable({
  isTradeRequestLoading,
  items,
  onPartsSelection,
  operatorsData,
  onRejectTradeRequest,
  paginationProps,
}: Props) {
  const itemsWithAdditionalData = items.map((item) => {
    return {
      ...item,
      openOperatorInfo: operatorsData.find(
        (op) => op.operatorId === item.downstreamOperatorId
      ),
    };
  });

  const [tradeRequestToReject, setTradeRequestToReject] =
    useState<TradeResponseDataType>();

  const handleRejectClick = useCallback((rowIndex: number) => {
    setTradeRequestToReject(itemsWithAdditionalData[rowIndex]);
  }, [itemsWithAdditionalData]);

  const columns = useMemo(
    () => getColumns(onPartsSelection, handleRejectClick),
    [onPartsSelection, handleRejectClick]
  );

  return (
    <>
      <PopupModal
        button={
          <Button
            color='error'
            variant='solid'
            size='default'
            key='delete'
            type='button'
            onClick={() => {
              if (tradeRequestToReject) {
                onRejectTradeRequest(tradeRequestToReject);
                setTradeRequestToReject(undefined);
              }
            }}
          >
            差戻し
          </Button>
        }
        isOpen={tradeRequestToReject !== undefined}
        setIsOpen={() => { setTradeRequestToReject(undefined); }}
        title='依頼を差戻しますか？処理に時間がかかるため、時間をおいてから更新ボタンを押してください。'
      />
      <div className='sticky w-full top-[84px] z-20'>
        <Pagination className='absolute right-0 -top-2' {...paginationProps} />
      </div>
      <DataTable
        rowHeight={64}
        columns={columns}
        rows={itemsWithAdditionalData}
        keyOfRowID='tradeId'
        parentHeaders={parentHeaders}
        columnsGapX={28}
        edgePaddingX={16}
        stickyOptions={{ top: 84 }}
        isLoading={isTradeRequestLoading}
      />
    </>
  );
}
