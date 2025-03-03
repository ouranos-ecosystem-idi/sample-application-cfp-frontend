'use client';
import { isEmpty } from '@/lib/utils';
import React, { ReactNode, useMemo } from 'react';
import { tv } from 'tailwind-variants';
export type ParentHeader = {
  id: string;
  colspan: number;
  headerElement: ReactNode;
};
export type HeaderForTabs<T> = {
  [Key in keyof T]-?: {
    startHeaders: Array<keyof T>;
    tabHeaders: Array<keyof T>[];
    endHeaders: Array<keyof T>;
  };
}[keyof T];
export type Column<T> = {
  [Key in keyof T]-?: {
    id: Extract<Key, string>;
    width?: number;
    headerElement: ReactNode;
    renderCell?: (value: T[Key], row: Partial<T>, rowIdx: number) => ReactNode;
    justifyHeader?: 'start' | 'center' | 'end';
    justify?: 'start' | 'center' | 'end';
    divideAfter?: boolean;
  };
}[keyof T];
const th = tv({
  base: 'p-0 h-11 bg-light-gray font-normal text-xs leading-4 [&_*]:text-xs [&_*]:leading-5',
});
const content = tv({
  base: 'relative flex flex-col',
  variants: {
    full: {
      true: 'flex-1',
      false: '',
    },
  },
});

const skeleton = tv({
  base: 'skeleton w-full relative bg-light-gray rounded',
  variants: {
    full: {
      true: 'flex-1',
      false: '',
    },
  },
});
const th_inner = tv({
  base: 'h-8 flex items-center w-full',
  variants: {
    divideAfter: {
      true: 'border-r border-r-gray',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
    },
  },
});
const tbody_tr = tv({
  base: 'bg-white [&:not(:last-child)>td>div]:border-b',
  variants: {
    disable: {
      true: 'bg-done-gray bg-opacity-25',
    },
  },
});
const td = tv({
  base: 'p-0 ',
});
const td_inner_1 = tv({
  base: 'flex w-full h-full items-center border-b-gray',
});
const td_inner_2 = tv({
  base: 'flex w-full h-full items-center text-xs break-all',
  variants: {
    divideAfter: {
      true: 'border-r border-r-gray',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
    },
  },
});

function getSkeltonHeightStyle(
  rowHeight: number,
  height?: string
): React.CSSProperties {
  if (height === undefined)
    return { height: 'auto', minHeight: `${rowHeight}px` };
  return { height: height };
}

