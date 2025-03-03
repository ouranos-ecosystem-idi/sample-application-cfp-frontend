import { Button } from '@/components/atoms/Button';
import CheckBox from '@/components/atoms/CheckBox';
import DatePickerWithStyle from '@/components/atoms/DatePickerWithStyle';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';
import InputTextArea from '@/components/atoms/InputTextArea';
import InputTextBox from '@/components/atoms/InputTextBox';
import SkeletonColumn from '@/components/atoms/SkeletonColumn';
import StatusBadge from '@/components/atoms/StatusBadge';
import Tab from '@/components/atoms/Tab';
import Tooltip from '@/components/atoms/Tooltip';
import { Column, DataTable } from '@/components/molecules/DataTable';
import PopupModal from '@/components/molecules/PopupModal';
import SectionHeader from '@/components/molecules/SectionHeader';
import { PlantCell } from '@/components/organisms/PlantCell';
import {
  Operator,
  Plant, TradeRequestDataType,
  TradeRequestDataTypeWithOperator,
} from '@/lib/types';
import {
  getFormikErrorMessage,
  getRequestStatus,
  getTradeRequestStatusColor,
  getTradeRequestStatusName,
  isEmpty,
  separateTradeRequestDataByRequestedStatus,
} from '@/lib/utils';
import '@/lib/yup.locale';
import { format } from 'date-fns';
import { FormikProvider, useFormik } from 'formik';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';

// 入力フォームの型定義(1行分)
export type CfpRequestFormRowType = {
  downstreamTraceId: string;
  openOperatorId: string;
  operatorName: string;
  responseDueDate: string;
  upstreamOperatorId: string;
  message: string;
  selected: boolean;
  upstreamOperatorNotFound?: boolean;
};

// 入力フォームの型定義(フォーム全体)
export type CfpRequestFormType = {
  notRequestedCfp: CfpRequestFormRowType[];
  requestedCfp: { selected: boolean; }[];
};

type Props = {
  tradeRequestData: TradeRequestDataTypeWithOperator[];
  plants: Plant[];
  onSubmit: (value: CfpRequestFormType) => void;
  getOperator: (openOperatorId: string) => Promise<Operator | undefined>;
  onCancelTradeRequest: (
    tradeRequest: TradeRequestDataType[]
  ) => Promise<void>;
  isTradeResponseLoading: boolean;
  isOperatorLoading: boolean;
};

