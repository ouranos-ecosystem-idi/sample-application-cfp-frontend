'use client';
import { repository } from '@/api/repository';
import RefreshButton from '@/components/atoms/RefreshButton';
import SectionHeader from '@/components/molecules/SectionHeader';
import PartsTable from '@/components/organisms/PartsTable';
import Template from '@/components/template/Template';
import useErrorHandler from '@/components/template/ErrorHandler';
import {
  PaginationPageName,
  loadHistoryFromSession,
  saveHistoryToSession,
} from '@/lib/paginationSessionUtils';
import { getPlants } from '@/lib/plantSessionUtils';
import { PartsWithCfpDataType, Plant } from '@/lib/types';
import { isAbortError } from 'next/dist/server/pipe-readable';
import { useEffect, useState } from 'react';
import { onAbort } from '@/components/template/AbortHandler';

const PAGE_NAME: PaginationPageName = 'parts';
export default function PartsPage() {
  const handleError = useErrorHandler();
  const [partsWithCfpData, setPartsWithCfpData] = useState<
    PartsWithCfpDataType[]
  >([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [history, setHistory] = useState<string[]>();
  const [next, setNext] = useState<string>();
  const [isPartsLoading, setIsPartsLoading] = useState<boolean>(true);
  const [isPlantLoading, setIsPlantLoading] = useState<boolean>(true);
  const [isCfpDataLoading, setIsCfpDataLoading] = useState<boolean>(true);

  useEffect(() => {
    setHistory(loadHistoryFromSession(PAGE_NAME));
    const fetch = async () => {
      try {
        const _plants = await getPlants();
        setPlants(_plants);
        setIsPlantLoading(false);
      } catch (e) {
        handleError(e);
      }
    };
    fetch();
  }, [handleError]);

  // ページングされる部分
  useEffect(() => {
    if (history === undefined) return;
    let isMounted = true; // アンマウントされている場合はstateの更新やエラーハンドリングを行わない
    const fetch = async () => {
      try {
        setIsCfpDataLoading(true);
        setIsPartsLoading(true);
        setPartsWithCfpData([]);
        const { res: _parts, next: _next } = await repository.getParentParts(
          history.slice(-1).at(0)
        );

        if (!isMounted) return;
        setPartsWithCfpData(_parts.map(p => ({ parts: p }))); // この時点で取得済みの情報を先に表示
        setIsPartsLoading(false);
        setNext(_next);
        saveHistoryToSession(PAGE_NAME, history); // このタイミングでページング完了とみなす

        // CFP情報を取得
        const _partsWithCfp = await repository.getEachCfpsOfParts(_parts);
        if (!isMounted) return;
        setPartsWithCfpData(_partsWithCfp);
        setIsCfpDataLoading(false);
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

  return (
    <Template
      stickyHeaderContents={[
        <SectionHeader
          title='部品構成一覧'
          className='pt-4'
          variant='h1'
          key='title'
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
        <PartsTable
          key='parts'
          partsWithCfpData={partsWithCfpData}
          plants={plants}
          isPartsLoading={isPartsLoading || isPlantLoading}
          isCfpDataLoading={isCfpDataLoading}
          paginationProps={{
            next,
            setNext,
            history,
            setHistory,
          }}
        />,
      ]}
    />
  );
}
