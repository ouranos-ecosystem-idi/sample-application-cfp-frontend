'use client';
import { APIError } from '@/api/apiErrors';
import { NetworkError } from '@/api/networkErrors';
import { repository } from '@/api/repository';
import BackButton from '@/components/atoms/BackButton';
import { Button } from '@/components/atoms/Button';
import RefreshButton from '@/components/atoms/RefreshButton';
import LoadingScreen from '@/components/molecules/LoadingScreen';
import SectionHeader from '@/components/molecules/SectionHeader';
import CertificationModal from '@/components/organisms/CertificationModal';
import CfpRegisterTable, {
  FormType,
} from '@/components/organisms/CfpRegisterTable';
import PartsWithCfpSheet from '@/components/organisms/PartsWithCfpSheet';
import { useAlert } from '@/components/template/AlertHandler';
import useErrorHandler from '@/components/template/ErrorHandler';
import Template from '@/components/template/Template';
import { sheetCsvHeaders, tableCsvHeaders } from '@/lib/constants';
import { getPlants, setPlants as refreshPlants } from '@/lib/plantSessionUtils';
import {
  CertificationDataType,
  CfpSheetDataType,
  DqrSheetDataType,
  Operator,
  Parts,
  PartsWithCfpDataType,
  Plant,
  TradeRequestDataType,
} from '@/lib/types';
import {
  convertFormNumberToNumber,
  convertNullishToEmptyStr,
  downloadCsv,
  formatNumber,
  getCurrentDateTime,
  getPlantDetails,
  getRequestStatus,
  getTradeRequestStatusName,
  isOwnParts,
  selectUnitFromAmountRequiredUnit,
  sum,
} from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { ComponentProps, useCallback, useEffect, useState } from 'react';

