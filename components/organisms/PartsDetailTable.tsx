'use client';
import { getOperatorId } from '@/api/accessToken';
import AddRowButton from '@/components/atoms/AddRowButton';
import { Button } from '@/components/atoms/Button';
import CheckBox from '@/components/atoms/CheckBox';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';
import InputTextBox from '@/components/atoms/InputTextBox';
import LevelIcon from '@/components/atoms/LevelIcon';
import RefreshButton from '@/components/atoms/RefreshButton';
import { Select } from '@/components/atoms/Select';
import { Column, DataTable } from '@/components/molecules/DataTable';
import PopupModal from '@/components/molecules/PopupModal';
import SectionHeader from '@/components/molecules/SectionHeader';
import { PlantCell } from '@/components/organisms/PlantCell';
import { MAX_CHILD_PARTS_NUM } from '@/lib/constants';
import { convertPartsFormTypeToPartsStructure } from '@/lib/converters';
import {
  AmountRequiredUnitsList,
  PartLevel,
  PartsFormRowType,
  PartsStructure,
  Plant,
} from '@/lib/types';
import {
  getFormikErrorMessage,
  isDecimalPartDigitsWithin,
  isEmpty,
  isIntegerPartDigitsWithin,
  validatePartsDuplication,
} from '@/lib/utils';
import '@/lib/yup.locale';
import { ArrowCounterClockwise, MinusCircle } from '@phosphor-icons/react';
import { FormikProvider, useFormik } from 'formik';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';

type FormRowType = PartsFormRowType & {
  rowID: number;
  level: PartLevel;
  isDeleted: boolean;
  isNew: boolean;
};

type FormType = {
  data: FormRowType[];
};

function convertFormTypeToPartsStructure(form: FormType) {
  return convertPartsFormTypeToPartsStructure(
    {
      parentParts: form.data.find((parts) => parts.level === 1)!,
      childrenParts: form.data.filter(
        (parts) => parts.level === 2 && !parts.isDeleted
      ),
    },
    getOperatorId()
  );
}

function isChildrenParts(partsStructure: PartsStructure | undefined) {
  return partsStructure === undefined ?
    true : partsStructure.childrenParts.length !== 0;
}

function isParentTerminated(tableData: FormRowType[]): boolean {
  return (
    tableData.filter(({ level, isDeleted }) => level === 2 && !isDeleted)
      .length === 0
  );
}

function updateParentTerminated(tableData: FormRowType[]): FormRowType[] {
  return tableData.map((data) => {
    if (data.level === 1) {
      return { ...data, terminatedFlag: isParentTerminated(tableData) };
    }
    return data;
  });
}

const validationSchema = Yup.object({
  data: Yup.array().of(
    Yup.object({
      partsName: Yup.string().when('isDeleted', {
        is: (isDeleted: number) => !isDeleted,
        then: (schema) => schema.required().max(50),
      }),
      supportPartsName: Yup.string().when('isDeleted', {
        is: (isDeleted: boolean) => !isDeleted,
        then: (schema) => schema.max(50),
      }),
      partsLabelName: Yup.string().when('isDeleted', {
        is: (isDeleted: number) => !isDeleted,
        then: (schema) => schema.required().max(50),
      }),
      partsAddInfo1: Yup.string().when('isDeleted', {
        is: (isDeleted: boolean) => !isDeleted,
        then: (schema) => schema.max(50),
      }),
      partsAddInfo2: Yup.string().when('isDeleted', {
        is: (isDeleted: boolean) => !isDeleted,
        then: (schema) => schema.max(50),
      }),
      partsAddInfo3: Yup.string().when('isDeleted', {
        is: (isDeleted: boolean) => !isDeleted,
        then: (schema) => schema.max(50),
      }),
      plantId: Yup.string().when('isDeleted', {
        is: (isDeleted: boolean) => !isDeleted,
        then: (schema) => schema.required('選択必須'),
      }),
      amountRequired: Yup.string().when('isDeleted', {
        is: (isDeleted: boolean) => !isDeleted,
        then: (schema) =>
          schema.when('level', {
            is: (level: number) => level !== 1,
            then: (schema) =>
              schema
                .required()
                .test('intMax5', '整数部5桁以内', (value) =>
                  isIntegerPartDigitsWithin(value, 5)
                )
                .test('decimalMax5', '小数点第5位以内', (value) =>
                  isDecimalPartDigitsWithin(value, 5)
                ),
          }),
      }),
      amountRequiredUnit: Yup.string().when('isDeleted', {
        is: (isDeleted: boolean) => !isDeleted,
        then: (schema) => schema.required('選択必須'),
      }),
    })
  ),
});

