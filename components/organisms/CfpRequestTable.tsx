import InputTextBox from '@/components/atoms/InputTextBox';
import {
  Plant, TradeRequestDataType, Operator,
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
import { Column, DataTable } from '@/components/molecules/DataTable';
import StatusBadge from '@/components/atoms/StatusBadge';
import SectionHeader from '@/components/molecules/SectionHeader';
import { Button } from '@/components/atoms/Button';
import CheckBox from '@/components/atoms/CheckBox';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import '@/lib/yup.locale';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';
import PopupModal from '@/components/molecules/PopupModal';
import { PlantCell } from '@/components/organisms/PlantCell';
import InputTextArea from '@/components/atoms/InputTextArea';
import Tab from '@/components/atoms/Tab';
import SkeletonColumn from '@/components/atoms/SkeletonColumn';

// 入力フォームの型定義(1行分)
export type CfpRequestFormRowType = {
  downstreamTraceId: string;
  openOperatorId: string;
  operatorName: string;
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
  isOperaterLoading: boolean;
};

export default function CfpRequestTable({
  tradeRequestData,
  plants,
  onSubmit,
  getOperator,
  onCancelTradeRequest,
  isTradeResponseLoading,
  isOperaterLoading,
}: Props) {

  // Propsで受け取ったデータを依頼済みかどうかで分割し、テーブル表示用の型に変換
  const { requestedData, notRequestedData } = useMemo(
    () => separateTradeRequestDataByRequestedStatus(tradeRequestData),
    [tradeRequestData]
  );

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  const [isTabs, setIsTabs] = useState<string[]>(['未依頼(ー件)', '依頼済(ー件)']);

  useEffect(() => {
    const tabs = isTradeResponseLoading ? ['未依頼(ー件)', '依頼済(ー件)'] : [`未依頼(${notRequestedData.length}件)`, `依頼済(${requestedData.length}件)`];
    setIsTabs(tabs);
  }, [isTradeResponseLoading, notRequestedData.length, requestedData]);

  const [tabIndex, setTabIndex] = useState(0);

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
    message: Yup.string().max(100),
    selected: Yup.boolean().required(),
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
            upstreamOperatorId: upstreamOperatorId ?? '',
            openOperatorId: operator?.openOperatorId ?? '',
            operatorName: operator?.operatorName ?? '',
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
    onSubmit: (form) => {
      onSubmit(form);
      setIsConfirmModalOpen(false);
    },
    enableReinitialize: true, // フォームの初期値としてtraceIdを渡す
  });



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
                    formik.setFieldValue(
                      `notRequestedCfp[${rowIdx}].selected`,
                      !isEmpty(e.target.value),
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
                  formik.setFieldValue(
                    `notRequestedCfp[${rowIdx}].operatorName`,
                    operator === undefined ? '' : operator.operatorName,
                    false
                  );
                  formik.setFieldValue(
                    `notRequestedCfp[${rowIdx}].upstreamOperatorNotFound`,
                    e.target.value !== '' && operator === undefined,
                    false
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
        id: 'message',
        headerElement: 'メッセージ',
        width: 468,
        renderCell: (value, row, rowIdx) =>
          <InputTextArea
            className='h-[60px] w-[466px]'
            {...formik.getFieldProps(`notRequestedCfp[${rowIdx}].message`)}
            error={getFormikErrorMessage({
              name: `notRequestedCfp[${rowIdx}].message`,
              formik,
            })}
          />,
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
      width: 180,
      renderCell: (value) => {
        if (isOperaterLoading)
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
        if (isOperaterLoading)
          return <SkeletonColumn className='py-1' />;
        if (isEmpty(value)) {
          return <DisplayHyphen className={width} />;
        }
        return <div className={width + ' truncate text-xs'}>{value?.operatorName}</div>;
      },
    },
    {
      id: 'tradeStatus',
      headerElement: 'メッセージ',
      width: 468,
      renderCell: (value) => isEmpty(value?.message)
        ? <DisplayHyphen align='left' />
        : value?.message,
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
            className='pb-4'
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
                  disabled={!(formik.isValid && formik.dirty)}
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
              stickyOptions={{ top: 160, beforeHeight: 'h-32' }}
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
              stickyOptions={{ top: 160, beforeHeight: 'h-32' }}
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
                type='submit'
                disabled={!(formik.isValid && formik.dirty)}
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

        </form>
      </FormikProvider>
    </>
  );
}