export default function PartsRegisterCfpPage() {
  const handleError = useErrorHandler();
  const traceId = useSearchParams().get('trace-id');
  const [cfpTotal, setCfpTotal] =
    useState<ComponentProps<typeof PartsWithCfpSheet>['cfpData']>();
  const [dqrTotal, setDqrTotal] =
    useState<ComponentProps<typeof PartsWithCfpSheet>['dqrData']>();
  const [parentData, setParentData] = useState<PartsWithCfpDataType>();
  const [childrenData, setChildrenData] = useState<
    (PartsWithCfpDataType & { tradeRequest?: TradeRequestDataType; })[]
  >([]);
  const [operatorsData, setOperatorsData] = useState<Operator[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [certifications, setCertifications] = useState<CertificationDataType[]>(
    []
  );
  const router = useRouter();
  const showAlert = useAlert();

  const [formikData, setFormikData] = useState<FormType | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isPartsLoading, setIsPartsLoading] = useState(true);
  const [isCfpDataLoading, setIsCfpDataLoading] = useState(true);
  const [isCertsLoading, setIsCertsLoading] = useState(true);

  // `CfpRegisterTable` からフォームデータを取得するための関数
  const getFormDataFromTable = useCallback((fetch: () => FormType) => {
    const data = fetch();
    setFormikData(data);
  }, []);

  const handleSheetDataUpdate = useCallback(
    (cfpData: CfpSheetDataType, dqrData: DqrSheetDataType) => {
      setCfpTotal(cfpData);
      setDqrTotal(dqrData);
    }, []
  );

  const fetchCerts = useCallback(
    async function (parentParts: Parts, childrenParts: Parts[]) {
      try {
        setCertifications(
          await repository.getCfpCertifications(
            [parentParts, ...childrenParts]
              .filter((p) => p.traceId !== undefined)
              .map((p) => p.traceId) as string[]
          )
        );
        setIsCertsLoading(false);
      } catch (e) {
        handleError(e);
      }
    },
    [handleError]
  );

  useEffect(() => {
    const fetch = async () => {
      try {
        if (traceId) {
          // 部品情報・事業所情報の取得
          const [{ parentParts, childrenParts }, _plants] = await Promise.all([
            repository.getPartsStructure(traceId),
            getPlants(),
          ]);

          setParentData({ parts: parentParts });
          setChildrenData(childrenParts.map(p => ({ parts: p })));
          setPlants(_plants);
          setIsPartsLoading(false);

          // fetch()の後続処理に影響を与えないのでawaitせず、エラーハンドリングはfetchCerts内で行う
          fetchCerts(parentParts, childrenParts);

          // 構成部品情報（親）にCFP情報を付加、構成部品情報（子）に取引データを取得を付加
          const [parentsWithCfpData, childrenWithTradeData] = await Promise.all(
            [
              repository.getEachCfpsOfParts([parentParts]),
              repository.getEachTradeData(childrenParts),
            ]
          );
          setParentData(parentsWithCfpData[0]);

          // 取引データの付与された構成部品情報（子）に依頼・回答情報を付加
          // 事業者識別子（内部）から事業者識別子（ローカル）および事業者名を取得
          const [
            tradeDataWithTradeStatusData,
            _operatorsData,
            childrenWithCfpData,
          ] = await Promise.all([
            repository.getEachRequestStatus(childrenWithTradeData),
            repository.getOperators(
              childrenWithTradeData
                .map((c) => c.upstreamOperatorId)
                .filter(
                  (c): c is Exclude<typeof c, undefined> => c !== undefined
                )
            ),
            repository.getEachCfpsOfParts(childrenParts),
          ]);
          setOperatorsData(_operatorsData);

          // 構成部品情報（子）に取引データ・依頼・回答情報とCFP情報を付加
          const mergedChildrenParts = childrenWithCfpData.map((part, index) => ({
            tradeRequest: tradeDataWithTradeStatusData[index],
            ...part,
          }));
          setChildrenData(mergedChildrenParts);
          setIsCfpDataLoading(false);
        }
      } catch (e) {
        // 不正なデータを元に登録してしまわないよう取得済みのデータはクリア
        setParentData(undefined);
        setChildrenData([]);
        handleError(e);
      }
    };
    fetch();
  }, [fetchCerts, handleError, traceId]);

  const onTotalChange = useCallback<
    Exclude<ComponentProps<typeof CfpRegisterTable>['onTotalChange'], undefined>
  >((total, dqrTotal, unit) => {
    setCfpTotal({ ...total, unit: unit });
    setDqrTotal(dqrTotal);
  }, []);

  const onSubmit = useCallback(
    async (partsWithCfpList: PartsWithCfpDataType[]) => {
      setIsLoading(true);
      try {
        const promises = partsWithCfpList.map((p) => repository.registerCfp(p));
        await Promise.all(promises);
        showAlert.info('CFP・DQR情報の登録を申請しました。');
        router.push('/parts/');
      } catch (e) {
        handleError(e);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, router, showAlert]
  );

  const onModalRefresh = useCallback(
    async (
      data: ComponentProps<typeof CertificationModal>['data'],
      setData: ComponentProps<typeof CertificationModal>['setData']
    ) => {
      try {
        if (traceId === null || data?.parts.traceId === undefined) return;

        const [{ parentParts, childrenParts }, newCert, plants] =
          await Promise.all([
            repository.getPartsStructure(traceId),
            repository.getCfpCertification(data?.parts.traceId),
            refreshPlants(),
          ]);
        const partData = [parentParts, ...childrenParts].find(
          (part) => part.traceId === data?.parts.traceId
        );
        const plant = plants.find(
          (plant) => plant.plantId === partData?.plantId
        );

        if (partData === undefined) return;

        setData({ parts: partData, certification: newCert, plant: plant });
      } catch (e) {
        handleError(e);
      }
    },
    [handleError, traceId]
  );
  const onUploadCert: ComponentProps<typeof CfpRegisterTable>['onUploadCert'] =
    useCallback(
      async (data) => {
        setIsLoading(true);
        try {
          // 証明書データの登録
          await repository.registerCfpCertifications(data);
          // 古くなった証明書データを新しいデータに更新
          const newCert = await repository.getCfpCertification(data.traceId);
          const oldCerts = certifications.filter(
            (cert) => cert.traceId !== data.traceId
          );
          if (newCert === undefined) {
            setCertifications(oldCerts);
          } else {
            setCertifications([newCert, ...oldCerts]);
          }
          setIsLoading(false);
          showAlert.info('証明書の登録を申請しました。');
          return true;
        } catch (e) {
          setIsLoading(false);
          handleError(e);
          return false;
        }
      },
      [certifications, handleError, showAlert]
    );

  const onDownloadCert: ComponentProps<
    typeof CfpRegisterTable
  >['onDownloadCert'] = async (
    fileName,
    fileId,
    fileOperatorId,
    cfpCertificationId,
    downloadType
  ) => {
      try {
        const Url = await repository.downloadCfpCertificationFile(
          fileId,
          fileOperatorId,
          cfpCertificationId,
          downloadType
        );
        const downloadTag = document.createElement('a');
        downloadTag.href = Url;
        downloadTag.download = fileName;
        downloadTag.click();
        showAlert.info('ダウンロードを開始しました。');
      } catch (e) {
        if (e instanceof APIError || e instanceof NetworkError)
          return handleError(e);
        showAlert.error('証明書のダウンロードに失敗しました。');
      }
    };

  const onDeleteCert: ComponentProps<typeof CfpRegisterTable>['onDeleteCert'] = useCallback(
    async (traceId: string, fileId: string) => {
      setIsLoading(true);
      try {
        // 証明書データの削除
        await repository.deleteCfpCertificationFile(traceId, fileId);
        // 証明書データを更新
        const newCert = await repository.getCfpCertification(traceId);
        const oldCerts = certifications.filter(
          (cert) => cert.traceId !== traceId
        );
        if (newCert === undefined) {
          setCertifications(oldCerts);
        } else {
          setCertifications([newCert, ...oldCerts]);
        }
        setIsLoading(false);
        showAlert.info('証明書の削除を申請しました。');
        return true;
      } catch (e) {
        setIsLoading(false);
        handleError(e);
        return false;
      }
    },
    [certifications, handleError, showAlert]
  );

  // シート情報をCSV形式の文字列に変換する関数
  function prepareSheetCsvData() {
    const { plantName, openPlantId } = getPlantDetails(
      parentData?.parts.plantId,
      plants
    );

    const dataRow =
      parentData && cfpTotal && dqrTotal
        ? [
          convertNullishToEmptyStr(parentData.parts.partsName),
          convertNullishToEmptyStr(parentData.parts.supportPartsName),
          convertNullishToEmptyStr(plantName),
          convertNullishToEmptyStr(openPlantId),
          convertNullishToEmptyStr(parentData.parts.traceId),
          formatNumber(
            sum(
              cfpTotal.preEmission.parent,
              cfpTotal.preEmission.children,
              cfpTotal.mainEmission.parent,
              cfpTotal.mainEmission.children
            )
          ),
          formatNumber(
            sum(cfpTotal.preEmission.parent, cfpTotal.preEmission.children)
          ),
          formatNumber(cfpTotal.preEmission.parent),
          formatNumber(cfpTotal.preEmission.children),
          formatNumber(
            sum(cfpTotal.mainEmission.parent, cfpTotal.mainEmission.children)
          ),
          formatNumber(cfpTotal.mainEmission.parent),
          formatNumber(cfpTotal.mainEmission.children),
          convertNullishToEmptyStr(cfpTotal.unit),
          dqrTotal.preEmission.dqr ?? 0,
          dqrTotal.preEmission.TeR ?? 0,
          dqrTotal.preEmission.TiR ?? 0,
          dqrTotal.preEmission.GeR ?? 0,
          dqrTotal.mainEmission.dqr ?? 0,
          dqrTotal.mainEmission.TeR ?? 0,
          dqrTotal.mainEmission.TiR ?? 0,
          dqrTotal.mainEmission.GeR ?? 0,
        ]
        : [];

    // ヘッダーとデータ行を返す
    return { data: [dataRow] };
  }

  // テーブル情報をCSV形式の文字列に変換する関数
  function prepareTableCsvData(
    formikData: FormType | null,
    parentData: PartsWithCfpDataType | undefined,
    childrenData: (PartsWithCfpDataType & { tradeRequest?: TradeRequestDataType; })[],
    plants: Plant[],
    operatorsData: Operator[]
  ) {
    // 親部品のデータ行
    const parentDetails = parentData
      ? getPlantDetails(parentData.parts.plantId, plants)
      : { plantName: '', openPlantId: '' };
    const parentEditedRow = formikData?.data[0] ?? {
      preEmission: undefined,
      mainEmission: undefined,
      preTeR: undefined,
      preTiR: undefined,
      preGeR: undefined,
      mainTeR: undefined,
      mainTiR: undefined,
      mainGeR: undefined,
    };
    const parentRowData = [
      parentData?.parts.level,
      parentData?.parts.terminatedFlag ? '終端' : '',
      parentData?.parts.partsName,
      parentData?.parts.supportPartsName,
      parentDetails.plantName,
      parentDetails.openPlantId,
      parentData?.parts.traceId,
      1,
      parentData?.parts.amountRequiredUnit,
      '',
      convertNullishToEmptyStr(
        operatorsData.find((op) => op.operatorId === parentData?.parts.operatorId)
          ?.operatorName
      ),
      convertNullishToEmptyStr(
        operatorsData.find((op) => op.operatorId === parentData?.parts.operatorId)
          ?.openOperatorId
      ),
      convertFormNumberToNumber(parentEditedRow.preEmission),
      convertFormNumberToNumber(parentEditedRow.mainEmission),
      parentData?.parts.amountRequiredUnit
        ? selectUnitFromAmountRequiredUnit(parentData?.parts.amountRequiredUnit)
        : '', // 親部品の単位
      convertFormNumberToNumber(parentEditedRow.preTeR),
      convertFormNumberToNumber(parentEditedRow.preTiR),
      convertFormNumberToNumber(parentEditedRow.preGeR),
      convertFormNumberToNumber(parentEditedRow.mainTeR),
      convertFormNumberToNumber(parentEditedRow.mainTiR),
      convertFormNumberToNumber(parentEditedRow.mainGeR),
    ];

    // 子部品のデータ行の生成
    const childRowsData = childrenData.map((row, index) => {
      const childDetails = getPlantDetails(row.parts.plantId, plants);
      const editedRow = formikData?.data[index + 1] ?? {
        preEmission: undefined,
        mainEmission: undefined,
        preTeR: undefined,
        preTiR: undefined,
        preGeR: undefined,
        mainTeR: undefined,
        mainTiR: undefined,
        mainGeR: undefined,
      };

      return [
        row.parts.level,
        row.parts.terminatedFlag ? '終端' : '',
        row.parts.partsName,
        row.parts.supportPartsName,
        convertNullishToEmptyStr(childDetails.plantName),
        childDetails.openPlantId,
        row.parts.traceId,
        convertFormNumberToNumber(row.parts.amountRequired),
        row.parts.amountRequiredUnit ?? '',
        isOwnParts(row.parts.level, row.parts.terminatedFlag) ?
          '' :
          getTradeRequestStatusName(
            getRequestStatus(row.tradeRequest?.tradeStatus?.requestStatus)
          ),
        convertNullishToEmptyStr(
          operatorsData.find((op) => op.operatorId === row.tradeRequest?.upstreamOperatorId)
            ?.operatorName
        ),
        convertNullishToEmptyStr(
          operatorsData.find((op) => op.operatorId === row.tradeRequest?.upstreamOperatorId)
            ?.openOperatorId
        ),
        convertFormNumberToNumber(editedRow.preEmission),
        convertFormNumberToNumber(editedRow.mainEmission),
        row.parts.amountRequiredUnit
          ? selectUnitFromAmountRequiredUnit(row.parts.amountRequiredUnit)
          : '',
        convertFormNumberToNumber(editedRow.preTeR),
        convertFormNumberToNumber(editedRow.preTiR),
        convertFormNumberToNumber(editedRow.preGeR),
        convertFormNumberToNumber(editedRow.mainTeR),
        convertFormNumberToNumber(editedRow.mainTiR),
        convertFormNumberToNumber(editedRow.mainGeR),
      ];
    });

    // 親部品のデータ行を最初に、その後に子部品のデータ行を追加
    const dataRows = [parentRowData, ...childRowsData];

    return { data: dataRows };
  }

  // ダウンロードボタンのonClickイベントハンドラ
  const handleDownloadCsv = () => {
    try {
      // シート情報のCSVファイル名
      const sheetFilename = `CFP合算情報_${parentData?.parts.partsName}_${parentData?.parts.supportPartsName
        }_${getCurrentDateTime()}`;
      // テーブル情報のCSVファイル名
      const tableFilename = `仕入先CFP情報と自社CFP_${parentData?.parts.partsName}_${parentData?.parts.supportPartsName
        }_${getCurrentDateTime()}`;

      // シート情報のダウンロード準備
      // 既存の呼び出し部分を修正
      const sheetCsv = prepareSheetCsvData();

      // シート情報のダウンロード
      downloadCsv(sheetCsvHeaders, sheetCsv.data, sheetFilename);

      // テーブル情報のダウンロード準備
      const tableCsv = prepareTableCsvData(
        formikData,
        parentData,
        childrenData,
        plants,
        operatorsData
      );
      // テーブル情報のダウンロード
      downloadCsv(tableCsvHeaders, tableCsv.data, tableFilename);
      showAlert.info('ダウンロードを開始しました。');
    } catch {
      showAlert.error('CSVダウンロードに失敗しました。');
    }
  };

  return (
    <>
      <LoadingScreen isOpen={isLoading} />
      <Template
        stickyHeaderContents={[
          <BackButton key='backButton' href='/parts' text={'部品構成一覧'} />,
          <SectionHeader
            key='header'
            title='CFP参照・登録'
            variant='h1'
            leftChildren={[
              <RefreshButton
                onClick={() => {
                  window.location.reload();
                }}
                className='ml-4'
                key='pageRefreshButton'
              />,
            ]}
            align='bottom'
            stickyOptions={{ backgroundTop: true }}
          />,
        ]}
        contents={[
          <PartsWithCfpSheet
            CsvDownloadButton={[
              <Button
                key='csvDL'
                onClick={handleDownloadCsv}
                disabled={
                  isCfpDataLoading || isCertsLoading || isCfpDataLoading
                }
                variant='outline'
              >
                CSVダウンロード
              </Button>,
            ]}
            key='sheet'
            partsData={parentData?.parts}
            plants={plants}
            cfpData={cfpTotal}
            dqrData={dqrTotal}
            onDataUpdate={handleSheetDataUpdate}
            isLoading={isPartsLoading || isCfpDataLoading || isCfpDataLoading}
          />,
          <CfpRegisterTable
            key='table'
            parentPartWithCfpData={parentData}
            childrenPartsWithCfpWithRequestData={childrenData}
            plants={plants}
            certifications={certifications}
            onTotalChange={onTotalChange}
            onSubmit={onSubmit}
            onUploadCert={onUploadCert}
            onDownloadCert={onDownloadCert}
            onDeleteCert={onDeleteCert}
            operatorsData={operatorsData}
            onModalRefresh={onModalRefresh}
            getFormData={getFormDataFromTable}
            isPartsLoading={isPartsLoading}
            isCfpDataLoading={isCfpDataLoading}
            isCertsLoading={isCertsLoading}
          />,
        ]}
      />
    </>
  );
}