export default function CfpRequestTable({
  tradeRequestData,
  plants,
  onSubmit,
  getOperator,
  onCancelTradeRequest,
  isTradeResponseLoading,
  isOperatorLoading,
}: Props) {

  // Propsで受け取ったデータを依頼済みかどうかで分割し、テーブル表示用の型に変換
  const { requestedData, notRequestedData } = useMemo(
    () => separateTradeRequestDataByRequestedStatus(tradeRequestData),
    [tradeRequestData]
  );

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  const [isTabs, setIsTabs] = useState<string[]>(['未依頼(-件)', '依頼済(-件)']);
  useEffect(() => {
    const tabs = isTradeResponseLoading ? ['未依頼(-件)', '依頼済(-件)'] : [`未依頼(${notRequestedData.length}件)`, `依頼済(${requestedData.length}件)`];
    setIsTabs(tabs);
  }, [isTradeResponseLoading, notRequestedData.length, requestedData]);

  const [tabIndex, setTabIndex] = useState(0);
  const [isReplyMessageModalOpen, setIsReplyMessageModalOpen] = useState<boolean>(false);
  const [ReplyMessage, setReplyMessage] = useState('');

  // 取消ボタンが押されたときの処理;
  const handleCancelClick = useCallback((forms: CfpRequestFormType) => {
    onCancelTradeRequest(
      forms.requestedCfp.reduce<TradeRequestDataType[]>((acc, _form, index) => {
        if (_form.selected) acc = [...acc, requestedData[index]];
        return acc;
      }, [])
    );
    setIsCancelModalOpen(false);
  }, [onCancelTradeRequest, requestedData]);

  const rowValidationSchema = Yup.object({
    downstreamTraceId: Yup.string(),
    upstreamOperatorId: Yup.string().when('selected', {
      is: (flag: boolean) => flag,
      then: (schema) => schema.required(),
    }),
    openOperatorId: Yup.string().max(20),
    message: Yup.string().max(1000),
    selected: Yup.boolean().required(),
    responseDueDate: Yup.string().required(),
  });

  const validationSchema = Yup.object({
    notRequestedCfp: Yup.array()
      .required()
      .of(rowValidationSchema)
      .test('atLeastOneItemChecked', '', (list) => {
        return list.find((data) => data.selected) ? true : false;
      }),
    requestedCfp: Yup.array()
      .nullable()
  });

  const formik = useFormik<CfpRequestFormType>({
    // フォーム初期値(1行分) undefinedの場合reactがエラーを出すので空文字である必要がある
    initialValues: {
      notRequestedCfp: notRequestedData.map(
        ({ downStreamPart, upstreamOperatorId, operator }) => {
          return {
            downstreamTraceId: downStreamPart.traceId ?? '',
            openOperatorId: operator?.openOperatorId ?? '',
            operatorName: operator?.operatorName ?? '',
            responseDueDate: '',
            upstreamOperatorId: upstreamOperatorId ?? '',
            message: '',
            selected: false,
            upstreamOperatorNotFound: false, // 検索前・検索後でバリデーション文言を出し分けるためフィールドとして追加
          };
        }
      ),
      requestedCfp: requestedData.map(
        (_requested) => {
          return {
            selected: false
          };
        }),
    },
    validationSchema,
    onSubmit: () => { },
    enableReinitialize: true, // フォームの初期値としてtraceIdを渡す
  });


  const isRequestButtonDisabled = useCallback(() => {
    if (!formik.values.notRequestedCfp.some((_request => _request.selected))) return true;

    const isValid = formik.values.notRequestedCfp.some(
      (_request, index) => {

        return _request.selected && formik.errors?.notRequestedCfp?.[index] !== undefined;

      });
    return isValid;
  }, [formik]);

  // notRequestedDataのフォーム編集部分をformikの値に置き替え
  const notRequestedDataWithForm = notRequestedData.map((data, index) => ({
    ...data,
    ...formik.values.notRequestedCfp[index],
  }));

  // requestedDataのフォーム部分をformikの値に置き換える
  const requestedDataWithForm = requestedData.map((data, index) => ({
    ...data,
    ...formik.values.requestedCfp[index],
  }));

  const commonColumns: Column<TradeRequestDataTypeWithOperator>[] = [
    {
      id: 'tradeStatus',
      headerElement: 'ステータス',
      width: 76,
      justifyHeader: 'center',
      justify: 'center',
      renderCell: (value) =>
        <StatusBadge
          color={getTradeRequestStatusColor(getRequestStatus(value?.requestStatus))}
          text={getTradeRequestStatusName(getRequestStatus(value?.requestStatus))}
        />,
    },
    {
      id: 'downStreamPart',
      headerElement: '部品項目',
      width: 72,
      renderCell: (value) => value.partsName
    },
    {
      id: 'downStreamPart',
      headerElement: '補助項目',
      renderCell: (value) =>
        isEmpty(value.supportPartsName) ? <DisplayHyphen className='text-xs' /> : value.supportPartsName,
      width: 72,
    },
    {
      id: 'tradeStatus',
      headerElement: '進捗状況',
      width: 72,
      justifyHeader: 'center',
      justify: 'center',
      renderCell: (value) =>
        isEmpty(value?.requestStatus.tradesCount) ? <DisplayHyphen className='text-xs' /> :
          <Tooltip
            message={
              <>
                <table className='text-left'>
                  <tr>
                    <th className='font-semibold mb-2 text-xs text-white'>取引関係数更新日時</th>
                    <th className='font-semibold pl-2 mb-2 text-xs text-white'>回答完了数更新日時</th>
                  </tr>
                  <tr>
                    <td className='font-semibold mb-2 text-xs text-white'>
                      {isEmpty(value?.requestStatus.tradesCountModifiedAt)
                        ? <DisplayHyphen className='text-xs text-white' />
                        : value?.requestStatus.tradesCountModifiedAt?.replaceAll('-', '/').replace('T', ' ').replace('Z', '')}
                    </td>
                    <td className='font-semibold pl-2 mb-2 text-xs text-white'>
                      {isEmpty(value?.requestStatus.completedCountModifiedAt)
                        ? <DisplayHyphen className='text-xs text-white' />
                        : value?.requestStatus.completedCountModifiedAt?.replaceAll('-', '/').replace('T', ' ').replace('Z', '')}
                    </td>
                  </tr>
                </table>
                <div className='font-normal text-xs text-white'>{ }</div>
              </>
            }
          >
            <div className='text-xs'>{isEmpty(value?.requestStatus.tradesCount) ? <DisplayHyphen className='text-xs' /> : value?.requestStatus.completedCount + '/' + value?.requestStatus.tradesCount}</div>
          </Tooltip>
    },
    {
      id: 'downStreamPart',
      headerElement: (
        <div>
          事業所名
          <br />
          事業所識別子
        </div>
      ),
      width: 88,
      renderCell: (value) => (
        <PlantCell plantId={value.plantId} plants={plants} size='xs' />
      ),
    },
    {
      id: 'downStreamPart',
      headerElement: 'トレース識別子',
      width: 132,
      divideAfter: true,
      renderCell: (value) => value.traceId
    },
  ];

  const notRequestedColumns: Column<
    TradeRequestDataTypeWithOperator & CfpRequestFormRowType>[] = [
      {
        id: 'selected',
        headerElement: '選択',
        justify: 'center',
        width: 28,
        renderCell: (value, row, rowIdx) => (
          <CheckBox
            disabled={
              !formik.values.notRequestedCfp[rowIdx].upstreamOperatorId
            }
            checked={value}
            setChecked={(value) => {
              formik.setFieldValue(
                `notRequestedCfp[${rowIdx}].selected`,
                value
              );
            }}
          />
        ),
      },
      ...commonColumns,
      {
        id: 'openOperatorId',
        headerElement: '事業者識別子',
        width: 180,
        renderCell: (value, row, rowIdx) => {
          return (
            <InputTextBox
              disabled={false}
              className='h-[60px] w-[184px]'
              placeholder='事業者識別子を入力*'
              {...formik.getFieldProps(
                `notRequestedCfp[${rowIdx}].openOperatorId`
              )}
              onChange={(e: ChangeEvent<any>) => {
                formik
                  .setFieldValue(
                    `notRequestedCfp[${rowIdx}].openOperatorId`,
                    e.target.value,
                    false
                  )
                  .then(() => {
                    formik.setFieldValue(
                      `notRequestedCfp[${rowIdx}].upstreamOperatorNotFound`,
                      false,
                      true
                    );
                  });
              }}
              onBlur={(e) => {
                getOperator(e.target.value).then((operator) => {
                  formik.setFieldValue(
                    `notRequestedCfp[${rowIdx}].upstreamOperatorId`,
                    operator === undefined ? '' : operator.operatorId,
                    true
                  );
                  if (operator?.operatorName !== formik.values.notRequestedCfp[rowIdx].operatorName) {
                    formik.setFieldValue(
                      `notRequestedCfp[${rowIdx}].selected`,
                      operator !== undefined,
                      true
                    );
                  }
                  formik.setFieldValue(
                    `notRequestedCfp[${rowIdx}].operatorName`,
                    operator === undefined ? '' : operator.operatorName,
                    true
                  );
                  formik.setFieldValue(
                    `notRequestedCfp[${rowIdx}].upstreamOperatorNotFound`,
                    e.target.value !== '' && operator === undefined,
                    true
                  );

                });
                formik.handleBlur(e);
              }}
              error={
                getFormikErrorMessage({
                  name: `notRequestedCfp[${rowIdx}].openOperatorId`,
                  formik,
                }) ??
                (row.upstreamOperatorNotFound
                  ? '存在しない事業者識別子です。'
                  : undefined)
              }
            />
          );
        },
      },
      {
        id: 'operatorName',
        headerElement: '事業者名',
        width: 104,
        renderCell: (value) => {
          const width = 'w-[104px]';
          if (isEmpty(value)) {
            return <DisplayHyphen className={width} />;
          }
          return <div className={width + ' truncate text-xs'}>{value}</div>;
        },
      },
      {
        id: 'responseDueDate',
        headerElement: '回答希望日',
        width: 120,
        renderCell: (value, row, rowIdx) => {
          return (
            <DatePickerWithStyle
              selected={isEmpty(formik.values.notRequestedCfp[rowIdx].responseDueDate) ? undefined : new Date(formik.values.notRequestedCfp[rowIdx].responseDueDate)}
              {...formik.getFieldProps(`notRequestedCfp[${rowIdx}].responseDueDate`)}
              placeholderText='希望日'
              onChange={date => {
                formik.setFieldValue(
                  `notRequestedCfp[${rowIdx}].responseDueDate`,
                  format(date, 'yyyy-MM-dd'),
                );
              }}
            />
          );
        },
      },
      {
        id: 'message',
        headerElement: 'メッセージ',
        width: 310,
        renderCell: (value, row, rowIdx) =>
          <InputTextArea
            className='h-[60px] w-[310px]'
            {...formik.getFieldProps(`notRequestedCfp[${rowIdx}].message`)}
            error={getFormikErrorMessage({
              name: `notRequestedCfp[${rowIdx}].message`,
              formik,
            })}
          />,
      },
      {
        id: 'tradeStatus',
        headerElement: '応答メッセージ',
        width: 110,
        justifyHeader: 'center',
        justify: 'center',
        renderCell: (value) => {
          return (
            <Button
              key='link-button'
              className='w-20'
              disabled={isEmpty(value?.replyMessage)}
              onClick={() => {
                setReplyMessage(value!.replyMessage!);
                setIsReplyMessageModalOpen(true);
              }}
            >
              確認
            </Button>
          );
        }
      },
    ];

  const requestedColumns: Column<TradeRequestDataTypeWithOperator & { selected: boolean; }>[] = [
    {
      id: 'selected',
      headerElement: '選択',
      width: 28,
      renderCell: (value, row, rowIdx) => (
        <CheckBox
          checked={value}
          setChecked={(value) => {
            formik.setFieldValue(
              `requestedCfp[${rowIdx}].selected`,
              value
            );
          }}
        />
      ),
    },
    ...commonColumns,
    {
      id: 'operator',
      headerElement: '事業者識別子',
      width: 120,
      renderCell: (value) => {
        if (isOperatorLoading)
          return <SkeletonColumn className='py-1' />;
        else return <div className='line-clamp-3 text-xs'>{value?.openOperatorId}</div>;
      },
    },
    {
      id: 'operator',
      headerElement: '事業者名',
      width: 104,
      renderCell: (value) => {
        const width = 'w-[104px]';
        if (isOperatorLoading)
          return <SkeletonColumn className='py-1' />;
        if (isEmpty(value)) {
          return <DisplayHyphen className={width} />;
        }
        return <div className={width + ' truncate text-xs'}>{value?.operatorName}</div>;
      },
    },
    {
      id: 'tradeStatus',
      width: 72,
      headerElement: '回答希望日',
      renderCell: (value) => isEmpty(value?.responseDueDate)
        ? <DisplayHyphen align='center' />
        : <div className='w-full text-xs'>{value?.responseDueDate?.replaceAll('-', '/')}</div>
    },
    {
      id: 'tradeStatus',
      headerElement: 'メッセージ',
      width: 310,
      renderCell: (value) => isEmpty(value?.message)
        ? <DisplayHyphen align='left' />
        : <div className='max-h-14 text-xs text-balance overflow-y-auto'>{value?.message}</div>
    },
    {
      id: 'tradeStatus',
      headerElement: '応答メッセージ',
      width: 110,
      justifyHeader: 'center',
      justify: 'center',
      renderCell: (value) => {
        return (
          <Button
            key='link-button'
            className='w-20'
            disabled={isEmpty(value?.replyMessage)}
            onClick={() => {
              setReplyMessage(value!.replyMessage!);
              setIsReplyMessageModalOpen(true);
            }}
          >
            確認
          </Button>
        );
      }
    },
  ];

  useEffect(() => {
    if (!isTradeResponseLoading && notRequestedData.length === 0 && requestedData.length !== 0) {
      setTabIndex(1);
    }
  }, [isTradeResponseLoading, notRequestedData.length, requestedData]);

  return (
    <>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className='flex-1 flex flex-col'>
          <SectionHeader
            stickyOptions={{ top: 104 }}
            variant='h3'
            className='pb-4 px-1'
            align='middle'
            leftChildren={[
              <Tab
                key='tab'
                tabs={isTabs}
                width={96}
                activeTabIndex={tabIndex}
                onSelect={setTabIndex}
              />,
            ]}
            rightChildren={[
              tabIndex === 0 ?
                <Button
                  key='confirm'
                  type='button'
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={isRequestButtonDisabled()}
                >
                  算出を依頼
                </Button> :
                <Button
                  key='confirm'
                  color='error'
                  variant='outline'
                  type='button'
                  className='hover:text-white'
                  onClick={() => setIsCancelModalOpen(true)}
                  disabled={formik.values.requestedCfp.every(cfp => cfp.selected === false)}
                >
                  依頼取消
                </Button>,
            ]}
          />
          {tabIndex === 0 ? (
            <DataTable
              rowHeight={100}
              columns={notRequestedColumns}
              // フォームが準備されてから行をレンダリングする
              rows={
                formik.values.notRequestedCfp.length ? notRequestedDataWithForm : []
              }
              keyOfRowID='downstreamTraceId'
              edgePaddingX={16}
              columnsGapX={12}
              className='mb-6'
              emptyStateMessage='依頼未送信の部品構成はありません'
              stickyOptions={{ top: 160, beforeHeight: 'h-96' }}
              isLoading={isTradeResponseLoading}
            />
          ) : (
            <DataTable
              rowHeight={100}
              columns={requestedColumns}
              // フォームが準備されてから行をレンダリングする
              rows={formik.values.requestedCfp.length ? requestedDataWithForm : []}
              keyOfRowID='tradeId'
              edgePaddingX={16}
              columnsGapX={12}
              emptyStateMessage='依頼送信済の部品構成はありません'
              stickyOptions={{ top: 160, beforeHeight: 'h-96' }}
              isLoading={isTradeResponseLoading}
            />
          )}
          <PopupModal
            button={
              <Button
                color='primary'
                variant='solid'
                size='default'
                key='submit'
                type='button'
                onClick={() => {
                  if (isRequestButtonDisabled()) return;
                  onSubmit(formik.values);
                  setIsConfirmModalOpen(false);
                }}
                disabled={isRequestButtonDisabled()}
              >
                算出を依頼
              </Button>
            }
            isOpen={isConfirmModalOpen}
            setIsOpen={setIsConfirmModalOpen}
            title='指定した事業者へCFPの算出を依頼しますか？'
          />
          <PopupModal
            button={
              <Button
                color='error'
                variant='solid'
                size='default'
                key='delete'
                type='button'
                onClick={() => handleCancelClick(formik.values)}
                disabled={formik.values.requestedCfp.every(cfp => cfp.selected === false)}
              >
                依頼取消
              </Button>
            }
            isOpen={isCancelModalOpen}
            setIsOpen={setIsCancelModalOpen}
            title='CFP算出依頼を取消しますか？'
          />
          <PopupModal
            isOpen={isReplyMessageModalOpen}
            setIsOpen={setIsReplyMessageModalOpen}
          >
            <p>応答メッセージ </p>
            <div className='p-2 break-all'>
              <div className='h-[80px] font-semibold textarea border-neutral rounded text-xs overflow-y-auto'>
                {ReplyMessage}
              </div>
            </div>
          </PopupModal>
        </form>
      </FormikProvider>
    </>
  );
}