export default function PartsDetail({
  partsStructure,
  plants,
  onSubmit,
  onDeleteSubmit,
  isPartsLoading,
  setErrorMessage,
  setIsErrorDisplayOpen,
}: {
  partsStructure?: PartsStructure;
  plants: Plant[];
  onSubmit: (value: PartsStructure) => Promise<void>;
  onDeleteSubmit: (value: string) => void;
  isPartsLoading: boolean;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  setIsErrorDisplayOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const onClickConfirm = () => {
    const duplicateError = validatePartsDuplication(
      convertFormTypeToPartsStructure(formik.values),
      plants
    );
    if (duplicateError !== undefined) {
      setErrorMessage(duplicateError);
      setIsErrorDisplayOpen(true);
      return;
    }
    setIsConfirmModalOpen(true);
  };

  // 削除ボタンが押されたときの処理
  const handleDeleteClick = useCallback((traceId: string) => {
    onDeleteSubmit(traceId);
    setIsDeleteModalOpen(false);
  }, [onDeleteSubmit]);

  const formik = useFormik<FormType>({
    onSubmit: (form: FormType) => {
      onSubmit(convertFormTypeToPartsStructure(form));
      setIsConfirmModalOpen(false);
    },
    initialValues: {
      data: updateParentTerminated(
        partsStructure === undefined
          ? []
          : [partsStructure.parentParts, ...partsStructure.childrenParts].map(
            (data, rowID) => ({
              ...data,
              amountRequired: data.amountRequired ?? '',
              amountRequiredUnit: data.amountRequiredUnit ?? '',
              rowID,
              isDeleted: false,
              isNew: false,
            })
          )
      ),
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
  });

  useEffect(() => {
    formik.setValues({ data: updateParentTerminated(formik.values.data) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formik.values.data.map((data) => data.isDeleted))]);

  const columns: Column<FormRowType>[] = useMemo(
    () => [
      {
        id: 'level',
        headerElement: 'レベル',
        width: 46,
        justify: 'center',
        renderCell: (value) => <LevelIcon level={value} />,
      },
      {
        id: 'partsName',
        headerElement: '部品項目',
        width: 172,
        renderCell: (value, row, rowIndex) =>
          row.isNew ? (
            <InputTextBox
              background='transparent'
              disabled={row.isDeleted!}
              type='text'
              {...formik.getFieldProps(`data[${rowIndex}][partsName]`)}
              error={getFormikErrorMessage({
                name: `data[${rowIndex}][partsName]`,
                formik,
              })}
              placeholder='入力必須'
            />
          ) : (
            <span className='text-sm font-semibold break-all'>{value}</span>
          ),
      },
      {
        id: 'supportPartsName',
        headerElement: '補助項目',
        width: 144,
        renderCell: (value, row, rowIndex) => {
          if (row.isNew) {
            return (
              <InputTextBox
                background='transparent'
                disabled={row.isDeleted!}
                type='text'
                {...formik.getFieldProps(`data[${rowIndex}][supportPartsName]`)}
                error={getFormikErrorMessage({
                  name: `data[${rowIndex}][supportPartsName]`,
                  formik,
                })}
              />
            );
          }
          return isEmpty(value) ? (
            <DisplayHyphen />
          ) : (
            <span className='text-sm font-semibold break-all'>{value}</span>
          );
        },
      },
      {
        id: 'partsLabelName',
        headerElement: '部品名称',
        width: 172,
        renderCell: (value, row, rowIndex) => {
          return (
            <InputTextBox
              background='transparent'
              disabled={row.isDeleted!}
              type='text'
              {...formik.getFieldProps(`data[${rowIndex}][partsLabelName]`)}
              error={getFormikErrorMessage({
                name: `data[${rowIndex}][partsLabelName]`,
                formik,
              })}
            />
          );
        }
      },
      {
        id: 'partsAddInfo1',
        headerElement: 'CFP算出バージョン',
        width: 172,
        renderCell: (value, row, rowIndex) => {
          return (
            <InputTextBox
              background='transparent'
              disabled={row.isDeleted!}
              type='text'
              {...formik.getFieldProps(`data[${rowIndex}][partsAddInfo1]`)}
              error={getFormikErrorMessage({
                name: `data[${rowIndex}][partsAddInfo1]`,
                formik,
              })}
            />
          );
        }
      },
      {
        id: 'partsAddInfo2',
        headerElement: 'CFP算出期間',
        width: 172,
        renderCell: (value, row, rowIndex) => {
          return (
            <InputTextBox
              background='transparent'
              disabled={row.isDeleted!}
              type='text'
              {...formik.getFieldProps(`data[${rowIndex}][partsAddInfo2]`)}
              error={getFormikErrorMessage({
                name: `data[${rowIndex}][partsAddInfo2]`,
                formik,
              })}
            />
          );
        }
      },
      {
        id: 'partsAddInfo3',
        headerElement: '任意項目',
        width: 172,
        renderCell: (value, row, rowIndex) => {
          return (
            <InputTextBox
              background='transparent'
              disabled={row.isDeleted!}
              type='text'
              {...formik.getFieldProps(`data[${rowIndex}][partsAddInfo3]`)}
              error={getFormikErrorMessage({
                name: `data[${rowIndex}][partsAddInfo3]`,
                formik,
              })}
            />
          );
        }
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
        width: 248,
        renderCell: (value, row, rowIndex) => {
          if (row.isNew) {
            return (
              <Select
                disabled={row.isDeleted!}
                background='transparent'
                selectOptions={plants.reduce<{ [key: string]: string; }>(
                  (acc, plant) => {
                    const key = plant.plantId || '';
                    acc[key] = plant.plantName + ',' + plant.openPlantId;
                    return acc;
                  },
                  {}
                )}
                hiddenText='選択必須'
                {...formik.getFieldProps(`data[${rowIndex}][plantId]`)}
                onChange={(e) => {
                  formik.setFieldValue(
                    `data[${rowIndex}].plantId`,
                    e.target.value
                  );
                }}
                error={getFormikErrorMessage({
                  name: `data[${rowIndex}].plantId`,
                  formik,
                })}
              />
            );
          }
          return <PlantCell plantId={value} plants={plants} size='sm' />;
        },
      },
      {
        id: 'traceId',
        headerElement: 'トレース識別子',
        width: 280,
        divideAfter: true,
        renderCell: (value) => {
          return <span className='text-sm break-all'>{value}</span>;
        },
      },
      {
        id: 'amountRequired',
        headerElement: <span>{'活動量'}</span>,
        width: 200,
        renderCell: (_, row, rowIndex) => {
          if (row.level === undefined || row.level === 1) {
            return null;
          }
          return (
            <InputTextBox
              background='transparent'
              disabled={row.isDeleted!}
              align='right'
              type='number'
              placeholder='半角数字で入力*'
              {...formik.getFieldProps(`data[${rowIndex}][amountRequired]`)}
              error={getFormikErrorMessage({
                name: `data[${rowIndex}][amountRequired]`,
                formik,
              })}
            />
          );
        },
      },
      {
        id: 'amountRequiredUnit',
        headerElement: <span>{'単位'}</span>,
        width: 120,
        renderCell: (_, row, rowIndex) => (
          <Select
            disabled={row.isDeleted!}
            background='transparent'
            selectOptions={AmountRequiredUnitsList.reduce<{
              [key: string]: string;
            }>((acc, unit) => {
              acc[unit] = unit;
              return acc;
            }, {})}
            hiddenText='選択必須'
            error={getFormikErrorMessage({
              name: `data[${rowIndex}].amountRequiredUnit`,
              formik,
            })}
            {...formik.getFieldProps(`data[${rowIndex}][amountRequiredUnit]`)}
            onChange={(e) => {
              formik.setFieldValue(
                `data[${rowIndex}][amountRequiredUnit]`,
                e.target.value
              );
            }}
          />
        ),
      },
      {
        id: 'terminatedFlag',
        headerElement: <span>{'終端'}</span>,
        width: 33,
        justify: 'center',
        renderCell: (_, row, rowIndex) => (
          <CheckBox
            checked={
              formik.getFieldProps(`data[${rowIndex}].terminatedFlag`).value
            }
            setChecked={(value) => {
              formik.setFieldValue(`data[${rowIndex}].terminatedFlag`, value);
            }}
            disabled={
              row.level === undefined || row.level === 1 || row.isDeleted!
            }
          />
        ),
      },
      {
        id: 'isDeleted',
        headerElement: <span></span>,
        width: 28,
        justify: 'end',
        renderCell: (_, row, rowIndex) => {
          if (row.level === undefined || row.level === 1) {
            return <div></div>;
          }
          if (formik.getFieldProps(`data[${rowIndex}].isDeleted`).value) {
            return (
              <ArrowCounterClockwise
                weight='bold'
                className='fill-primary cursor-pointer'
                size='24'
                onClick={() => {
                  formik.setFieldValue(`data[${rowIndex}].isDeleted`, false);
                }}
              />
            );
          }
          return (
            <MinusCircle
              className='fill-error cursor-pointer'
              size='24'
              onClick={() => {
                formik.setFieldValue(`data[${rowIndex}].isDeleted`, true);
              }}
            />
          );
        },
      },
    ],
    [formik, plants]
  );

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className='flex flex-col flex-1'>
        <div className='flex flex-col flex-1'>
          <div className='pt-1' />
          <SectionHeader
            stickyOptions={{ top: 60 }}
            title='部品構成詳細'
            variant='h1'
            leftChildren={[
              <RefreshButton
                onClick={() => {
                  window.location.reload();
                }}
                className='ml-4'
                key={'refresh'}
              />,
            ]}
            rightChildren={[
              <Button
                key='confirm'
                type='button'
                color='error'
                onClick={() => { setIsDeleteModalOpen(true); }}
                disabled={isChildrenParts(partsStructure)}
              >
                削除
              </Button>,
              <Button
                key='confirm'
                type='button'
                onClick={onClickConfirm}
                disabled={!(formik.isValid && formik.dirty)}
              >
                確定
              </Button>,
            ]}
            className='mb-4'
          />
          <DataTable
            rowHeight={84}
            columns={columns}
            rows={formik.values.data}
            keyOfRowID='rowID'
            keyOfDeletedID='isDeleted'
            columnsGapX={8}
            edgePaddingX={16}
            stickyOptions={{ top: 0, beforeHeight: 'h-96' }}
            isLoading={isPartsLoading}
            className='overflow-auto max-h-[700px]'
            tableWidth={1760}
          />
          <AddRowButton
            hasBorder={false}
            disabled={
              formik.values.data.length >= MAX_CHILD_PARTS_NUM || isPartsLoading
            }
            onClick={() => {
              formik.setValues({
                data: [
                  ...formik.values.data,
                  {
                    level: 2,
                    amountRequired: '',
                    amountRequiredUnit: '',
                    partsName: '',
                    plantId: '',
                    supportPartsName: '',
                    terminatedFlag: false,
                    traceId: undefined,
                    isDeleted: false,
                    isNew: true,
                    rowID: formik.values.data.length,
                  },
                ],
              });
            }}
            className='w-full pr-4 flex-row-reverse '
          />
          <div className='pt-5' />
        </div>
        <PopupModal
          button={
            <Button
              color='error'
              variant='solid'
              size='default'
              key='submit'
              type='submit'
              disabled={isChildrenParts(partsStructure)}
              onClick={() => handleDeleteClick(formik.values.data[0].traceId!)}
            >
              削除
            </Button>
          }
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          title='部品構成情報を削除しますか？'
        >
          <div className='mb-2.5'>
            <div className='text-base'>
              {!isEmpty(formik.values.data[0]) &&
                <>
                  <div>部品項目：{formik.values.data[0].partsName}</div>
                  <div>補助項目：{formik.values.data[0].supportPartsName}</div>
                  <div>トレース識別子：{formik.values.data[0].traceId}</div>
                </>
              }
            </div>
          </div>
        </PopupModal>
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
              変更
            </Button>
          }
          isOpen={isConfirmModalOpen}
          setIsOpen={setIsConfirmModalOpen}
          title='部品構成情報を変更しますか？'
        >
          <div>
            ※変更内容で情報が上書きされます。部品が紐付け済みの場合は変更後の情報が連携されます。
          </div>
        </PopupModal>
      </form>
    </FormikProvider>
  );
}
