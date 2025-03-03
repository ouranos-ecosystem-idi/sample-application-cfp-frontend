'use client';
import {
  Column,
  DataTable,
  ParentHeader,
} from '@/components/molecules/DataTable';
import { Button } from '@/components/atoms/Button';
import LevelIcon from '@/components/atoms/LevelIcon';
import SectionHeader from '@/components/molecules/SectionHeader';
import Link from 'next/link';
import { RadioButton } from '@phosphor-icons/react/dist/ssr/RadioButton';
import { Circle } from '@phosphor-icons/react/dist/ssr/Circle';
import { ComponentProps, useEffect, useMemo, useState } from 'react';
import { PartsWithCfpDataType, Plant } from '@/lib/types';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';
import { isEmpty, sum } from '@/lib/utils';
import { PlantCell } from './PlantCell';
import Pagination from '@/components/atoms/Pagination';
import SkeletonColumn from '@/components/atoms/SkeletonColumn';

function RegisterPartsButton() {
  return (
    <Link href='/parts/register'>
      <Button>新規部品登録</Button>
    </Link>
  );
}

type buttonProps = {
  traceId?: string;
};
function RequestCfpButton({ traceId }: buttonProps) {
  return (
    <Link
      href={{
        pathname: '/parts/request-cfp',
        query: { 'trace-id': traceId ?? '' },
      }}
    >
      <Button disabled={traceId === undefined}>CFP算出依頼</Button>
    </Link>
  );
}

function RegisterCfpButton({ traceId }: buttonProps) {
  return (
    <Link
      href={{
        pathname: '/parts/register-cfp',
        query: { 'trace-id': traceId ?? '' },
      }}
    >
      <Button disabled={traceId === undefined}>CFP参照・登録</Button>
    </Link>
  );
}

type Props = {
  partsWithCfpData?: PartsWithCfpDataType[];
  plants: Plant[];
  isPartsLoading: boolean;
  isCfpDataLoading: boolean;
  paginationProps: ComponentProps<typeof Pagination>;
};

type PartsTableRowType = PartsWithCfpDataType['parts'] & PartsWithCfpDataType['cfps'] & { level: number; selected: boolean; };

export default function PartsTable({
  partsWithCfpData = [],
  plants = [],
  paginationProps,
  isPartsLoading,
  isCfpDataLoading,
}: Props) {
  const [selectedRow, setSelectedRow] = useState<number | undefined>(undefined);
  useEffect(() => {
    setSelectedRow(undefined);
  }, [paginationProps.history]);

  const parentHeaders: ParentHeader[] = [
    {
      id: 'partsInfo',
      colspan: 6,
      headerElement: '部品構成情報',
    },
    {
      id: 'cfpInfo',
      colspan: 2,
      headerElement: 'CFP情報',
    },
  ];
  const columns: Column<PartsTableRowType>[] = [
    {
      id: 'selected',
      headerElement: '選択',
      justify: 'center',
      width: 24,
      renderCell: (value, row, rowIdx) =>
        value ? (
          <RadioButton size='18' weight='fill' className='fill-primary' />
        ) : (
          <Circle
            size='18'
            className='fill-primary cursor-pointer'
            onClick={() => setSelectedRow(rowIdx)}
          />
        ),
    },
    {
      id: 'level',
      headerElement: 'レベル',
      width: 36,
      justifyHeader: 'center',
      justify: 'center',
      renderCell: () => <LevelIcon level={1} />,
    },
    {
      id: 'partsName',
      headerElement: '部品項目',
      width: 140,
      renderCell: (value) => (
        <span className='text-sm font-semibold'>{value}</span>
      ),
    },
    {
      id: 'supportPartsName',
      headerElement: '補助項目',
      width: 72,
      renderCell: (value) =>
        isEmpty(value) ? (
          <DisplayHyphen />
        ) : (
          <span className='text-sm font-semibold'>{value}</span>
        ),
    },
    {
      id: 'plantId',
      headerElement: (
        <div>
          事業所名
          <br />
          事業所識別子
        </div>
      ),
      width: 140,
      renderCell: (value) => (
        <PlantCell plantId={value} plants={plants} size='sm' />
      ),
    },
    {
      id: 'traceId',
      headerElement: 'トレース識別子',
      width: 272,
      divideAfter: true,
      renderCell: (value) => (
        <Link
          href={{ pathname: '/parts/detail', query: { 'trace-id': value } }}
          className='text-link-blue underline'
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </Link>
      ),
    },
    {
      id: 'preProductionTotal',
      headerElement: (
        <div>
          原材料取得及び前処理
          <br />
          排出量(単位)
        </div>
      ),
      width: 256,
      justifyHeader: 'center',
      justify: 'end',
      renderCell: (_, row) => {
        if (isCfpDataLoading) return <SkeletonColumn className='py-2' />;
        else if (
          isEmpty(row.preProductionTotal) ||
          isEmpty(row.preComponentTotal)
        )
          return <DisplayHyphen />;
        else
          return (
            <div>
              <span className='font-semibold'>
                {sum(
                  row.preProductionTotal?.emission,
                  row.preComponentTotal?.emission
                )}
              </span>
              <span className='font-normal text-[10px] ml-1'>
                {row.preProductionTotal?.unit}
              </span>
            </div>
          );
      },
    },
    {
      id: 'mainProductionTotal',
      headerElement: (
        <div>
          主な製造
          <br />
          排出量(単位)
        </div>
      ),
      width: 256,
      justifyHeader: 'center',
      justify: 'end',
      renderCell: (_, row) => {
        if (isCfpDataLoading) return <SkeletonColumn className='py-2' />;
        else if (
          isEmpty(row.mainProductionTotal) ||
          isEmpty(row.mainComponentTotal)
        )
          return <DisplayHyphen />;
        else
          return (
            <div>
              <span className='font-semibold'>
                {sum(
                  row.mainProductionTotal?.emission,
                  row.mainComponentTotal?.emission
                )}
              </span>
              <span className='font-normal text-[10px] ml-1'>
                {row.mainProductionTotal?.unit}
              </span>
            </div>
          );
      },
    },

  ];

  const rows: PartsTableRowType[] = useMemo(
    () =>
      partsWithCfpData.map((row, index) => ({
        selected: index === selectedRow,
        ...row.parts,
        ...row.cfps,
      })),
    [selectedRow, partsWithCfpData]
  );
  return (
    <div className='flex flex-col h-full flex-1'>
      <SectionHeader
        stickyOptions={{ top: 84 }}
        className='pt-1'
        leftChildren={[<RegisterPartsButton key='regParts' />]}
        rightChildren={[
          <RequestCfpButton
            key='reqCfp'
            traceId={
              selectedRow === undefined
                ? undefined
                : partsWithCfpData?.[selectedRow]?.parts.traceId
            }
          />,
          <RegisterCfpButton
            key='regCfp'
            traceId={
              selectedRow === undefined
                ? undefined
                : partsWithCfpData?.[selectedRow]?.parts.traceId
            }
          />,
          <Pagination
            key='page'
            className='absolute z-5 top-[60px]'
            {...paginationProps}
          />,
        ]}
      />
      <div className='pt-5' />
      <DataTable
        edgePaddingX={16}
        columnsGapX={16}
        rowHeight={64}
        parentHeaders={parentHeaders}
        columns={columns}
        rows={rows}
        keyOfRowID='traceId'
        onClickRow={(rowId, rowIndex) => {
          setSelectedRow(rowIndex);
        }}
        stickyOptions={{ top: 148, beforeHeight: 'h-96' }}
        isLoading={isPartsLoading}
      />
    </div>
  );
}
