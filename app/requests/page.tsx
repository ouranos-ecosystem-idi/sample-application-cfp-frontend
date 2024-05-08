'use client';

import { repository } from '@/api/repository';
import SectionHeader from '@/components/molecules/SectionHeader';
import RequestsTable from '@/components/organisms/RequestsTable';
import Template from '@/components/template/Template';
import useErrorHandler from '@/components/template/ErrorHandler';
import {
  TradeResponseDataType,
  Operator,
} from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAlert } from '@/components/template/AlertHandler';
import RefreshButton from '@/components/atoms/RefreshButton';
import LoadingScreen from '@/components/molecules/LoadingScreen';
import {
  PaginationPageName,
  loadHistoryFromSession,
  saveHistoryToSession,
} from '@/lib/paginationSessionUtils';
import { isAbortError } from 'next/dist/server/pipe-readable';
import { onAbort } from '@/components/template/AbortHandler';

const PAGE_NAME: PaginationPageName = 'requests';
export default function RequestsPage() {
  const router = useRouter();

  const handleError = useErrorHandler();
  const [tradeResponseData, setTradeResponseData] = useState<
    Omit<TradeResponseDataType, 'upstreamPart'>[]
  >([]);
  const [operatorsData, setOperatorsData] = useState<Operator[]>([]);
  const [isTradeRequestLoading, setIsTradeRequestLoading] =
    useState<boolean>(true);
  const [history, setHistory] = useState<string[]>();
  const [next, setNext] = useState<string>();

  const showAlert = useAlert();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setHistory(loadHistoryFromSession(PAGE_NAME));
  }, []);

  // ページングされる部分
  useEffect(() => {
    if (history === undefined) return;
    let isMounted = true; // アンマウントされている場合はstateの更新やエラーハンドリングを行わない
    const fetch = async () => {
      try {
        setTradeResponseData([]);
        setIsTradeRequestLoading(true);
        const { res: _tradeResponses, next: _next } =
          await repository.getTradeResponses(history.slice(-1).at(0));
        const _filteredTradeResponses = _tradeResponses.filter(
          (item) => item.status !== 'remanded'
        );
        if (!isMounted) return;
        setTradeResponseData(_filteredTradeResponses);
        setNext(_next);
        saveHistoryToSession(PAGE_NAME, history); // このタイミングでページング完了とみなす

        //事業者識別子（内部）から事業者識別子（ローカル）および事業者名を取得
        const _operatorsData = await repository.getOperators(
          _filteredTradeResponses.map((n) => n.downstreamOperatorId)
        );
        if (!isMounted) return;
        setOperatorsData(_operatorsData);
        setIsTradeRequestLoading(false);
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
      onAbort();
    };
  }, [handleError, history]);

  async function handleRejectTradeRequest(
    tradeResponse: TradeResponseDataType
  ) {
    setIsLoading(true);
    try {
      // ステータスの更新を行う
      const isSuccess = await repository.updateTradeResponseRejectStatus(
        tradeResponse
      );

      if (isSuccess) {
        showAlert.info('依頼の差戻しを申請しました。');
        setTradeResponseData((responseData) =>
          responseData.filter((item) => item.tradeId !== tradeResponse.tradeId)
        );
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
          <SectionHeader
            key='title'
            title='受領依頼一覧'
            variant='h1'
            className='pt-4'
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
          <RequestsTable
            isTradeRequestLoading={isTradeRequestLoading}
            items={tradeResponseData}
            onPartsSelection={(statusId) =>
              router.push(`/requests/link-parts/?status-id=${statusId}`)
            }
            key='requestsTable'
            operatorsData={operatorsData}
            onRejectTradeRequest={handleRejectTradeRequest}
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
