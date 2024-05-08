'use client';
import { repository } from '@/api/repository';
import useErrorHandler from '@/components/template/ErrorHandler';
import SectionHeader from '@/components/molecules/SectionHeader';
import NotificationsTable from '@/components/organisms/NotificationsTable';
import Template from '@/components/template/Template';
import {
  NotificationDataType,
  Operator,
  Plant,
  PartsWithoutLevel,
} from '@/lib/types';
import { useEffect, useState } from 'react';
import DatePickerFromTo from '@/components/molecules/DatePickerFromTo';
import { Button } from '@/components/atoms/Button';
import { getPlants } from '@/lib/plantSessionUtils';
import RefreshButton from '@/components/atoms/RefreshButton';
import {
  PaginationPageName,
  loadAdditionalDataFromSession,
  loadHistoryFromSession,
  saveAdditionalDataToSession,
  saveHistoryToSession,
} from '@/lib/paginationSessionUtils';
import Pagination from '@/components/atoms/Pagination';
import { isAbortError } from 'next/dist/server/pipe-readable';
import { isEmpty } from '@/lib/utils';

const PAGE_NAME: PaginationPageName = 'notifications';
const initialTo = new Date();
const initialFrom = new Date();

initialFrom.setDate(initialFrom.getDate() - 30);
const initialPeriod = {
  fromDate: initialFrom,
  toDate: initialTo,
};

function loadPeriod() {
  const _paginationAdditionalData = loadAdditionalDataFromSession(PAGE_NAME);
  const _currentPeriodString = _paginationAdditionalData?.currentPeriod;

  // currentPeriodが保存されていなければ初期値を返す
  if (isEmpty(_currentPeriodString)) return initialPeriod;
  const _currentPeriodObject = JSON.parse(_currentPeriodString);

  // fromDate, toDateが含まれていなければ初期値を返す
  if (
    isEmpty(_currentPeriodObject.fromDate) ||
    isEmpty(_currentPeriodObject.toDate)
  ) {
    return initialPeriod;
  }

  // fromDate, toDateが有効な日付でなければ初期値を返す
  if (
    isNaN(new Date(_currentPeriodObject.fromDate).getTime()) ||
    isNaN(new Date(_currentPeriodObject.toDate).getTime())
  ) {
    return initialPeriod;
  }

  return {
    fromDate: new Date(_currentPeriodObject.fromDate),
    toDate: new Date(_currentPeriodObject.toDate),
  };
}

export default function NotificationsPage() {
  const handleError = useErrorHandler();

  const [fromDate, setFromDate] = useState<Date>(initialFrom); // 入力欄の値
  const [toDate, setToDate] = useState<Date>(initialTo); // 入力欄の値
  const [currentPeriod, setCurrentPeriod] = useState<{
    fromDate: Date;
    toDate: Date;
  }>(initialPeriod); // 現在の絞り込みに反映されている日付

  const [notifications, setNotifications] = useState<NotificationDataType[]>([]);
  const [operatorsData, setOperatorsData] = useState<Operator[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isNotificationLoading, setIsNotificationLoading] =
    useState<boolean>(true);
  const [history, setHistory] = useState<string[]>();
  const [next, setNext] = useState<string>();

  const [partsData, setPartsData] = useState<{
    [key: string]: PartsWithoutLevel;
  }>({});

  const onMouseEnter = async (traceId: string) => {
    const maybeParts = await repository.getParts(traceId);
    if (maybeParts === undefined) return;
    setPartsData({ ...partsData, [traceId]: maybeParts });
  };

  useEffect(() => {
    // ページング情報の読み込み
    setHistory(loadHistoryFromSession(PAGE_NAME));
    const _currentPeriod = loadPeriod();
    setFromDate(_currentPeriod.fromDate);
    setToDate(_currentPeriod.toDate);
    setCurrentPeriod(_currentPeriod);

    const fetch = async () => {
      try {
        const _plants = await getPlants();
        setPlants(_plants);
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
    setFromDate(currentPeriod.fromDate);
    setToDate(currentPeriod.toDate);
    const fetch = async () => {
      try {
        setIsNotificationLoading(true);
        const { res: _notificationsData, next: _next } =
          await repository.getNotifications({
            notifiedAtFrom: setTime(
              currentPeriod.fromDate,
              [0, 0, 0, 0]
            ).toISOString(),
            notifiedAtTo: setTime(
              currentPeriod.toDate,
              [23, 59, 59, 999]
            ).toISOString(),
            after: history.slice(-1).at(0),
          });

        setNotifications(_notificationsData);
        //事業者識別子（内部）から事業者識別子（ローカル）および事業者名を取得
        const _operatorsData = await repository.getOperators(
          _notificationsData.map((n) => n.notifiedFromOperatorId)
        );
        setOperatorsData(_operatorsData);
        setIsNotificationLoading(false);
        setNext(_next);
        saveAdditionalDataToSession(PAGE_NAME, {
          currentPeriod: JSON.stringify(currentPeriod),
        });
        saveHistoryToSession(PAGE_NAME, history); // このタイミングでページング完了とみなす
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
    };
  }, [currentPeriod, handleError, history]);

  function setTime(date: Date, hours: [number, number, number, number]): Date {
    date.setHours(...hours);
    return date;
  }

  return (
    <Template
      stickyHeaderContents={[
        <div key='stickyContent'>
          <SectionHeader
            title='通知一覧'
            className='pt-4'
            variant='h1'
            align='middle'
            leftChildren={[
              <RefreshButton
                onClick={() => {
                  window.location.reload();
                }}
                className='ml-4'
                key='pageRefreshButton'
              />,
            ]}
          />
          <SectionHeader
            rightChildren={[
              <DatePickerFromTo
                key='datepickerFromTo'
                fromDate={fromDate}
                fromOnChange={(date) => setFromDate(date || new Date())}
                fromDateMax={toDate}
                toDate={toDate}
                toOnChange={(date) => setToDate(date || new Date())}
                toDateMax={initialTo}
              />,
              <Button
                className='w-14 h-8 text-xs items-center'
                key='search'
                onClick={() => {
                  setNext(undefined);
                  setHistory([]);
                  setCurrentPeriod({
                    fromDate,
                    toDate,
                  });
                }}
                disabled={toDate < fromDate}
              >
                検索
              </Button>,
              <Pagination
                className='ml-4'
                key='pagination'
                next={next}
                setNext={setNext}
                history={history}
                setHistory={setHistory}
              />,
            ]}
          />
        </div>,
      ]}
      contents={[
        <NotificationsTable
          onMouseEnter={onMouseEnter}
          key='table'
          notificationsData={notifications}
          partsData={partsData}
          operatorsData={operatorsData}
          plants={plants}
          isNotificationLoading={isNotificationLoading}
        />,
      ]}
    />
  );
}
