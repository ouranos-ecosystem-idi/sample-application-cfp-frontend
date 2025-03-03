import { Button } from '@/components/atoms/Button';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';
import InputTextBox from '@/components/atoms/InputTextBox';
import LevelIcon from '@/components/atoms/LevelIcon';
import SkeletonColumn from '@/components/atoms/SkeletonColumn';
import StatusBadge from '@/components/atoms/StatusBadge';
import Tab from '@/components/atoms/Tab';
import TerminalIcon from '@/components/atoms/TerminalIcon';
import {
  Column,
  DataTable,
  HeaderForTabs,
  ParentHeader,
} from '@/components/molecules/DataTable';
import PopupModal from '@/components/molecules/PopupModal';
import SectionHeader from '@/components/molecules/SectionHeader';
import CertificationModal from '@/components/organisms/CertificationModal';
import { doTry } from '@/lib/try';
import {
  CertificationDataType,
  CfpTypes,
  CfpUnits,
  DqrSheetDataType,
  DqrType,
  DqrValueType,
  Operator,
  Parts,
  PartsWithCfpDataType,
  Plant,
  TradeRequestDataType,
} from '@/lib/types';
import {
  calcCfpSum,
  calcDqrSum,
  convertFormNumberToNumber,
  formatNumber,
  getFormikErrorMessage,
  getRequestStatus,
  getTradeRequestStatusColor,
  getTradeRequestStatusName,
  isDecimalPartDigitsWithin,
  isEmpty,
  isIntegerPartDigitsWithin,
  isOwnParts,
  selectUnitFromAmountRequiredUnit,
} from '@/lib/utils';
import '@/lib/yup.locale';
import { Eye } from '@phosphor-icons/react/dist/ssr/Eye';
import { FilePlus } from '@phosphor-icons/react/dist/ssr/FilePlus';
import {
  FormikErrors,
  FormikProvider,
  useFormik,
  yupToFormErrors,
} from 'formik';
import { ComponentProps, ReactNode, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { PlantCell } from './PlantCell';

type Props = {
  parentPartWithCfpData?: PartsWithCfpDataType;
  childrenPartsWithCfpWithRequestData: (
    PartsWithCfpDataType & { tradeRequest?: TradeRequestDataType; }
  )[];
  operatorsData: Operator[];
  plants: Plant[];
  certifications: CertificationDataType[];
  onTotalChange?: (
    total: {
      preEmission: { parent: number; children: number; };
      mainEmission: { parent: number; children: number; };
    },
    dqr: DqrSheetDataType,
    unit?: CfpUnits
  ) => void;
  onSubmit: (partsWithCfpDataList: PartsWithCfpDataType[]) => Promise<void>;
  onModalRefresh: (
    data: ComponentProps<typeof CertificationModal>['data'],
    setData: ComponentProps<typeof CertificationModal>['setData']
  ) => Promise<void>;
  onUploadCert: ComponentProps<typeof CertificationModal>['onUploadCert'];
  onDownloadCert: ComponentProps<typeof CertificationModal>['onDownloadCert'];
  onDeleteCert: ComponentProps<typeof CertificationModal>['onDeleteCert'];
  getFormData?: (fetch: () => FormType) => void;
  isPartsLoading: boolean;
  isCfpDataLoading: boolean;
  isCertsLoading: boolean;
};

// テーブル表示用に別途行ごとの型を定義
export type CfpRegisterTableRowType = PartsWithCfpDataType['parts'] &
  PartsWithCfpDataType['cfps'] &
  Partial<TradeRequestDataType> & {
    preEmission?: number;
    mainEmission?: number;
    isEditable: boolean;
    preTeR?: number;
    preGeR?: number;
    preTiR?: number;
    mainTeR?: number;
    mainGeR?: number;
    mainTiR?: number;
    unit?: CfpUnits;
  };

export function convertCfpFormToPartsWithCfpData(
  formRow: FormRowType,
  tableRow: CfpRegisterTableRowType
): PartsWithCfpDataType {
  const preDqrValue: DqrValueType = {
    GeR: isEmpty(formRow.preGeR) ? 0 : Number(formRow.preGeR),
    TeR: isEmpty(formRow.preTeR) ? 0 : Number(formRow.preTeR),
    TiR: isEmpty(formRow.preTiR) ? 0 : Number(formRow.preTiR),
  };

  const mainDqrValue: DqrValueType = {
    GeR: isEmpty(formRow.mainGeR) ? 0 : Number(formRow.mainGeR),
    TeR: isEmpty(formRow.mainTeR) ? 0 : Number(formRow.mainTeR),
    TiR: isEmpty(formRow.mainTiR) ? 0 : Number(formRow.mainTiR),
  };

  let result: PartsWithCfpDataType;
  if (tableRow.level === 1) {
    result = {
      parts: {
        ...tableRow,
      },
      cfps: {
        preProduction: {
          traceId: tableRow.traceId!,
          unit: selectUnitFromAmountRequiredUnit(tableRow.amountRequiredUnit),
          cfpId: tableRow.preProduction?.cfpId,
          emission: isEmpty(formRow.preEmission)
            ? 0
            : Number(formRow?.preEmission),
          dqrType: 'preProcessing',
          dqrValue: preDqrValue,
        },
        mainProduction: {
          traceId: tableRow.traceId!,
          cfpId: tableRow.mainProduction?.cfpId,
          unit: selectUnitFromAmountRequiredUnit(tableRow.amountRequiredUnit),
          emission: isEmpty(formRow.mainEmission)
            ? 0
            : Number(formRow.mainEmission),
          dqrType: 'mainProcessing',
          dqrValue: mainDqrValue,
        },
        preComponent: {
          traceId: tableRow.traceId!,
          cfpId: tableRow.preComponent?.cfpId,
          unit: selectUnitFromAmountRequiredUnit(tableRow.amountRequiredUnit),
          emission: tableRow.preComponent?.emission ?? 0,
          dqrType: 'preProcessing',
          dqrValue: preDqrValue,
        },
        mainComponent: {
          traceId: tableRow.traceId!,
          cfpId: tableRow.mainComponent?.cfpId,
          unit: selectUnitFromAmountRequiredUnit(tableRow.amountRequiredUnit),
          emission: tableRow.mainComponent?.emission ?? 0,
          dqrType: 'mainProcessing',
          dqrValue: mainDqrValue,
        },
      },
    };
  } else {
    result = {
      parts: {
        ...tableRow,
      },
      cfps: {
        preProduction: {
          traceId: tableRow.traceId!,
          cfpId: tableRow.preProduction?.cfpId,
          unit: selectUnitFromAmountRequiredUnit(tableRow.amountRequiredUnit),
          emission: tableRow.preProduction?.emission ?? 0,
          dqrType: 'preProcessing',
          dqrValue: preDqrValue,
        },
        mainProduction: {
          traceId: tableRow.traceId!,
          cfpId: tableRow.mainProduction?.cfpId,
          unit: selectUnitFromAmountRequiredUnit(tableRow.amountRequiredUnit),
          emission: tableRow.mainProduction?.emission ?? 0,
          dqrType: 'mainProcessing',
          dqrValue: mainDqrValue,
        },
        preComponent: {
          traceId: tableRow.traceId!,
          cfpId: tableRow.preComponent?.cfpId,
          unit: selectUnitFromAmountRequiredUnit(tableRow.amountRequiredUnit),
          emission: isEmpty(formRow?.preEmission)
            ? 0
            : Number(formRow?.preEmission),
          dqrType: 'preProcessing',
          dqrValue: preDqrValue,
        },
        mainComponent: {
          traceId: tableRow.traceId!,
          cfpId: tableRow.mainComponent?.cfpId,
          unit: selectUnitFromAmountRequiredUnit(tableRow.amountRequiredUnit),
          emission: isEmpty(formRow?.mainEmission)
            ? 0
            : Number(formRow?.mainEmission),
          dqrType: 'mainProcessing',
          dqrValue: mainDqrValue,
        },
      },
    };
  }
  return result;
}

// データごとに表示すべきcfpTypeを判定
function getCfpType(
  type: 'pre' | 'main',
  level: Parts['level'],
  terminatedFlag: Parts['terminatedFlag']
): CfpTypes {
  if (level === 1) {
    return type === 'pre' ? 'preProduction' : 'mainProduction';
  } else if (terminatedFlag === true) {
    return type === 'pre' ? 'preComponent' : 'mainComponent';
  } else {
    return type === 'pre' ? 'preProductionResponse' : 'mainProductionResponse';
  }
}

//データごとに表示すべきdqrを判定
function getDqrType(
  type: 'pre' | 'main',
  level: Parts['level'],
  terminatedFlag: Parts['terminatedFlag']
): DqrType {
  if (level === 1 || terminatedFlag === true) {
    return type === 'pre' ? 'preProcessing' : 'mainProcessing';
  } else {
    return type === 'pre' ? 'preProcessingResponse' : 'mainProcessingResponse';
  }
}

//DQRValueを取得する
function getDqrValue(
  partsWithCfpData: PartsWithCfpDataType,
  type: 'pre' | 'main',
  level: Parts['level'],
  terminatedFlag: Parts['terminatedFlag']
): DqrValueType | undefined {
  const cfpData =
    partsWithCfpData.cfps?.[getCfpType(type, level, terminatedFlag)];
  if (cfpData?.dqrType === getDqrType(type, level, terminatedFlag)) {
    return cfpData.dqrValue;
  }
}

// フォーム定義(行ごと) numberは空の時に空文字となるためstringを含める
export type FormRowType = {
  preEmission?: number | string;
  mainEmission?: number | string;
  isEditable: boolean; // バリデーションの出し分けのためフォームに含める
  preTeR?: number | string;
  preTiR?: number | string;
  preGeR?: number | string;
  mainTeR?: number | string;
  mainTiR?: number | string;
  mainGeR?: number | string;
};
// フォーム定義(全体)
export type FormType = {
  data: FormRowType[];
};

const dqrValidation = (isRequired: boolean = false) => {
  const validator = Yup.string()
    .test(
      'decimalMax5',
      '小数点第5位以内',
      (value) =>
        value === undefined || isDecimalPartDigitsWithin(value.toString(), 5)
    )
    .test(
      'integerMax5',
      '整数部5桁以内',
      (value) =>
        value === undefined || isIntegerPartDigitsWithin(value.toString(), 5)
    );
  return isRequired ? validator.required() : validator;
};

const cfpValidation = (isRequired: boolean = false) => {
  const validator = Yup.number()
    .test(
      'intMax5',
      '整数部5桁以内',
      (value) =>
        value === undefined || isIntegerPartDigitsWithin(value.toString(), 5)
    )
    .test(
      'decimalMax5',
      '小数点第5位以内',
      (value) =>
        value === undefined || isDecimalPartDigitsWithin(value.toString(), 5)
    );
  return isRequired ? validator.required() : validator;
};

// バリデーション定義(行ごと)
const rowValidationSchema: Yup.Lazy<FormRowType> = Yup.lazy(
  (formRow: FormRowType) => {
    // Editableでない場合はバリデーション対象としない
    if (!formRow.isEditable) {
      return Yup.object({ isEditable: Yup.boolean().required() });
    } else {
      const isPreDqrEntered =
        !isEmpty(formRow.preTeR) ||
        !isEmpty(formRow.preGeR) ||
        !isEmpty(formRow.preTiR);
      const isMainDqrEntered =
        !isEmpty(formRow.mainTeR) ||
        !isEmpty(formRow.mainGeR) ||
        !isEmpty(formRow.mainTiR);
      return Yup.object({
        isEditable: Yup.boolean().required(),
        preEmission: cfpValidation(isPreDqrEntered),
        mainEmission: cfpValidation(isMainDqrEntered),
        preTeR: dqrValidation(!isEmpty(formRow.preEmission) || isPreDqrEntered),
        preTiR: dqrValidation(!isEmpty(formRow.preEmission) || isPreDqrEntered),
        preGeR: dqrValidation(!isEmpty(formRow.preEmission) || isPreDqrEntered),
        mainTeR: dqrValidation(
          !isEmpty(formRow.mainEmission) || isMainDqrEntered
        ),
        mainTiR: dqrValidation(
          !isEmpty(formRow.mainEmission) || isMainDqrEntered
        ),
        mainGeR: dqrValidation(
          !isEmpty(formRow.mainEmission) || isMainDqrEntered
        ),
      });
    }
  }
);

// バリデーション定義(全体)
const validationSchema: Yup.ObjectSchema<FormType> = Yup.object().shape({
  // フォームのある行=登録対象となる行が最低1つは必要
  data: Yup.array().of(rowValidationSchema).required().min(1),
});

// タブ バリデーションメッセージ
const cfpDqrValidationMessage = (formValues: FormType, index: number) => {
  const errorMessages = ['DQRを入力してください。', 'CFPを入力してください。'];
  const isInvalid = formValues.data.some((data) => {
    if (!data.isEditable) return;
    if (index === cfpRegisterHeaderTabs.DQR) {
      const isPreValidate =
        (!isEmpty(data.preGeR) ||
          !isEmpty(data.preTeR) ||
          !isEmpty(data.preTiR)) &&
        isEmpty(data.preEmission);
      const isMainValidate =
        (!isEmpty(data.mainGeR) ||
          !isEmpty(data.mainTeR) ||
          !isEmpty(data.mainTiR)) &&
        isEmpty(data.mainEmission);
      if (isPreValidate || isMainValidate) return true;
    }
    if (index === cfpRegisterHeaderTabs.CFP) {
      const isPreValidate =
        !isEmpty(data.preEmission) &&
        (isEmpty(data.preGeR) || isEmpty(data.preTeR) || isEmpty(data.preTiR));

      const isMainValidate =
        !isEmpty(data.mainEmission) &&
        (isEmpty(data.mainGeR) ||
          isEmpty(data.mainTeR) ||
          isEmpty(data.mainTiR));

      if (isPreValidate || isMainValidate) return true;
    }
  });

  return isInvalid ? errorMessages[index] : '';
};

// 登録ボタン活性制御のための追加バリデーション
function hasBlankFormRow(form: FormType) {
  return (
    form.data.findIndex(
      (row) =>
        row.isEditable &&
        isEmpty(row.preEmission) &&
        isEmpty(row.mainEmission) &&
        isEmpty(row.preGeR) &&
        isEmpty(row.preTeR) &&
        isEmpty(row.preTiR) &&
        isEmpty(row.mainGeR) &&
        isEmpty(row.mainTeR) &&
        isEmpty(row.mainTiR)
    ) !== -1
  );
}

const cfpRegisterHeaderTabs: { [key: string]: number; } = {
  CFP: 0,
  DQR: 1,
};

function HeaderTab({
  tabs,
  tabIndex,
  setTabIndex,
  errorMessage = '',
}: {
  tabs: string[];
  tabIndex: number;
  setTabIndex: (index: number) => void;
  errorMessage?: string;
}) {
  return (
    <>
      依頼・回答情報
      <Tab
        key='tab'
        className='ml-5'
        tabs={tabs}
        width={80}
        activeTabIndex={tabIndex}
        onSelect={setTabIndex}
      />
      <div className='text-[10px] text-error inline-flex relative align-bottom ml-1 leading-4'>
        {errorMessage}
      </div>
    </>
  );
}

type CfpColumnProps = {
  level: 1 | 2 | undefined;
  value: any;
  isEditable: boolean | undefined;
  inputText: ReactNode;
  isChildrenCfpDataLoading: boolean;
  isParentCfpDataLoading: boolean;
};
const CfpColumn = ({
  level,
  value,
  inputText,
  isEditable,
  isChildrenCfpDataLoading,
  isParentCfpDataLoading,
}: CfpColumnProps) => {
  if (
    (level === 2 && isChildrenCfpDataLoading) ||
    (level === 1 && isParentCfpDataLoading)
  )
    return <SkeletonColumn className='py-1' />;
  else if (isEditable) return <>{inputText}</>;
  else if (value === undefined) return <DisplayHyphen />;
  else return <div className='px-3 text-xs'>{value}</div>;
};

export default function CfpRegisterTable({
  parentPartWithCfpData,
  childrenPartsWithCfpWithRequestData,
  operatorsData,
  plants = [],
  certifications,
  onTotalChange = () => { },
  onSubmit,
  onModalRefresh,
  onUploadCert,
  onDownloadCert,
  onDeleteCert,
  getFormData,
  isPartsLoading,
  isCfpDataLoading: isChildrenCfpDataLoading,
  isCfpDataLoading: isParentCfpDataLoading,
  isCertsLoading,
}: Props) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [certificationModalData, setCertificationModalData] =
    useState<ComponentProps<typeof CertificationModal>['data']>();
  const tabs = Object.keys(cfpRegisterHeaderTabs);
  const [tabIndex, setTabIndex] = useState(0);
  const [tabErrorMessage, setTabErrorMessage] = useState<string>('');

  const headerForTabs: HeaderForTabs<
    CfpRegisterTableRowType & { certification?: void; }
  > = {
    startHeaders: [
      'level',
      'partsName',
      'supportPartsName',
      'plantId',
      'traceId',
      'amountRequired',
      'tradeStatus',
      'upstreamOperatorId',
    ],
    tabHeaders: [
      ['preEmission', 'mainEmission', 'unit'],
      ['preTeR', 'preTiR', 'preGeR', 'mainTeR', 'mainTiR', 'mainGeR'],
    ],
    endHeaders: ['certification'],
  };

  const parentHeaders: ParentHeader[] = [
    {
      id: 'parts',
      colspan: 6,
      headerElement: (
        <div className='flex'>
          <div className='text-base font-semibold bg-[#FAFAFA]'>
            部品構成情報
          </div>
          <div className='text-[10px] ml-2 font-normal leading-4 flex items-end'>
            ※CFPを登録すると、部品紐付けした取引先に開示されます
          </div>
        </div>
      ),
    },
    {
      id: 'reqAndRes',
      colspan: 6,
      headerElement: HeaderTab({
        tabs,
        tabIndex,
        setTabIndex,
        errorMessage: tabErrorMessage,
      }),
    },
  ];

  // 渡されたデータをテーブルで扱える形式に変換
  const dataForTable: CfpRegisterTableRowType[] = useMemo(() => {
    // 親部品がない場合、データは出さない
    if (!parentPartWithCfpData) return [];
    // 親部品がある場合、テーブル用データの最初の要素とする
    const _rows: (PartsWithCfpDataType & { tradeRequest?: TradeRequestDataType; })[] =
      [parentPartWithCfpData, ...childrenPartsWithCfpWithRequestData];
    return _rows.map(
      (data) => {
        const cfpPre =
          data.cfps?.[
          getCfpType('pre', data.parts.level, data.parts.terminatedFlag)
          ];
        const cfpMain =
          data.cfps?.[
          getCfpType('main', data.parts.level, data.parts.terminatedFlag)
          ];
        const dqrValuePre = getDqrValue(
          data,
          'pre',
          data.parts.level,
          data.parts.terminatedFlag
        );
        const dqrValueMain = getDqrValue(
          data,
          'main',
          data.parts.level,
          data.parts.terminatedFlag
        );

        // cfpPreかMainが片方のみ存在 or unitが等しい前提だが、もし異なる場合Preが優先される
        const unit = cfpPre?.unit ?? cfpMain?.unit;
        return {
          ...data.parts,
          ...data.cfps,
          upstreamOperatorId: data.tradeRequest?.upstreamOperatorId,
          tradeStatus: data.tradeRequest?.tradeStatus,
          preEmission: cfpPre?.emission,
          mainEmission: cfpMain?.emission,
          unit,
          isEditable: isOwnParts(data.parts.level, data.parts.terminatedFlag),
          openOperatorInfo:
            data.parts.level === 2
              ? operatorsData.find(
                (op) => op.operatorId === data.tradeRequest?.upstreamOperatorId
              )
              : null,
          preTeR: dqrValuePre?.TeR,
          preTiR: dqrValuePre?.TiR,
          preGeR: dqrValuePre?.GeR,
          mainTeR: dqrValueMain?.TeR,
          mainTiR: dqrValueMain?.TiR,
          mainGeR: dqrValueMain?.GeR,
        };
      }
    );
  }, [
    childrenPartsWithCfpWithRequestData,
    parentPartWithCfpData,
    operatorsData,
  ]);

  const initialValues: FormType = useMemo(
    () => ({
      data: dataForTable.map((data) => ({
        preEmission: data.preEmission ?? '',
        mainEmission: data.mainEmission ?? '',
        isEditable: data.isEditable,
        preTeR: data.preTeR ?? '',
        preTiR: data.preTiR ?? '',
        preGeR: data.preGeR ?? '',
        mainGeR: data.mainGeR ?? '',
        mainTiR: data.mainTiR ?? '',
        mainTeR: data.mainTeR ?? '',
      })),
    }),
    [dataForTable]
  );

  const initialErrors = useMemo(
    () =>
      doTry(() => {
        validationSchema.validateSync(initialValues);
      }).fold<FormikErrors<FormType>>(yupToFormErrors, () => ({})),
    [initialValues]
  );

  const formik = useFormik<FormType>({
    onSubmit: (form) => {
      const rowsForSubmit = form.data.reduce<PartsWithCfpDataType[]>(
        (result, row, index) => {
          if (row.isEditable) {
            result.push(
              convertCfpFormToPartsWithCfpData(row, dataForTable[index])
            );
          }
          return result;
        },
        []
      );
      onSubmit(rowsForSubmit);
      setIsConfirmModalOpen(false);
    },
    validationSchema,
    initialErrors: initialErrors,
    initialValues: initialValues,
    enableReinitialize: true,
  });

  useEffect(() => {
    if (getFormData) {
      // getFormData が存在するかチェック
      // getFormData関数に、フォームデータを返す関数を提供
      getFormData(() => formik.values);
    }
  }, [formik.values, getFormData]);

  useEffect(() => {
    setTabErrorMessage(cfpDqrValidationMessage(formik.values, tabIndex));
  }, [formik.values, tabIndex]);

  // CFP計算・その後propsで渡された処理を実行
  useEffect(() => {
    // 構成部品のCFP値を計算
    const childrenEmissions = calcCfpSum(
      dataForTable.slice(1).map((data, index) => ({
        // 構成部品のamountRequiredがnullになることはない前提のため、nullが入っていた場合0として計算
        amountRequired: data.amountRequired ?? 0,
        preEmission: convertFormNumberToNumber(
          formik.values.data[index + 1]?.preEmission ?? ''
        ),
        mainEmission: convertFormNumberToNumber(
          formik.values.data[index + 1]?.mainEmission ?? ''
        ),
      }))
    );

    const dqrValue = calcDqrSum(
      dataForTable.slice(1).map((data, index) => ({
        // 構成部品のamountRequiredがnullになることはない前提のため、nullが入っていた場合0として計算
        amountRequired: data.amountRequired ?? 0,
        preEmission: convertFormNumberToNumber(
          formik.values.data[index + 1]?.preEmission ?? ''
        ),
        mainEmission: convertFormNumberToNumber(
          formik.values.data[index + 1]?.mainEmission ?? ''
        ),
        preTeR: convertFormNumberToNumber(
          formik.values.data[index + 1]?.preTeR ?? ''
        ),
        preGeR: convertFormNumberToNumber(
          formik.values.data[index + 1]?.preGeR ?? ''
        ),
        preTiR: convertFormNumberToNumber(
          formik.values.data[index + 1]?.preTiR ?? ''
        ),
        mainTiR: convertFormNumberToNumber(
          formik.values.data[index + 1]?.mainTiR ?? ''
        ),
        mainTeR: convertFormNumberToNumber(
          formik.values.data[index + 1]?.mainTeR ?? ''
        ),
        mainGeR: convertFormNumberToNumber(
          formik.values.data[index + 1]?.mainGeR ?? ''
        ),
      })),
      {
        preEmission:
          convertFormNumberToNumber(formik.values.data[0]?.preEmission ?? '') ??
          0,
        mainEmission:
          convertFormNumberToNumber(
            formik.values.data[0]?.mainEmission ?? ''
          ) ?? 0,
        preTeR: convertFormNumberToNumber(formik.values.data[0]?.preTeR ?? ''),
        preGeR: convertFormNumberToNumber(formik.values.data[0]?.preGeR ?? ''),
        preTiR: convertFormNumberToNumber(formik.values.data[0]?.preTiR ?? ''),
        mainTiR: convertFormNumberToNumber(
          formik.values.data[0]?.mainTiR ?? ''
        ),
        mainTeR: convertFormNumberToNumber(
          formik.values.data[0]?.mainTeR ?? ''
        ),
        mainGeR: convertFormNumberToNumber(
          formik.values.data[0]?.mainGeR ?? ''
        ),
      }
    );
    onTotalChange(
      // 第一引数に計算結果を渡す
      {
        preEmission: {
          parent:
            convertFormNumberToNumber(
              formik.values.data[0]?.preEmission ?? ''
            ) ?? 0,
          children: childrenEmissions.preEmission,
        },
        mainEmission: {
          parent:
            convertFormNumberToNumber(
              formik.values.data[0]?.mainEmission ?? ''
            ) ?? 0,
          children: childrenEmissions.mainEmission,
        },
      },
      dqrValue,
      // 第二引数には単位を渡す
      selectUnitFromAmountRequiredUnit(
        dataForTable.find((d) => d.level === 1)?.amountRequiredUnit
      )
    );
  }, [dataForTable, formik.values.data, onTotalChange]);

  const [dqrRequiredStates, setDqrRequiredStates] = useState(() =>
    dataForTable.map(() => ({
      preCfpRequired: false,
      mainCfpRequired: false,
    }))
  );

  const [cfpRequiredStates, setCfpRequiredStates] = useState(() =>
    dataForTable.map(() => ({
      preDqrRequired: false,
      mainDqrRequired: false,
    }))
  );

  // 列定義
  const columns: Column<
    CfpRegisterTableRowType & {
      openOperatorInfo?: Operator;
      certification?: void;
    }
  >[] = useMemo(
    () => [
      {
        id: 'level',
        headerElement: 'レベル',
        width: 56,
        renderCell: (value, row) => (
          <div className='flex gap-1'>
            <LevelIcon level={value} />
            {row.terminatedFlag ? <TerminalIcon /> : <></>}
          </div>
        ),
      },
      {
        id: 'partsName',
        headerElement: '部品項目',
        width: 80,
      },
      {
        id: 'supportPartsName',
        headerElement: '補助項目',
        renderCell: (value) =>
          isEmpty(value) ? <DisplayHyphen className='text-xs' /> : value,
        width: 76,
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
        width: 80,
        renderCell: (value) => (
          <PlantCell plantId={value} plants={plants} size='xs' />
        ),
      },
      {
        id: 'traceId',
        headerElement: 'トレース識別子',
        width: 124,
      },
      {
        id: 'amountRequired',
        headerElement: '活動量(単位)',
        width: 100,
        justify: 'end',
        divideAfter: true,
        renderCell: (value, row) =>
          row.level === 1 ? (
            <div className='line-clamp-2 text-xs'>
              {1 + ' ' + row.amountRequiredUnit}
            </div>
          ) : value === null ? (
            <DisplayHyphen />
          ) : (
            <div className='line-clamp-2 text-xs'>
              {formatNumber(value) + ' ' + row.amountRequiredUnit}
            </div>
          ),
      },
      {
        id: 'tradeStatus',
        headerElement: 'ステータス',
        justify: 'center',
        justifyHeader: 'center',
        width: 72,
        renderCell: (value, row) => {
          if (row.level === 2 && isChildrenCfpDataLoading)
            return <SkeletonColumn className='py-1' />;
          if (row.level !== undefined && row.terminatedFlag !== undefined &&
            !isOwnParts(row.level, row.terminatedFlag)
          ) return (
            <StatusBadge
              color={getTradeRequestStatusColor(getRequestStatus(value?.requestStatus))}
              text={getTradeRequestStatusName(getRequestStatus(value?.requestStatus))}
            />
          );
          else return <DisplayHyphen />;
        },
      },
      {
        id: 'upstreamOperatorId',
        headerElement: (
          <div>
            事業者名
            <br />
            事業者識別子
          </div>
        ),
        width: 124,
        renderCell: (value, row) => {
          if (row.level === 2 && isChildrenCfpDataLoading)
            return <SkeletonColumn className='py-1' />;
          if (isEmpty(value)) return <DisplayHyphen />;
          else
            return (
              <div>
                <span className='text-xs line-clamp-1'>
                  {row.openOperatorInfo?.operatorName ?? ''}
                </span>
                <span className='text-xs line-clamp-1'>
                  {row.openOperatorInfo?.openOperatorId ?? ''}
                </span>
              </div>
            );
        },
      },
      {
        id: 'preEmission',
        headerElement: (
          <div>
            原材料取得及び前処理
            <br />
            排出量
          </div>
        ),
        width: 148,
        justify: 'end',
        renderCell: (value, row, rowIndex) => {
          if (
            (row.level === 2 && isChildrenCfpDataLoading) ||
            (row.level === 1 && isParentCfpDataLoading)
          )
            return <SkeletonColumn className='py-1' />;
          else if (row.isEditable) {
            return (
              <InputTextBox
                align='right'
                type='number'
                {...formik.getFieldProps(`data[${rowIndex}][preEmission]`)}
                value={formik.values.data[rowIndex]?.preEmission ?? ''}
                error={getFormikErrorMessage({
                  name: `data[${rowIndex}][preEmission]`,
                  formik,
                })}
                placeholder={
                  cfpRequiredStates[rowIndex]?.preDqrRequired &&
                    (!formik.isValid || hasBlankFormRow(formik.values))
                    ? '入力必須'
                    : ''
                }
                onBlur={(e) => {
                  const { value } = e.target;
                  formik.handleBlur(e);
                  // 状態更新ロジックを値が空かどうかで条件分岐
                  setDqrRequiredStates((current) => {
                    const updated = [...current];
                    updated[rowIndex] = {
                      ...updated[rowIndex],
                      preCfpRequired: value !== '',
                    };
                    return updated;
                  });
                }}
              />
            );
          } else if (value === undefined) return <DisplayHyphen />;
          else return <div className='px-3 text-xs'>{value}</div>;
        },
      },
      {
        id: 'mainEmission',
        headerElement: (
          <div>
            主な製造
            <br />
            排出量
          </div>
        ),
        width: 148,
        justify: 'end',
        renderCell: (value, row, rowIndex) => {
          if (
            (row.level === 2 && isChildrenCfpDataLoading) ||
            (row.level === 1 && isParentCfpDataLoading)
          )
            return <SkeletonColumn className='py-1' />;
          else if (row.isEditable) {
            return (
              <InputTextBox
                align='right'
                type='number'
                {...formik.getFieldProps(`data[${rowIndex}][mainEmission]`)}
                value={formik.values.data[rowIndex]?.mainEmission ?? ''}
                error={getFormikErrorMessage({
                  name: `data[${rowIndex}][mainEmission]`,
                  formik,
                })}
                placeholder={
                  cfpRequiredStates[rowIndex]?.mainDqrRequired &&
                    (!formik.isValid || hasBlankFormRow(formik.values))
                    ? '入力必須'
                    : ''
                }
                onBlur={(e) => {
                  const { value } = e.target;
                  formik.handleBlur(e);
                  // 状態更新ロジックを値が空かどうかで条件分岐
                  setDqrRequiredStates((current) => {
                    const updated = [...current];
                    updated[rowIndex] = {
                      ...updated[rowIndex],
                      mainCfpRequired: value !== '',
                    };
                    return updated;
                  });
                }}
              />
            );
          } else if (value === undefined) return <DisplayHyphen />;
          else return <div className='px-3 text-xs'>{value}</div>;
        },
      },

      {
        id: 'unit',
        headerElement: '単位',
        width: 184,
        renderCell: (value, row) => {
          if (row.level === 2 && isChildrenCfpDataLoading)
            return <SkeletonColumn className='py-1' />;
          else if (row.isEditable)
            return (
              <div className='px-3 text-xs line-clamp-1'>
                {selectUnitFromAmountRequiredUnit(row.amountRequiredUnit)}
              </div>
            );
          else if (isEmpty(value)) return <DisplayHyphen />;
          else return <div className='px-3 text-xs line-clamp-1'>{value}</div>;
        },
      },
      {
        id: 'preTeR',
        headerElement: (
          <div className='relative'>
            <div className='absolute t-0 w-7 whitespace-nowrap'>
              原材料取得及び前処理排出量
            </div>
            <br />
            <div>TeR</div>
          </div>
        ),
        justify: 'center',
        width: 76,
        renderCell: (value, row, rowIndex) => {
          return (
            <CfpColumn
              level={row.level}
              isEditable={row.isEditable}
              value={value}
              isChildrenCfpDataLoading={isChildrenCfpDataLoading}
              isParentCfpDataLoading={isParentCfpDataLoading}
              inputText={
                <InputTextBox
                  align='right'
                  type='number'
                  placeholder={
                    dqrRequiredStates[rowIndex]?.preCfpRequired ||
                      (cfpRequiredStates[rowIndex]?.preDqrRequired &&
                        (!formik.isValid || hasBlankFormRow(formik.values)))
                      ? '入力必須'
                      : ''
                  }
                  {...formik.getFieldProps(`data[${rowIndex}][preTeR]`)}
                  error={getFormikErrorMessage({
                    name: `data[${rowIndex}][preTeR]`,
                    formik,
                  })}
                  onBlur={(e) => {
                    const { value } = e.target;
                    formik.handleBlur(e);
                    // 状態更新ロジックを値が空かどうかで条件分岐
                    setCfpRequiredStates((current) => {
                      const updated = [...current];
                      updated[rowIndex] = {
                        ...updated[rowIndex],
                        preDqrRequired: value !== '',
                      };
                      return updated;
                    });
                  }}
                />
              }
            />
          );
        },
      },
      {
        id: 'preTiR',
        headerElement: (
          <div>
            <br />
            <div>TiR</div>
          </div>
        ),
        justify: 'center',
        width: 76,
        renderCell: (value, row, rowIndex) => {
          return (
            <CfpColumn
              level={row.level}
              isEditable={row.isEditable}
              value={value}
              isChildrenCfpDataLoading={isChildrenCfpDataLoading}
              isParentCfpDataLoading={isParentCfpDataLoading}
              inputText={
                <InputTextBox
                  align='right'
                  type='number'
                  {...formik.getFieldProps(`data[${rowIndex}][preTiR]`)}
                  error={getFormikErrorMessage({
                    name: `data[${rowIndex}][preTiR]`,
                    formik,
                  })}
                  placeholder={
                    dqrRequiredStates[rowIndex]?.preCfpRequired ||
                      (cfpRequiredStates[rowIndex]?.preDqrRequired &&
                        (!formik.isValid || hasBlankFormRow(formik.values)))
                      ? '入力必須'
                      : ''
                  }
                  onBlur={(e) => {
                    const { value } = e.target;
                    formik.handleBlur(e);
                    // 状態更新ロジックを値が空かどうかで条件分岐
                    setCfpRequiredStates((current) => {
                      const updated = [...current];
                      updated[rowIndex] = {
                        ...updated[rowIndex],
                        preDqrRequired: value !== '',
                      };
                      return updated;
                    });
                  }}
                />
              }
            />
          );
        },
      },
      {
        id: 'preGeR',
        headerElement: (
          <div>
            <br />
            <div>GeR</div>
          </div>
        ),
        justify: 'center',
        width: 76,
        renderCell: (value, row, rowIndex) => {
          return (
            <CfpColumn
              level={row.level}
              isEditable={row.isEditable}
              value={value}
              isChildrenCfpDataLoading={isChildrenCfpDataLoading}
              isParentCfpDataLoading={isParentCfpDataLoading}
              inputText={
                <InputTextBox
                  align='right'
                  type='number'
                  {...formik.getFieldProps(`data[${rowIndex}][preGeR]`)}
                  error={getFormikErrorMessage({
                    name: `data[${rowIndex}][preGeR]`,
                    formik,
                  })}
                  placeholder={
                    dqrRequiredStates[rowIndex]?.preCfpRequired ||
                      (cfpRequiredStates[rowIndex]?.preDqrRequired &&
                        (!formik.isValid || hasBlankFormRow(formik.values)))
                      ? '入力必須'
                      : ''
                  }
                  onBlur={(e) => {
                    const { value } = e.target;
                    formik.handleBlur(e);
                    // 状態更新ロジックを値が空かどうかで条件分岐
                    setCfpRequiredStates((current) => {
                      const updated = [...current];
                      updated[rowIndex] = {
                        ...updated[rowIndex],
                        preDqrRequired: value !== '',
                      };
                      return updated;
                    });
                  }}
                />
              }
            />
          );
        },
      },
      {
        id: 'mainTeR',
        headerElement: (
          <div className='relative'>
            <div className='absolute t-0 w-7 whitespace-nowrap'>
              主な製造排出量
            </div>
            <br />
            <div>TeR</div>
          </div>
        ),
        justify: 'center',
        width: 76,
        renderCell: (value, row, rowIndex) => {
          return (
            <CfpColumn
              level={row.level}
              isEditable={row.isEditable}
              value={value}
              isChildrenCfpDataLoading={isChildrenCfpDataLoading}
              isParentCfpDataLoading={isParentCfpDataLoading}
              inputText={
                <InputTextBox
                  align='right'
                  type='number'
                  {...formik.getFieldProps(`data[${rowIndex}][mainTeR]`)}
                  error={getFormikErrorMessage({
                    name: `data[${rowIndex}][mainTeR]`,
                    formik,
                  })}
                  placeholder={
                    dqrRequiredStates[rowIndex]?.mainCfpRequired ||
                      (cfpRequiredStates[rowIndex]?.mainDqrRequired &&
                        (!formik.isValid || hasBlankFormRow(formik.values)))
                      ? '入力必須'
                      : ''
                  }
                  onBlur={(e) => {
                    const { value } = e.target;
                    formik.handleBlur(e);
                    // 状態更新ロジックを値が空かどうかで条件分岐
                    setCfpRequiredStates((current) => {
                      const updated = [...current];
                      updated[rowIndex] = {
                        ...updated[rowIndex],
                        mainDqrRequired: value !== '',
                      };
                      return updated;
                    });
                  }}
                />
              }
            />
          );
        },
      },

      {
        id: 'mainTiR',
        headerElement: (
          <div>
            <br />
            <div>TiR</div>
          </div>
        ),
        justify: 'center',
        width: 76,
        renderCell: (value, row, rowIndex) => {
          return (
            <CfpColumn
              level={row.level}
              isEditable={row.isEditable}
              value={value}
              isChildrenCfpDataLoading={isChildrenCfpDataLoading}
              isParentCfpDataLoading={isParentCfpDataLoading}
              inputText={
                <InputTextBox
                  align='right'
                  type='number'
                  {...formik.getFieldProps(`data[${rowIndex}][mainTiR]`)}
                  error={getFormikErrorMessage({
                    name: `data[${rowIndex}][mainTiR]`,
                    formik,
                  })}
                  placeholder={
                    dqrRequiredStates[rowIndex]?.mainCfpRequired ||
                      (cfpRequiredStates[rowIndex]?.mainDqrRequired &&
                        (!formik.isValid || hasBlankFormRow(formik.values)))
                      ? '入力必須'
                      : ''
                  }
                  onBlur={(e) => {
                    const { value } = e.target;
                    formik.handleBlur(e);
                    // 状態更新ロジックを値が空かどうかで条件分岐
                    setCfpRequiredStates((current) => {
                      const updated = [...current];
                      updated[rowIndex] = {
                        ...updated[rowIndex],
                        mainDqrRequired: value !== '',
                      };
                      return updated;
                    });
                  }}
                />
              }
            />
          );
        },
      },
      {
        id: 'mainGeR',
        headerElement: (
          <div>
            <br />
            <div>GeR</div>
          </div>
        ),
        justify: 'center',
        width: 76,
        renderCell: (value, row, rowIndex) => {
          return (
            <CfpColumn
              level={row.level}
              isEditable={row.isEditable}
              value={value}
              isChildrenCfpDataLoading={isChildrenCfpDataLoading}
              isParentCfpDataLoading={isParentCfpDataLoading}
              inputText={
                <InputTextBox
                  align='right'
                  type='number'
                  {...formik.getFieldProps(`data[${rowIndex}][mainGeR]`)}
                  error={getFormikErrorMessage({
                    name: `data[${rowIndex}][mainGeR]`,
                    formik,
                  })}
                  placeholder={
                    dqrRequiredStates[rowIndex]?.mainCfpRequired ||
                      (cfpRequiredStates[rowIndex]?.mainDqrRequired &&
                        (!formik.isValid || hasBlankFormRow(formik.values)))
                      ? '入力必須'
                      : ''
                  }
                  onBlur={(e) => {
                    const { value } = e.target;
                    formik.handleBlur(e);
                    // 状態更新ロジックを値が空かどうかで条件分岐
                    setCfpRequiredStates((current) => {
                      const updated = [...current];
                      updated[rowIndex] = {
                        ...updated[rowIndex],
                        mainDqrRequired: value !== '',
                      };
                      return updated;
                    });
                  }}
                />
              }
            />
          );
        },
      },
      {
        id: 'certification',
        headerElement: '証明書',
        justifyHeader: 'center',
        justify: 'center',
        width: 40,
        renderCell: (_, row, rowIndex) => {
          if (isCertsLoading) return <SkeletonColumn className='py-1' />;
          else if (row.isEditable)
            return (
              <FilePlus
                size={28}
                className='fill-primary cursor-pointer'
                onClick={() => {
                  setCertificationModalData({
                    parts: dataForTable[rowIndex],
                    plant: plants.find(
                      (plant) => plant.plantId === row.plantId
                    ),
                    certification: certifications.find(
                      (c) => c.linkedTraceId === row.traceId
                    ),
                  });
                }}
              />
            );
          else if (
            certifications.find((c) => c.linkedTraceId === row.traceId)
              ?.cfpCertificationFileInfo?.length ??
            0 > 0
          )
            return (
              <Eye
                size={28}
                className='fill-primary cursor-pointer'
                onClick={() => {
                  setCertificationModalData({
                    parts: dataForTable[rowIndex],
                    plant: plants.find(
                      (plant) => plant.plantId === row.plantId
                    ),
                    certification: certifications.find(
                      (c) => c.linkedTraceId === row.traceId
                    ),
                  });
                }}
              />
            );
          else return <DisplayHyphen />;
        },
      },
    ],
    [
      plants,
      formik,
      dataForTable,
      certifications,
      isCertsLoading,
      isChildrenCfpDataLoading,
      isParentCfpDataLoading,
      cfpRequiredStates,
      dqrRequiredStates,
    ]
  );
  return (
    <>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className='flex flex-col flex-1'>
          <SectionHeader
            rightChildren={[
              <Button
                key='confirm'
                type='button'
                disabled={!formik.isValid || hasBlankFormRow(formik.values)}
                onClick={() => setIsConfirmModalOpen(true)}
              >
                登録
              </Button>,
            ]}
            stickyOptions={{ top: 84 }}
          />
          <DataTable
            activeTabIndex={tabIndex}
            headerForTabs={headerForTabs}
            parentHeaders={parentHeaders}
            columns={columns}
            rows={dataForTable}
            keyOfRowID='traceId'
            rowHeight={84}
            edgePaddingX={16}
            columnsGapX={8}
            rowPaddingY={16}
            stickyOptions={{ top: 104 }}
            isLoading={isPartsLoading}
          />
          <PopupModal
            button={
              <Button
                color='primary'
                variant='solid'
                size='default'
                key='submit'
                type='submit'
                disabled={!formik.isValid || hasBlankFormRow(formik.values)}
              >
                登録
              </Button>
            }
            isOpen={isConfirmModalOpen}
            setIsOpen={setIsConfirmModalOpen}
            title='CFP・DQR情報を登録しますか？'
          >
            <p>※CFPを登録すると、部品紐付けした取引先に開示されます。</p>
          </PopupModal>
        </form>
      </FormikProvider>
      <CertificationModal
        onModalRefresh={onModalRefresh}
        data={certificationModalData}
        setData={setCertificationModalData}
        onUploadCert={onUploadCert}
        onDownloadCert={onDownloadCert}
        onDeleteCert={onDeleteCert}
      />
    </>
  );
}
