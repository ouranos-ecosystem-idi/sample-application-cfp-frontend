'use client';
import { PartsWithCfpDataType, PartsWithoutLevel, Plant } from '@/lib/types';
import { ComponentProps, useEffect, useState } from 'react';
import { Column, DataTable } from '@/components/molecules/DataTable';
import { isEmpty, sum } from '@/lib/utils';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';
import { RadioButton } from '@phosphor-icons/react/dist/ssr/RadioButton';
import { Circle } from '@phosphor-icons/react/dist/ssr/Circle';
import SectionHeader from '@/components/molecules/SectionHeader';
import { Button } from '@/components/atoms/Button';
import Link from 'next/link';
import PopupModal from '@/components/molecules/PopupModal';
import { PlantCell } from '@/components/organisms/PlantCell';
import { usePathname, useSearchParams } from 'next/navigation';
import SkeletonColumn from '@/components/atoms/SkeletonColumn';
import Pagination from '@/components/atoms/Pagination';

const EDGE_PADDING_X = 16;
const COLUMNS_GAP_X = 16;
const ROW_HEIGHT = 64;

type Props = {
  requestedParts?: PartsWithoutLevel;
  linkedPartsWithCfp?: PartsWithCfpDataType;
  unlinkedPartsWithCfp?: PartsWithCfpDataType[];
  plants: Plant[];
  statusId: string | null;
  onLinkParts: (traceId: string) => void;
  isLinkPartsLoading: boolean;
  isUnLinkPartsLoading: boolean;
  isCfpLoading: boolean;
  isUnLinkedCfpLoading: boolean;
  paginationProps: ComponentProps<typeof Pagination>;
};
export default function PartsTableForLinkParts({
  requestedParts,
  linkedPartsWithCfp,
  unlinkedPartsWithCfp = [],
  plants = [],
  statusId,
  onLinkParts,
  isLinkPartsLoading,
  isUnLinkPartsLoading,
  isCfpLoading,
  isUnLinkedCfpLoading,
  paginationProps,
}: Props) {
  const [selectedRow, setSelectedRow] = useState<number | undefined>(undefined);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);

  useEffect(() => {
    setSelectedRow(undefined);
  }, [paginationProps.history]);

  const commonColumns: Column<
    PartsWithCfpDataType['parts'] & PartsWithCfpDataType['cfps']
  >[] = [
      {
        id: 'partsName',
        headerElement: '部品項目',
        width: 120,
      },
      {
        id: 'supportPartsName',
        headerElement: '補助項目',
        width: 60,
        renderCell: (value) => (isEmpty(value) ? <DisplayHyphen /> : value),
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
        width: 204,
        renderCell: (value) => (
          <PlantCell plantId={value} plants={plants} size='sm' />
        ),
      },
      {
        id: 'traceId',
        headerElement: 'トレース識別子',
        width: 276,
        renderCell: (value) => (
          <Link
            href={{
              pathname: './parts-detail/',
              query: { 'trace-id': value, 'status-id': statusId },
            }}
            className='text-link-blue underline'
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </Link>
        ),
      },
      {
        id: 'amountRequiredUnit',
        headerElement: '単位',
        divideAfter: true,
        width: 80,
        renderCell: (value) => {
          return <div className='text-xs'>{value}</div>;
        },
      },
    ];

  const linkedPartsColumns: Column<
    PartsWithCfpDataType['parts'] &
    PartsWithCfpDataType['cfps'] & { selected: void; }
  >[] = [
      {
        id: 'selected',
        headerElement: '選択',
        justify: 'center',
        renderCell: () =>
          selectedRow === undefined ? (
            <RadioButton size='18' weight='fill' className='fill-primary' />
          ) : (
            <Circle
              size='18'
              className='fill-primary cursor-pointer'
              onClick={() => setSelectedRow(undefined)}
            />
          ),
        width: 24,
      },
      ...commonColumns,
      {
        id: 'preProductionTotal',
        headerElement: (
          <div>
            原材料取得及び前処理
            <br />
            排出量(単位)
          </div>
        ),
        width: 216,
        justifyHeader: 'center',
        renderCell: (_, row) => {
          if (isCfpLoading) return <SkeletonColumn className='py-2' />;
          else if (
            isEmpty(row.preProductionTotal) ||
            isEmpty(row.preComponentTotal)
          )
            return <DisplayHyphen />;
          else
            return (
              <div className='flex'>
                <div className='w-[108px] text-xs text-right'>
                  {sum(
                    row.preProductionTotal?.emission,
                    row.preComponentTotal?.emission
                  )}
                </div>
                <div className='ml-1 w-[104px] text-[10px]'>
                  {row.preProductionTotal?.unit}
                </div>
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
        width: 216,
        justifyHeader: 'center',
        renderCell: (_, row) => {
          if (isCfpLoading) return <SkeletonColumn className='py-2' />;
          else if (
            isEmpty(row.mainProductionTotal) ||
            isEmpty(row.mainComponentTotal)
          )
            return <DisplayHyphen />;
          else
            return (
              <div className='flex'>
                <div className='w-[108px] text-xs text-right'>
                  {sum(
                    row.mainProductionTotal?.emission,
                    row.mainComponentTotal?.emission
                  )}
                </div>
                <div className='ml-1 w-[104px] text-[10px]'>
                  {row.mainProductionTotal?.unit}
                </div>
              </div>
            );
        },
      },

    ];

  const unlinkedPartsColumns: Column<
    PartsWithCfpDataType['parts'] &
    PartsWithCfpDataType['cfps'] & { selected: void; }
  >[] = [
      {
        id: 'selected',
        headerElement: '選択',
        justify: 'center',
        renderCell: (value, row, rowIdx) =>
          selectedRow === rowIdx ? (
            <RadioButton size='18' weight='fill' className='fill-primary' />
          ) : (
            <Circle
              size='18'
              className='fill-primary cursor-pointer'
              onClick={() => setSelectedRow(rowIdx)}
            />
          ),
        width: 24,
      },
      ...commonColumns,

      {
        id: 'preProductionTotal',
        headerElement: (
          <div>
            原材料取得及び前処理
            <br />
            排出量(単位)
          </div>
        ),
        width: 216,
        justifyHeader: 'center',
        renderCell: (_, row) => {
          if (isUnLinkedCfpLoading) return <SkeletonColumn className='py-2' />;
          else if (
            isEmpty(row.preProductionTotal) ||
            isEmpty(row.preComponentTotal)
          )
            return <DisplayHyphen />;
          else
            return (
              <div className='flex'>
                <div className='w-[108px] text-xs text-right'>
                  {sum(
                    row.preProductionTotal?.emission,
                    row.preComponentTotal?.emission
                  )}
                </div>
                <div className='ml-1 w-[104px] text-[10px]'>
                  {row.preProductionTotal?.unit}
                </div>
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
        width: 216,
        justifyHeader: 'center',
        renderCell: (_, row) => {
          if (isUnLinkedCfpLoading) return <SkeletonColumn className='py-2' />;
          else if (
            isEmpty(row.mainProductionTotal) ||
            isEmpty(row.mainComponentTotal)
          )
            return <DisplayHyphen />;
          else
            return (
              <div className='flex'>
                <div className='w-[108px] text-xs text-right'>
                  {sum(
                    row.mainProductionTotal?.emission,
                    row.mainComponentTotal?.emission
                  )}
                </div>
                <div className='ml-1 w-[104px] text-[10px]'>
                  {row.mainProductionTotal?.unit}
                </div>
              </div>
            );
        },
      },

    ];

  return (
    <>
      <div className='flex flex-col gap-4 '>
        <SectionHeader title='紐付け済み自社部品情報' variant='h2' />
        <DataTable
          className={`${linkedPartsWithCfp || isLinkPartsLoading ? 'mb-10' : ''}`}
          edgePaddingX={EDGE_PADDING_X}
          columnsGapX={COLUMNS_GAP_X}
          rowHeight={ROW_HEIGHT}
          columns={linkedPartsColumns}
          rows={
            linkedPartsWithCfp
              ? [{ ...linkedPartsWithCfp.parts, ...linkedPartsWithCfp.cfps }]
              : []
          }
          keyOfRowID='traceId'
          onClickRow={() => setSelectedRow(undefined)}
          emptyStateMessage='紐づけされている部品はありません'
          isLoading={isLinkPartsLoading}
        />
      </div>
      <div className='flex flex-col gap-4  flex-1'>
        <div className='sticky top-14 z-30 mr-0 ml-auto'>
          <Button
            key='link-button'
            onClick={() => {
              if (selectedRow !== undefined && requestedParts !== undefined) {
                if (
                  unlinkedPartsWithCfp[selectedRow].parts.amountRequiredUnit ===
                  requestedParts.amountRequiredUnit
                ) {
                  setIsConfirmModalOpen(true);
                } else {
                  // 依頼元の部品と部品の単位が一致しない場合別モーダルを表示
                  setIsValidateModalOpen(true);
                }
              }
            }}
            disabled={selectedRow === undefined || requestedParts === undefined}
          >
            紐付け
          </Button>
        </div>
        <SectionHeader
          title='紐付けする自社部品情報'
          variant='h2'
          rightChildren={[<Pagination key='page' {...paginationProps} />]}
          align='bottom'
          stickyOptions={{ top: 114 }}
        />
        <DataTable
          edgePaddingX={EDGE_PADDING_X}
          columnsGapX={COLUMNS_GAP_X}
          rowHeight={ROW_HEIGHT}
          columns={unlinkedPartsColumns}
          rows={unlinkedPartsWithCfp.map((p) => ({ ...p.parts, ...p.cfps }))}
          keyOfRowID='traceId'
          onClickRow={(rowId, rowIndex) => {
            setSelectedRow(rowIndex);
          }}
          stickyOptions={{ top: 160, beforeHeight: 'h-32' }}
          isLoading={isUnLinkPartsLoading}
          skeletonProperty={{ height: 'calc(100vh - 272px)' }}
        />
      </div>
      <PopupModal
        button={
          <Button
            color='primary'
            variant='solid'
            size='default'
            key='confirm'
            type='button'
            onClick={() => {
              if (selectedRow === undefined) return;
              const traceId = unlinkedPartsWithCfp[selectedRow].parts.traceId;
              traceId !== undefined && onLinkParts(traceId);
              setIsConfirmModalOpen(false);
            }}
            disabled={selectedRow === undefined}
          >
            紐付け
          </Button>
        }
        isOpen={isConfirmModalOpen}
        setIsOpen={setIsConfirmModalOpen}
        title={`選択した部品と紐付けますか？`}
      >
        <p>※部品紐付けすると取引先にCFP情報・証明書が開示されます。</p>
      </PopupModal>
      <PopupModal
        button={
          <Link
            href={{
              pathname: '/parts/register',
              query: { backurl: `${pathname}?${searchParams}` },
            }}
          >
            <Button color='primary' variant='solid' size='default'>
              部品を登録
            </Button>
          </Link>
        }
        isOpen={isValidateModalOpen}
        setIsOpen={setIsValidateModalOpen}
        title='部品紐づけができません。'
      >
        <p>
          ※依頼元指定の単位と一致しません。依頼元単位と合わせて新規部品登録をしてください。
        </p>
      </PopupModal>
    </>
  );
}
