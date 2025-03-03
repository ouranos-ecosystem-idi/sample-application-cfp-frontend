'use client';

import { getOperatorId } from '@/api/accessToken';
import AddRowButton from '@/components/atoms/AddRowButton';
import { Button } from '@/components/atoms/Button';
import CheckBox from '@/components/atoms/CheckBox';
import InputTextBox from '@/components/atoms/InputTextBox';
import { Select } from '@/components/atoms/Select';
import PopupModal from '@/components/molecules/PopupModal';
import SectionHeader from '@/components/molecules/SectionHeader';
import { MAX_CHILD_PARTS_NUM } from '@/lib/constants';
import { convertPartsFormTypeToPartsStructure } from '@/lib/converters';
import {
  AmountRequiredUnit,
  AmountRequiredUnitsList,
  PartsFormRowType,
  PartsFormType,
  PartsStructure,
  Plant,
} from '@/lib/types';
import {
  getFormikErrorMessage,
  isDecimalPartDigitsWithin,
  isIntegerPartDigitsWithin,
  isValidNumberString,
} from '@/lib/utils';
import '@/lib/yup.locale';
import { MinusCircle } from '@phosphor-icons/react/dist/ssr/MinusCircle';
import csv from 'csv-parser';
import {
  ArrayHelpers,
  FieldArray,
  FormikProvider,
  FormikValues,
  useFormik,
} from 'formik';
import {
  CSSProperties,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { tv } from 'tailwind-variants';
import * as Yup from 'yup';


const table = tv({
  base: `table-auto w-[1760px]`,
});
const tr = tv({
  base: 'border-b-[1px] border-b-neutral last:border-none',
});
const th = tv({
  base: 'h-9 p-0 first:pl-5 last:pl-5 pl-4 bg-light-gray font-normal text-xs leading-4 [&_*]:text-xs [&_*]:leading-5',
  variants: {
    isSticky: {
      true: 'sticky top-0',
    }
  },
});
const th_inner = tv({
  base: 'h-7 flex items-center w-full pr-4',
  variants: {
    divideAfter: {
      true: 'border-r border-r-gray',
    }
  }
});
const td = tv({
  base: 'p-0 first:pl-5 last:pl-5 pl-4',
  variants: {
    divideAfter: {
      true: 'py-2',
      false: 'py-5'
    },
  },
  defaultVariants: {
    divideAfter: false
  }
});

const td_inner = tv({
  base: 'flex w-full h-full items-center text-xs break-all pr-4',
  variants: {
    divideAfter: {
      true: 'border-r border-r-gray pr-4 h-[68px]',
    },
  },
});

//CSVヘッダー
export const PART_CSV_HEADERS = {
  partsName: '部品項目',
  supportPartsName: '補助項目',
  partsLabelName: '部品名称',
  partsAddInfo1: 'CFP算出バージョン',
  partsAddInfo2: 'CFP算出期間',
  partsAddInfo3: '任意項目',
  plantId: '事業所識別子',
  amountRequired: '活動量',
  amountRequiredUnit: '単位',
  terminatedFlag: '終端フラグ',
};

export type CsvRow = Record<(keyof typeof PART_CSV_HEADERS)[number], string>;

//CSV読み込み
function readAsText(file: File) {
  return new Promise((resolve: (value: string | undefined) => void) => {
    var fr = new FileReader();
    fr.onload = (e) => {
      let result = e.target?.result;
      if (typeof result === 'string' && !result.endsWith('\n')) {
        result += '\n';
      }
      resolve(typeof result === 'string' ? result : undefined);
    };
    fr.readAsText(file, 'utf-8');
  });
}

//CSVの値をフォームへ設定
function setCsvTextForm(
  name: string,
  value: string | number | null | boolean,
  form: FormikValues
) {
  form.setFieldValue(name, value);
  form.setFieldTouched(name, true);
}

// 共通のテーブルヘッダー
function TableHeader({
  isParentPartsHeader,
  isSticky,
}: {
  isParentPartsHeader: boolean;
  isSticky?: boolean;
}) {
  const stickyStile: CSSProperties = isSticky
    ? {
      top: 40,
      position: 'sticky',
    }
    : {};
  return (
    <thead
      className='z-20'
      style={stickyStile}
    >
      <tr>
        <th
          className={th({ isSticky })}
          style={{ width: '220px', paddingLeft: '16px' }}
          align='left'
        >
          部品項目
        </th>
        <th className={th({ isSticky })} style={{ width: '212px' }} align='left'>
          補助項目
        </th>
        <th className={th({ isSticky })} style={{ width: '212px' }} align='left'>
          部品名称
        </th>
        <th className={th({ isSticky })} style={{ width: '212px' }} align='left'>
          CFP算出バージョン
        </th>
        <th className={th({ isSticky })} style={{ width: '212px' }} align='left'>
          CFP算出期間
        </th>
        <th className={th({ isSticky })} style={{ width: '212px' }} align='left'>
          任意項目
        </th>
        <th className={th({ isSticky })} style={{ width: '370px' }} align='left'>
          <div className={th_inner({ divideAfter: !isParentPartsHeader })}>
            事業所識別子
          </div>
        </th>
        <th className={th({ isSticky })} style={{ width: '212px' }} align='left'>
          {isParentPartsHeader ? '' : '活動量'}
        </th>
        <th className={th({ isSticky })} style={{ width: '212px' }} align='left'>
          単位
        </th>
        <th className={th({ isSticky })} align='center' style={{ width: '44px' }}>
          終端
        </th>
        <th className={th({ isSticky })} style={{ width: '60px' }} />
        <th className={th({ isSticky })} style={{ width: '0px' }} />
      </tr>
    </thead>
  );
}

// フォーム初期値(1行分) undefinedの場合reactがエラーを出すので空文字である必要がある
const initialPart: PartsFormRowType = {
  amountRequired: '',
  amountRequiredUnit: '',
  partsName: '',
  plantId: '',
  supportPartsName: '',
  partsLabelName: '',
  partsAddInfo1: '',
  partsAddInfo2: '',
  partsAddInfo3: '',
  terminatedFlag: false,
};

// フォーム初期値(フォーム全体)
const initialValues: PartsFormType = {
  parentParts: initialPart,
  childrenParts: [],
};

const parentValidationSchema = Yup.object({
  partsName: Yup.string().required().max(50),
  supportPartsName: Yup.string().max(50),
  partsLabelName: Yup.string().required().max(50),
  partsAddInfo1: Yup.string().max(50),
  partsAddInfo2: Yup.string().max(50),
  partsAddInfo3: Yup.string().max(50),
  plantId: Yup.string().required('選択必須'), // yup.locale.ts内のrequiredメッセージとは異なる文言のためここで指定
  amountRequiredUnit: Yup.string().required('選択必須'),
});
const rowValidationSchema = parentValidationSchema.concat(
  Yup.object({
    amountRequired: Yup.string()
      .required()
      .test('intMax5', '整数部5桁以内', (value) =>
        isIntegerPartDigitsWithin(value, 5)
      )
      .test('decimalMax5', '小数点第5位以内', (value) =>
        isDecimalPartDigitsWithin(value, 5)
      ),
  })
);
const validationSchema = Yup.object({
  parentParts: parentValidationSchema,
  childrenParts: Yup.array()
    .required()
    .of(rowValidationSchema)
    .when('parentParts.terminatedFlag', {
      is: (flag: boolean) => flag === false,
      then: (schema) => schema.min(1),
    }),
});

type Props = {
  plants: Plant[];
  onSubmit: (value: PartsStructure) => void;
  isConfirmModalOpen: boolean;
  setIsConfirmModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsRegisterButtonActive: Dispatch<SetStateAction<boolean>>;
  isCsvUpload: boolean;
  setIsCsvUpload: Dispatch<SetStateAction<boolean>>;
  isConfirm: boolean;
  onClickConfirm: (value: PartsStructure, plants: Plant[]) => void;
};

export default function PartsRgisterForm({
  plants,
  onSubmit,
  isConfirmModalOpen,
  setIsConfirmModalOpen,
  setIsRegisterButtonActive,
  isCsvUpload,
  setIsCsvUpload,
  isConfirm,
  onClickConfirm,
}: Props) {
  const selectOptions = plants.reduce<{ [key: string]: string; }>(
    (acc, plant) => {
      acc[plant.plantId || ''] = plant.plantName + ',' + plant.openPlantId;
      return acc;
    },
    {}
  );

  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [isCsvUploadModalOpen, setIsCsvUploadModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isConfirm) return;
    onClickConfirm(
      convertPartsFormTypeToPartsStructure(formik.values, getOperatorId()),
      plants
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirm]);

  const formik = useFormik<PartsFormType>({
    initialValues,
    onSubmit: (values) => {
      onSubmit(convertPartsFormTypeToPartsStructure(values, getOperatorId()));
      setIsConfirmModalOpen(false);
    },
    validationSchema,
  });

  useEffect(() => {
    setIsRegisterButtonActive(formik.isValid && formik.dirty);
  }, [formik, setIsRegisterButtonActive]);

  function isFormRowEmpty(row: PartsFormRowType): boolean {
    return (
      row.amountRequired !== '' ||
      row.amountRequiredUnit !== '' ||
      row.partsName !== '' ||
      row.plantId !== '' ||
      row.supportPartsName !== '' ||
      row.terminatedFlag
    );
  }

  useEffect(() => {
    if (!isCsvUpload) return;
    function isFormEmpty(values: PartsFormType): boolean {
      if (isFormRowEmpty(values.parentParts)) {
        return true;
      }
      for (const child of values.childrenParts) {
        if (isFormRowEmpty(child)) {
          return true;
        }
      }
      return false;
    }
    const FormState = isFormEmpty(formik.values);
    if (FormState) {
      setIsCsvUploadModalOpen(true);
    } else {
      document.getElementById('input_csv')?.click();
    }
    setIsCsvUpload(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCsvUpload]);

  const defaultCsvErrorMessage: string = 'ファイル形式をご確認ください。';
  const [csvErrorMessage, setCsvErrorMessage] = useState<string>(
    defaultCsvErrorMessage
  );

  //CSVレコード読み込み
  function readCsvText(csvText: string): Promise<CsvRow[]> {
    return new Promise((resolve: (value: CsvRow[]) => void) => {
      const stream = csv();
      const results: CsvRow[] = [];
      let lineCount = 0;
      const expectedHeaders = Object.values(PART_CSV_HEADERS);
      let isValidHeaders = true;
      stream.on('data', (data) => {
        results.push(data);
        lineCount++;
      });

      stream.on('end', () => {
        resolve(results as CsvRow[]);
      });

      //header検証
      stream.on('headers', (headers) => {
        isValidHeaders = expectedHeaders.every(
          (header, index) => headers[index] === header
        );
      });

      stream.write(csvText, (error) => {
        if (error || !validCsv(results) || !isValidHeaders || lineCount < 1) {
          setIsErrorModalOpen(true);
        } else {
          stream.emit('end');
        }
      });
    });
  }

  //CSVバリデーション
  const validCsv = (result: CsvRow[]) => {
    const parent = result.at(0);
    const children = result.slice(1);

    if (parent === undefined) return false;

    if (
      parent[PART_CSV_HEADERS.terminatedFlag] === '1' &&
      children.length > 0
    ) {
      setCsvErrorMessage(
        '自社部品の終端フラグがあるため、構成部品は登録できません。'
      );
      return false;
    }
    if (children.length > MAX_CHILD_PARTS_NUM) {
      return false;
    };

    return true;
  };

  //ファイル選択
  const onFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      const csvFile = files[0];
      e.target.value = '';
      setCsvErrorMessage(defaultCsvErrorMessage);
      const csvText = await readAsText(csvFile);

      if (!csvText) {
        setIsErrorModalOpen(true);
        return;
      }
      const result = await readCsvText(csvText);
      mapForm(result);
    }
  };

  const [isCsvUploaded, setIsCsvUploaded] = useState(false);

  useEffect(() => {
    const triggerValidation = async () => {
      if (isCsvUploaded) {
        await formik.validateForm(); // バリデーションが完了するまで待機
        setIsCsvUploaded(false); // バリデーション後にフラグをリセット
      }
    };

    triggerValidation();
  }, [isCsvUploaded, formik]);

  //CSVをフォームへマッピング
  const mapForm = (result: CsvRow[]) => {
    formik.resetForm({ values: initialValues });
    const parent = result.at(0);
    const children = result.slice(1);
    if (parent === undefined) return;

    // Parentの処理
    Object.entries(PART_CSV_HEADERS).forEach(([key, value]) => {
      if (key === 'amountRequired') return;
      if (key === 'terminatedFlag') {
        setCsvTextForm(`parentParts.${key}`, parent[value] === '1', formik);
        return;
      }
      if (key === 'plantId') {
        const selectedPlant = plants.find(
          (plant) => plant.openPlantId === parent[value]
        );
        setCsvTextForm(
          `parentParts.${key}`,
          selectedPlant?.plantId || '',
          formik
        );
        return;
      }
      if (key === 'amountRequiredUnit') {
        setCsvTextForm(
          `parentParts.${key}`,
          AmountRequiredUnitsList.includes(parent[value] as AmountRequiredUnit)
            ? parent[value]
            : '',
          formik
        );
        return;
      }
      setCsvTextForm(`parentParts.${key}`, parent[value], formik);
    });

    // Childrenの処理
    children.forEach((row, index) => {
      Object.entries(PART_CSV_HEADERS).forEach(([key, value]) => {
        if (key === 'terminatedFlag') {
          setCsvTextForm(
            `childrenParts[${index}].${key}`,
            row[value] === '1',
            formik
          );
          return;
        }
        if (key === 'plantId') {
          const selectedPlant = plants.find(
            (plant) => plant.openPlantId === row[value]
          );
          setCsvTextForm(
            `childrenParts[${index}].${key}`,
            selectedPlant?.plantId || '',
            formik
          );
          return;
        }
        if (key === 'amountRequired') {
          // 数値として有効でなければ空文字とする
          if (!isValidNumberString(row[value])) {
            setCsvTextForm(`childrenParts[${index}].${key}`, '', formik);
            return;
          }
        }

        if (key === 'amountRequiredUnit') {
          setCsvTextForm(
            `childrenParts[${index}].${key}`,
            AmountRequiredUnitsList.includes(row[value] as AmountRequiredUnit)
              ? row[value]
              : '',
            formik
          );
          return;
        }
        setCsvTextForm(`childrenParts[${index}].${key}`, row[value], formik);
      });
    });
    setIsCsvUploaded(true);
  };

  // ファイル選択ダイアログ表示
  const openSelectFileDialog = () => {
    setIsCsvUploadModalOpen(false);
    document.getElementById('input_csv')?.click();
  };

  return (
    <div>
      <input
        type='file'
        id='input_csv'
        name='csv'
        title='csv'
        onChange={onFileInput}
        hidden
      />
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <div className='overflow-auto max-h-[750px]'>
            <SectionHeader
              className='pb-4 relative'
              title='親部品(レベル1)'
              variant='h3'
              align='bottom'
            />
            <table className={table()}>
              <TableHeader isParentPartsHeader={true} />
              <tbody>
                <tr className={tr()}>
                  <td className={td()} style={{ paddingLeft: '16px' }}>
                    <InputTextBox
                      error={getFormikErrorMessage({
                        name: 'parentParts.partsName',
                        formik,
                      })}
                      {...formik.getFieldProps('parentParts.partsName')}
                      placeholder='入力必須'
                    />
                  </td>
                  <td className={td()}>
                    <InputTextBox
                      error={getFormikErrorMessage({
                        name: 'parentParts.supportPartsName',
                        formik,
                      })}
                      {...formik.getFieldProps('parentParts.supportPartsName')}
                    />
                  </td>
                  <td className={td()}>
                    <InputTextBox
                      //部品名称
                      error={getFormikErrorMessage({
                        name: 'parentParts.partsLabelName',
                        formik,
                      })}
                      {...formik.getFieldProps('parentParts.partsLabelName')}
                    />
                  </td>
                  <td className={td()}>
                    <InputTextBox
                      //CFP算出バージョン
                      error={getFormikErrorMessage({
                        name: 'parentParts.partsAddInfo1',
                        formik,
                      })}
                      {...formik.getFieldProps('parentParts.partsAddInfo1')}
                    />
                  </td>
                  <td className={td()}>
                    <InputTextBox
                      //CFP算出期間
                      error={getFormikErrorMessage({
                        name: 'parentParts.partsAddInfo2',
                        formik,
                      })}
                      {...formik.getFieldProps('parentParts.partsAddInfo2')}
                    />
                  </td>
                  <td className={td()}>
                    <InputTextBox
                      //任意項目
                      error={getFormikErrorMessage({
                        name: 'parentParts.partsAddInfo3',
                        formik,
                      })}
                      {...formik.getFieldProps('parentParts.partsAddInfo3')}
                    />
                  </td>
                  <td className={td()}>
                    <div className={td_inner()}>
                      <Select
                        className='bg-white'
                        selectOptions={selectOptions}
                        hiddenText='選択必須'
                        error={getFormikErrorMessage({
                          name: 'parentParts.plantId',
                          formik,
                        })}
                        {...formik.getFieldProps(`parentParts.plantId`)}
                        onChange={(e) => {
                          formik.setFieldValue(
                            'parentParts.plantId',
                            e.target.value
                          );
                        }}
                      />
                    </div>
                  </td>
                  <td className={td()}></td>
                  <td className={td()}>
                    <Select
                      selectOptions={AmountRequiredUnitsList.reduce<{
                        [key: string]: string;
                      }>((acc, unit) => {
                        acc[unit] = unit;
                        return acc;
                      }, {})}
                      hiddenText='選択必須'
                      error={getFormikErrorMessage({
                        name: 'parentParts.amountRequiredUnit',
                        formik,
                      })}
                      {...formik.getFieldProps('parentParts.amountRequiredUnit')}
                      onChange={(e) => {
                        formik.setFieldValue(
                          'parentParts.amountRequiredUnit',
                          e.target.value
                        );
                      }}
                    />
                  </td>
                  <td className={td()} align='center'>
                    <CheckBox
                      disabled={formik.values.childrenParts.length > 0}
                      checked={formik.values.parentParts.terminatedFlag}
                      setChecked={(value) => {
                        formik.setFieldValue('parentParts.terminatedFlag', value);
                      }}
                    />
                  </td>
                  <td className={td()} />
                </tr>
              </tbody>
            </table>
            <FieldArray name='childrenParts'>
              {(arrayHelpers: ArrayHelpers<PartsFormRowType[]>) => (
                <div>
                  <SectionHeader
                    title='構成部品(レベル2)'
                    className={`pb-4 sticky top-0 z-20 bg-[#FAFAFA] w-[1760px]`}
                    variant='h3'
                  />
                  <table className={table()}>
                    <TableHeader isParentPartsHeader={false} isSticky={true} />
                    <tbody>
                      {formik.values.childrenParts.map((part, index) => (
                        <tr className={tr()} key={index}>
                          <td className={td()}>
                            <InputTextBox
                              error={getFormikErrorMessage({
                                name: `childrenParts[${index}].partsName`,
                                formik,
                              })}
                              {...formik.getFieldProps(
                                `childrenParts[${index}].partsName`
                              )}
                              placeholder='入力必須'
                            />
                          </td>
                          <td className={td()}>
                            <InputTextBox
                              error={getFormikErrorMessage({
                                name: `childrenParts[${index}].supportPartsName`,
                                formik,
                              })}
                              {...formik.getFieldProps(
                                `childrenParts[${index}].supportPartsName`
                              )}
                            />
                          </td>
                          <td className={td()}>
                            <InputTextBox
                              //部品名称
                              error={getFormikErrorMessage({
                                name: `childrenParts[${index}].partsLabelName`,
                                formik,
                              })}
                              {...formik.getFieldProps(`childrenParts[${index}].partsLabelName`)}
                            />
                          </td>
                          <td className={td()}>
                            <InputTextBox
                              //CFP算出バージョン
                              error={getFormikErrorMessage({
                                name: `childrenParts[${index}].partsAddInfo1`,
                                formik,
                              })}
                              {...formik.getFieldProps(`childrenParts[${index}].partsAddInfo1`)}
                            />
                          </td>
                          <td className={td()}>
                            <InputTextBox
                              //CFP算出期間
                              error={getFormikErrorMessage({
                                name: `childrenParts[${index}].partsAddInfo2`,
                                formik,
                              })}
                              {...formik.getFieldProps(`childrenParts[${index}].partsAddInfo2`)}
                            />
                          </td>
                          <td className={td()}>
                            <InputTextBox
                              //任意項目
                              error={getFormikErrorMessage({
                                name: `childrenParts[${index}].partsAddInfo3`,
                                formik,
                              })}
                              {...formik.getFieldProps(`childrenParts[${index}].partsAddInfo3`)}
                            />
                          </td>
                          <td className={td({ divideAfter: true })}>
                            <div className={td_inner({ divideAfter: true })}>
                              <Select
                                className='bg-white'
                                selectOptions={selectOptions}
                                hiddenText='選択必須'
                                error={getFormikErrorMessage({
                                  name: `childrenParts[${index}].plantId`,
                                  formik,
                                })}
                                {...formik.getFieldProps(
                                  `childrenParts[${index}].plantId`
                                )}
                                onChange={(e) => {
                                  formik.setFieldValue(
                                    `childrenParts[${index}].plantId`,
                                    e.target.value
                                  );
                                }}
                              />
                            </div>
                          </td>
                          <td className={td()}>
                            <InputTextBox
                              type='number'
                              align='right'
                              placeholder='半角数字で入力*'
                              error={getFormikErrorMessage({
                                name: `childrenParts[${index}].amountRequired`,
                                formik,
                              })}
                              {...formik.getFieldProps(
                                `childrenParts[${index}].amountRequired`
                              )}
                            />
                          </td>
                          <td className={td()}>
                            <Select
                              selectOptions={AmountRequiredUnitsList.reduce<{
                                [key: string]: string;
                              }>((acc, unit) => {
                                acc[unit] = unit;
                                return acc;
                              }, {})}
                              hiddenText='選択必須'
                              error={getFormikErrorMessage({
                                name: `childrenParts[${index}].amountRequiredUnit`,
                                formik,
                              })}
                              {...formik.getFieldProps(
                                `childrenParts[${index}].amountRequiredUnit`
                              )}
                              onChange={(e) => {
                                formik.setFieldValue(
                                  `childrenParts[${index}].amountRequiredUnit`,
                                  e.target.value
                                );
                              }}
                            />
                          </td>
                          <td className={td()} align='center'>
                            <CheckBox
                              checked={
                                formik.values.childrenParts[index].terminatedFlag
                              }
                              setChecked={(value) => {
                                formik.setFieldValue(
                                  `childrenParts[${index}].terminatedFlag`,
                                  value
                                );
                              }}
                            />
                          </td>
                          <td className={td()} align='center'>
                            <MinusCircle
                              className='cursor-pointer'
                              size={24}
                              color='#F65E2D'
                              onClick={() => arrayHelpers.remove(index)}
                            />
                          </td>
                          <td className={td()} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {formik.values.childrenParts.length === 0 && (
                    <div className='w-full text-center py-20 text-lg font-semibold text-neutral'>
                      追加された構成部品はありません
                    </div>
                  )}
                  <AddRowButton
                    hasBorder={true}
                    disabled={
                      formik.values.parentParts.terminatedFlag ||
                      formik.values.childrenParts.length >= MAX_CHILD_PARTS_NUM
                    }
                    onClick={() => arrayHelpers.push(initialPart)}
                    className='pr-[31px] flex-row-reverse pb-5 '
                    wLength={1760}
                  />
                </div>
              )}
            </FieldArray>
          </div>
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
                登録
              </Button>
            }
            isOpen={isConfirmModalOpen}
            setIsOpen={setIsConfirmModalOpen}
            title='部品構成情報を登録しますか？'
          >
            <div>
              ※すでに同一部品（部品項目+補助項目+事業所識別子）が登録されている場合、現在の入力内容で上書きされます。
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
                onClick={openSelectFileDialog}
              >
                ファイルを選択
              </Button>
            }
            isOpen={isCsvUploadModalOpen}
            setIsOpen={setIsCsvUploadModalOpen}
            title='入力した内容を上書きして、CSVファイルを取り込みますか？'
          >
          </PopupModal>
        </form>
        <PopupModal
          type='error'
          isOpen={isErrorModalOpen}
          setIsOpen={setIsErrorModalOpen}
          title='CSVファイルのアップロードに失敗しました。'
        >
          <p>{csvErrorMessage}</p>
        </PopupModal>
      </FormikProvider>
    </div>
  );
}
