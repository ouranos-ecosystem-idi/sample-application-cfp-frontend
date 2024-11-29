'use client';
import { repository } from '@/api/repository';
import useErrorHandler from '@/components/template/ErrorHandler';
import BackButton from '@/components/atoms/BackButton';
import SectionHeader from '@/components/molecules/SectionHeader';
import CfpRequestTable, {
  CfpRequestFormType,
} from '@/components/organisms/CfpRequestTable';
import PartsSheet from '@/components/organisms/PartsSheet';
import Template from '@/components/template/Template';
import {
  Parts,
  Plant,
  TradeRequestDataType,
  TradeRequestDataTypeWithOperator,
  TradeStatus
} from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAlert } from '@/components/template/AlertHandler';
import { DataTransportAPIError } from '@/api/apiErrors';
import { isEmpty, returnErrorAsValue } from '@/lib/utils';
import { getPlants } from '@/lib/plantSessionUtils';
import RefreshButton from '@/components/atoms/RefreshButton';
import LoadingScreen from '@/components/molecules/LoadingScreen';

export default function PartsRequestCfpPage() {
  const traceId = useSearchParams().get('trace-id');
  const handleError = useErrorHandler();
  const router = useRouter();
  // 親部品情報(シートに表示する)
  const [parentPartsData, setParentPartsData] = useState<Parts>();

  const showAlert = useAlert();
  // 子部品の取引情報
  const [tradeRequestData, setTradeRequestData] = useState<
    TradeRequestDataTypeWithOperator[]
  >([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetLoading, setIsSheetLoading] = useState<boolean>(true);
  const [isTradeResponseLoading, setIsTradeResponseLoading] =
    useState<boolean>(true);
  const [isOperatorLoading, setIsOperatorLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!traceId) return;
    // StrictModeによる2回マウント時のクリーンアップ
    let ignore = false;
    const fetcher = async () => {
      try {
        // トレース識別子に対する部品構成を取得する
        const [{ parentParts, childrenParts }, _plants] = await Promise.all([
          repository.getPartsStructure(traceId),
          getPlants(),
        ]);

        setPlants(_plants);

        // 親部品情報をシートに先に表示させる
        setParentPartsData(parentParts);
        setIsSheetLoading(false);

        // それぞれの部品情報に対して、取引関係情報と上流の事業所識別子を取得する
        const tradeData = await repository.getEachTradeData(childrenParts);
        // 取得した取引関係情報を先に表示する
        if (!ignore) {
          setTradeRequestData(tradeData);
        }

        const tradeAndStatusData = await repository.getEachRequestStatus(
          tradeData
        );
        if (!ignore) {
          setTradeRequestData(tradeAndStatusData);
          setIsTradeResponseLoading(false);
        }

        const operators = await repository.getOperators(
          tradeData
            .map((data) => data.upstreamOperatorId)
            .filter((id) => id !== undefined) as string[]
        );
        if (!ignore) {
          setTradeRequestData(
            tradeAndStatusData.map((data) => ({
              ...data,
              operator: operators.find(
                (operator) => operator.operatorId === data.upstreamOperatorId
              ),
            }))
          );
          setIsOperatorLoading(false);
        }
      } catch (e) {
        handleError(e);
      }
    };

    fetcher();
    return () => {
      ignore = true;
    };
  }, [handleError, traceId]);

  async function onRequestCfp(form: CfpRequestFormType) {
    const targetForm = form.notRequestedCfp.filter((_form) => _form.selected);
    if (targetForm.length === 0) return;

    setIsLoading(true);
    // 以下エラー数によってエラーを出し分けるためtry-catchを使わず個別ハンドリング
    const results = await Promise.all(
      targetForm.map((_form) =>
        returnErrorAsValue(() => repository.requestCfp(_form))
      )
    );
    const errors = results
      .filter((res) => res.error !== undefined)
      .map((res) => res.error);
    setIsLoading(false);
    if (errors.length === targetForm.length) {
      // 全部失敗の場合
      handleError(errors.at(0));
    } else if (errors.length > 0) {
      // 一部失敗の場合
      handleError(errors.at(0), [
        '一部、処理を完了することができませんでした。',
        '時間を置いて画面を更新してから、リトライしてください。',
      ]);
    } else {
      // 全て成功の場合
      router.push('/parts');
      showAlert.info('CFP算出依頼の申請をしました。');
    }
  }

  async function getOperator(openOperatorId: string) {
    if (isEmpty(openOperatorId)) {
      return undefined;
    }
    try {
      return await repository.getOperatorByOpenOperatorId(openOperatorId);
    } catch (e) {
      if ((e as DataTransportAPIError).status === 404) {
        return undefined;
      }
    }
  }


  async function handleCancelTradeRequest(
    tradeRequests: TradeRequestDataType[]
  ) {
    try {
      // ステータスの更新を行う
      if (tradeRequests.length === 0 || tradeRequests.some(req => req.tradeStatus === undefined)) throw new Error();
      setIsLoading(true);
      const cancelRequestResults = await Promise.all(
        tradeRequests.map(_tradeRequest => {
          return returnErrorAsValue(() =>
            repository.updateTradeStatusToCancel(
              _tradeRequest.tradeStatus as TradeStatus, _tradeRequest.tradeId

            )
          );
        }));

      const errors = cancelRequestResults
        .filter((res) => res.error !== undefined)
        .map((res) => res.error);

      setIsLoading(false);

      if (errors.length === cancelRequestResults.length) {
        // 全部失敗の場合
        handleError(errors.at(0));
      } else if (errors.length > 0) {
        // 一部失敗の場合
        handleError(errors.at(0), [
          '一部、処理を完了することができませんでした。',
          '時間を置いて画面を更新してから、リトライしてください。',
        ]);
      } else {
        // 全て成功の場合
        router.push('/parts');
        showAlert.info('依頼の取消を申請しました。');
      }

    } catch (e) {
      handleError(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <LoadingScreen isOpen={isLoading} />
      <Template
        stickyHeaderContents={[
          <BackButton key='button' href='/parts' text={'部品構成一覧'} />,
          <SectionHeader
            stickyOptions={{ backgroundTop: true }}
            key='title'
            title='CFP算出依頼'
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
          />,
        ]}
        contents={[
          <PartsSheet
            key='parts-sheet'
            partsData={parentPartsData}
            plants={plants}
            isLoading={isSheetLoading}
          />,
          <CfpRequestTable
            key='request-table'
            tradeRequestData={tradeRequestData}
            plants={plants}
            onSubmit={onRequestCfp}
            getOperator={getOperator}
            onCancelTradeRequest={handleCancelTradeRequest}
            isTradeResponseLoading={isTradeResponseLoading}
            isOperatorLoading={isOperatorLoading}
          />,
        ]}
      />
    </>
  );
}