function getLayoutStyle({
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  width,
  height,
}: {
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  width?: number;
  height?: number;
}) {
  return {
    ...(paddingTop && { paddingTop: `${paddingTop}px` }),
    ...(paddingRight && { paddingRight: `${paddingRight}px` }),
    ...(paddingBottom && { paddingBottom: `${paddingBottom}px` }),
    ...(paddingLeft && { paddingLeft: `${paddingLeft}px` }),
    ...(width && { width: `${width}px` }),
    ...(height && { height: `${height}px` }),
  };
}
type Props = {
  rowHeight?: number;
  parentHeaders?: ParentHeader[];
  columns: Column<{ [key: string]: any; }>[];
  activeTabIndex?: number;
  headerForTabs?: HeaderForTabs<{ [key: string]: any; }>;
  rows: { [key: string]: any; }[];
  keyOfRowID: string; // rowsの要素であるオブジェクトのキーのうち、全ての要素でuniqueなもの
  keyOfDeletedID?: string; // rowsの要素で削除済みかどうかを表すもの
  onClickRow?: (rowId: string, rowIdx: number) => void;
  edgePaddingX?: number;
  columnsGapX?: number;
  rowPaddingY?: number;
  className?: string;
  emptyStateMessage?: string;
  stickyOptions?: {
    top?: number;
    beforeHeight?: 'h-32' | 'h-96';
  };
  isLoading?: boolean;
  numberOfRow?: number;
  skeletonProperty?: { height?: string; };
  tableWidth?: number;
};
// tabを使わない場合、すべてstartHeadersとして追加する
function getInitialHeaderForTabs(
  columns: Column<{ [key: string]: any; }>[]
): HeaderForTabs<{ [key: string]: any; }> {
  return {
    startHeaders: columns.map((column) => column.id),
    tabHeaders: [],
    endHeaders: [],
  };
}
export function DataTable({
  rowHeight = 80,
  parentHeaders,
  columns = [],
  rows = [],
  keyOfRowID,
  keyOfDeletedID,
  onClickRow,
  activeTabIndex = 0,
  headerForTabs = getInitialHeaderForTabs(columns),
  edgePaddingX = 24,
  columnsGapX = 24,
  rowPaddingY = 8,
  className = '',
  emptyStateMessage = '登録されている情報はありません',
  stickyOptions,
  isLoading = false,
  skeletonProperty,
  tableWidth
}: Props) {
  // 行ID重複チェック
  if (
    rows.length !==
    Array.from(new Set(rows.map((row) => row[keyOfRowID]))).length
  ) {
    throw new Error('Duplicate row IDs or incorrect rowKey');
  }
  // activeTabIndexに応じて表示するカラムを変更
  const filteredColumns = useMemo(
    () => [
      ...columns.filter((column) =>
        headerForTabs.startHeaders.includes(column.id)
      ),
      ...columns.filter((column) =>
        headerForTabs.tabHeaders[activeTabIndex]?.includes(column.id)
      ),
      ...columns.filter((column) =>
        headerForTabs.endHeaders.includes(column.id)
      ),
    ],
    [activeTabIndex, columns, headerForTabs]
  );
  const stickyStyleClass: React.CSSProperties = stickyOptions
    ? {
      top: stickyOptions?.top + `px`,
      position: 'sticky',
    }
    : {};

  return (
    <>
      <div
        className={`${className} ${content({
          full: isLoading,
        })}`}
      >
        <table className={`table-auto ${tableWidth ? `w-[${tableWidth}px]` : 'w-full'}`}>
          <thead
            className={`after:table-row after:h-2 z-10 before:content-[""]
            before:absolute before:bottom-2 before:w-[1381px] before:left-[-2px]
            before:bg-[#FAFAFA] before:z-[-1] ${stickyOptions?.beforeHeight === 'h-32'
                ? 'before:h-32'
                : `before:h-96`
              }`}
            style={stickyStyleClass}
          >
            {parentHeaders && (
              <tr>
                {parentHeaders.map((parentHeader) => (
                  <th
                    key={parentHeader.id}
                    align='left'
                    colSpan={parentHeader.colspan}
                    className={'text-base font-semibold bg-[#FAFAFA] pb-3 '}
                  >
                    {parentHeader.headerElement}
                  </th>
                ))}
              </tr>
            )}
            <tr>
              {filteredColumns.map((column, index) => (
                <th
                  align='left'
                  key={index}
                  className={th()}
                  style={getLayoutStyle({
                    paddingLeft: index === 0 ? edgePaddingX : columnsGapX,
                    width: column.width
                      ? column.width +
                      // width指定がされている場合左側余白の幅を加える
                      (index === 0 ? edgePaddingX : columnsGapX) +
                      // divideAfterが指定されている場合さらに右側余白の幅を加える
                      (column.divideAfter ? columnsGapX : 0)
                      : undefined,
                  })}
                >
                  <div
                    className={th_inner({
                      divideAfter: column.divideAfter,
                      justify: column.justifyHeader,
                    })}
                    style={getLayoutStyle({
                      paddingRight: column.divideAfter
                        ? columnsGapX
                        : undefined,
                    })}
                  >
                    {column.headerElement}
                  </div>
                </th>
              ))}
              {/* 各Columnのwidth指定値を統一するため、最後の要素の右側のPaddingはダミー要素として追加 */}
              <th
                className={th() + ' w-0'}
                style={getLayoutStyle({ paddingLeft: edgePaddingX })}
              />
            </tr>
          </thead>
          {!isLoading && (
            <tbody className='shadow'>
              {rows.map((row, rowIndex) => (
                <tr
                  key={row[keyOfRowID]}
                  className={
                    tbody_tr({
                      disable:
                        keyOfDeletedID === undefined
                          ? false
                          : row[keyOfDeletedID],
                    }) + (onClickRow === undefined ? '' : ' cursor-pointer')
                  }
                  onClick={() => {
                    if (onClickRow !== undefined) {
                      onClickRow(row[keyOfRowID], rowIndex);
                    }
                  }}
                >
                  {filteredColumns.map((column, columnIndex) => (
                    <td
                      key={`${row[keyOfRowID]}-${columnIndex}`}
                      style={getLayoutStyle({
                        height: rowHeight,
                        paddingLeft: columnIndex === 0 ? edgePaddingX : 0,
                      })}
                      className={td()}
                    >
                      <div
                        // 左右端のセルの途中まである下線を引くための要素
                        className={td_inner_1()}
                        style={getLayoutStyle({
                          paddingTop: rowPaddingY,
                          paddingBottom: rowPaddingY,
                          paddingLeft: columnIndex !== 0 ? columnsGapX : 0,
                        })}
                      >
                        <div
                          // この要素の内側に内容が描画される、dividerはこのdivに対して引かれる
                          className={td_inner_2({
                            divideAfter: column.divideAfter,
                            justify: column.justify,
                          })}
                          style={getLayoutStyle({
                            paddingRight: column.divideAfter
                              ? columnsGapX
                              : undefined,
                          })}
                        >
                          {column.renderCell
                            ? column.renderCell(row[column.id], row, rowIndex)
                            : row[column.id] ?? ''}
                        </div>
                      </div>
                    </td>
                  ))}
                  {/* 各Columnのwidth指定値を統一するため、最後の要素の右側のPaddingはダミー要素として追加 */}
                  <td className={td() + ' w-0'} />
                </tr>
              ))}
            </tbody>
          )}
        </table>
        {/* loading state */}
        {isLoading && (
          <div
            className={skeleton({
              full: isEmpty(skeletonProperty?.height),
            })}
            style={getSkeltonHeightStyle(rowHeight, skeletonProperty?.height)}
          />
        )}

        {/* empty state */}
        {rows.length === 0 && !isLoading && (
          <div className='w-full text-center py-20 text-lg font-semibold text-neutral'>
            {emptyStateMessage}
          </div>
        )}
      </div>
    </>
  );
}
