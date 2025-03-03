'use client';
import { repository } from '@/api/repository';
import BackButton from '@/components/atoms/BackButton';
import RefreshButton from '@/components/atoms/RefreshButton';
import LoadingScreen from '@/components/molecules/LoadingScreen';
import SectionHeader from '@/components/molecules/SectionHeader';
import PartsTableForLinkParts from '@/components/organisms/PartsTableForLinkParts';
import TradeInfoSheet from '@/components/organisms/TradeInfoSheet';
import { useAlert } from '@/components/template/AlertHandler';
import useErrorHandler from '@/components/template/ErrorHandler';
import Template from '@/components/template/Template';
import {
  PaginationPageName,
  loadHistoryFromSession,
  saveHistoryToSession,
} from '@/lib/paginationSessionUtils';
import { getPlants } from '@/lib/plantSessionUtils';
import {
  Operator,
  PartsWithCfpDataType,
  Plant,
  TradeResponseDataType,
} from '@/lib/types';
import { isAbortError } from 'next/dist/server/pipe-readable';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const PAGE_NAME: PaginationPageName = 'link-parts';

export default function RequestsLinkPartsPage() {
  const statusId = useSearchParams().get('status-id');
  const router = useRouter();
  const handleError = useErrorHandler();

  const showAlert = useAlert();
  const [unlinkedPartsWithCfp, setUnlinkedPartsWithCfp] = useState<
    PartsWithCfpDataType[]
  >([]);
  const [linkedPartsWithCfp, setLinkedPartsWithCfp] =
    useState<PartsWithCfpDataType>();
  const [operatorsData, setOperatorsData] = useState<Operator[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLinkPartsLoading, setIsLinkPartsLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<string[]>();
  const [next, setNext] = useState<string>();
  const [isSheetLoading, setIsSheetLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnLinkPartsLoading, setIsUnLinkPartsLoading] =
    useState<boolean>(true);
  const [isCfpLoading, setIsCfpLoading] = useState<boolean>(true);
  const [isUnLinkedCfpLoading, setIsUnLinkedCfpLoading] =
    useState<boolean>(true);
  if (typeof statusId === 'undefined') {
    throw new Error('parameter trade-id is required');
  }

  const [tradeResponseData, setTradeResponseData] =
    useState<TradeResponseDataType>({
      message: '',
      downstreamOperatorId: '',
      status: 'incomplete',
      downstreamTraceId: '',
      tradeId: '',
      upstreamTraceId: '',
      tradeTreeStatus: 'TERMINATED',
      responseDueDate: ''
    });

  // 紐づけ済みの部品を取得
  const fetchLinkParts = async (tradeId?: string | null) => {
    const _linkedParentPart = tradeId
      ? await repository.getParentPartsByTraceId(tradeId)
      : undefined;
    if (_linkedParentPart !== undefined) setLinkedPartsWithCfp({ parts: _linkedParentPart });
    setIsLinkPartsLoading(false);
    return _linkedParentPart;
  };

  const fetchOperatorsData = async (
    tradeResponseData?: TradeResponseDataType
  ) => {
    let operatorsData: Operator[] = [];
    if (tradeResponseData) {
      operatorsData = await repository.getOperators([
        tradeResponseData.downstreamOperatorId,
      ]);
    }
    setOperatorsData(operatorsData);
    setIsSheetLoading(false);
  };

  useEffect(() => {
    setHistory(loadHistoryFromSession(PAGE_NAME));
    const fetch = async () => {
      try {
        if (!statusId) return;

        const [_tradeResponseData, _plants] = await Promise.all([
          repository.getTradeResponse(statusId),
          getPlants(),
        ]);

        // 出せるものを先に表示
        if (_tradeResponseData) setTradeResponseData(_tradeResponseData);
        setPlants(_plants);

        fetchOperatorsData(_tradeResponseData);

        // 紐づけ済みの部品を取得
        const _linkedParentPart = await fetchLinkParts(
          _tradeResponseData?.upstreamTraceId
        );

        // CFP情報を取得
        const [_linkedPartsWithCfp] = await Promise.all([
          (
            await repository.getEachCfpsOfParts(
              _linkedParentPart ? [_linkedParentPart] : []
            )
          ).at(0),
        ]);

        setLinkedPartsWithCfp(_linkedPartsWithCfp);
        setIsCfpLoading(false);
      } catch (e) {
        handleError(e);
      }
    };
    fetch();
  }, [handleError, statusId]);

  // ページングされる部分
  useEffect(() => {
    const paginationAbortController = new AbortController();

    if (history === undefined) return;
    let isMounted = true; // アンマウントされている場合はstateの更新やエラーハンドリングを行わない
    const fetch = async () => {
      history.slice(-1).at(0);
      try {
        setUnlinkedPartsWithCfp([]);
        setIsUnLinkPartsLoading(true);
        setIsUnLinkedCfpLoading(true);
        const { res: _parentParts, next: _next } =
          await repository.getParentParts(
            history.slice(-1).at(0),
            paginationAbortController.signal
          );

        if (!isMounted) return;
        setUnlinkedPartsWithCfp(_parentParts.map(p => ({ parts: p })));
        setIsUnLinkPartsLoading(false); // この時点で取得済みの情報を先に表示
        setNext(_next);
        saveHistoryToSession(PAGE_NAME, history); // このタイミングでページング完了とみなす

        // CFP情報を取得
        const _partsWithCfp = await repository.getEachCfpsOfParts(
          _parentParts,
          paginationAbortController.signal
        );
        if (!isMounted) return;
        setUnlinkedPartsWithCfp(_partsWithCfp);
        setIsUnLinkedCfpLoading(false);
      } catch (e) {
        if (!isMounted || isAbortError(e)) return;
        const lastSucceed = loadHistoryFromSession(PAGE_NAME);
        if (lastSucceed.toString() !== history.toString()) {
          // 初回失敗時、直前のページング状態に戻す(リトライ1/2)
          setHistory(lastSucceed);
        } else if (history.length !== 0) {
          // 2回目以降失敗時、2ページ目以降にいる場合は1ページ目に戻って再試行(リトライ2/2)
          setHistory([]);
          saveHistoryToSession(PAGE_NAME, []);
        }
        handleError(e);
      }
    };
    fetch();
    return () => {
      isMounted = false;
      paginationAbortController.abort();
    };
  }, [handleError, history]);

  useEffect(() => {
    // 紐づける部品リストに紐づけ済みの部品が含まれていた場合除く
    if (
      linkedPartsWithCfp?.parts.traceId &&
      unlinkedPartsWithCfp.some((p) => p.parts.traceId === linkedPartsWithCfp.parts.traceId)
    ) {
      setUnlinkedPartsWithCfp(
        unlinkedPartsWithCfp.filter(
          (p) => p.parts.traceId !== linkedPartsWithCfp.parts.traceId
        )
      );
    }
  }, [linkedPartsWithCfp, unlinkedPartsWithCfp]);

  async function linkParts(traceId: string) {
    if (!tradeResponseData?.tradeId) {
      return;
    }
    setIsLoading(true);
    try {
      await repository.linkPartsWithTradeRequest({
        tradeId: tradeResponseData.tradeId,
        traceId: traceId,
      });
      await repository.setCfpAclOnValueAndCert({
        releasedToOperatorId: tradeResponseData.downstreamOperatorId,
        traceId,
      });
      router.push('/requests');
      showAlert.info('部品の紐付けを申請しました。');
    } catch (e) {
      handleError(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateReplyMessage(requestId: string, replyMessage: string) {
    if (!tradeResponseData?.tradeId) {
      return;
    }
    setIsLoading(true);
    try {
      await repository.setReplyMessage(
        requestId,
        replyMessage,
      );
      router.refresh;
      showAlert.info('応答メッセージ更新を申請しました。');
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
          <BackButton
            key='backButton'
            href='/requests'
            text={'受領依頼一覧'}
          />,
          <SectionHeader
            key='header'
            title='部品紐付け'
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
            stickyOptions={{ backgroundTop: true }}
          />,
        ]}
        contents={[
          <TradeInfoSheet
            key='trade-info-sheet'
            tradeResponseData={tradeResponseData}
            operatorsData={operatorsData}
            isLoading={isSheetLoading}
            onUpdate={updateReplyMessage}
          />,
          <PartsTableForLinkParts
            key='parts'
            requestedParts={tradeResponseData.downstreamPart ?? undefined}
            linkedPartsWithCfp={linkedPartsWithCfp}
            unlinkedPartsWithCfp={unlinkedPartsWithCfp}
            plants={plants}
            statusId={statusId}
            onLinkParts={linkParts}
            isLinkPartsLoading={isLinkPartsLoading}
            isUnLinkPartsLoading={isUnLinkPartsLoading}
            isCfpLoading={isCfpLoading}
            isUnLinkedCfpLoading={isUnLinkedCfpLoading}
            paginationProps={{
              next,
              setNext,
              history,
              setHistory,
            }}
          />,
        ]}
      />
    </>
  );
}
