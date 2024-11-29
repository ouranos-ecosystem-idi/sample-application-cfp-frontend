'use client';
import { repository } from '@/api/repository';
import { useAlert } from '@/components/template/AlertHandler';
import useErrorHandler from '@/components/template/ErrorHandler';
import BackButton from '@/components/atoms/BackButton';
import ErrorSheet from '@/components/molecules/ErrorSheet';
import LoadingScreen from '@/components/molecules/LoadingScreen';
import PartsDetail from '@/components/organisms/PartsDetailTable';
import Template from '@/components/template/Template';
import { getPlants } from '@/lib/plantSessionUtils';
import { PartsStructure, Plant } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

function usePartsHook(returnUrl: string) {
  const handleError = useErrorHandler();
  const showAlert = useAlert();
  const router = useRouter();
  const traceId = useSearchParams().get('trace-id');
  if (typeof traceId === 'undefined') {
    throw 'parameter trace-id is required';
  }

  const [isLoading, setIsLoading] = useState(false);
  const [partsStructure, setPartsStructure] = useState<PartsStructure>();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isPartsLoading, setIsPartsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isErrorDisplayOpen, setIsErrorDisplayOpen] = useState<boolean>(false);
  useEffect(() => {
    const fetch = async () => {
      if (traceId) {
        setIsPartsLoading(true);
        try {
          const [_partsStructure, _plants] = await Promise.all([
            repository.getPartsStructure(traceId),
            getPlants(),
          ]);

          setPartsStructure(_partsStructure);
          setPlants(_plants);
          setIsPartsLoading(false);
        } catch (e) {
          handleError(e);
        }
      }
    };
    fetch();
  }, [traceId, handleError]);

  const onSubmit = useCallback(
    async (value: PartsStructure) => {
      setIsLoading(true);
      try {
        await repository.registerPartsStructure(value);
        router.push(returnUrl);
        showAlert.info('部品構成情報の更新を申請しました。');
      } catch (e) {
        handleError(e);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleError, router, plants]
  );

  async function onDeleteSubmit(value: string) {
    setIsLoading(true);
    try {
      await repository.deletePartsStructure(value);
      router.push(returnUrl);
      showAlert.info('部品構成情報の削除を申請しました。');
    } catch (e) {
      handleError(e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    partsStructure,
    plants,
    onSubmit,
    isLoading,
    isPartsLoading,
    errorMessage,
    isErrorDisplayOpen,
    setIsErrorDisplayOpen,
    setErrorMessage,
    onDeleteSubmit,
  };
}

export default function PartsDetailTemplate({
  returnHref,
  backButtonText,
}: {
  returnHref: string;
  backButtonText: string;
}) {
  const {
    partsStructure,
    plants,
    onSubmit,
    onDeleteSubmit,
    isLoading,
    isPartsLoading,
    errorMessage,
    isErrorDisplayOpen,
    setIsErrorDisplayOpen,
    setErrorMessage,
  } = usePartsHook(returnHref);

  return (
    <>
      <LoadingScreen isOpen={isLoading} />
      <ErrorSheet
        key='errorSheet'
        isOpen={isErrorDisplayOpen}
        setIsOpen={setIsErrorDisplayOpen}
        title='入力内容が重複しているレコードがあります。'
      >
        <>{errorMessage}</>
      </ErrorSheet>
      <Template
        stickyHeaderContents={[
          <BackButton key='button' href={returnHref} text={backButtonText} />,
        ]}
        contents={[
          <PartsDetail
            key={'partsDetail'}
            partsStructure={partsStructure}
            plants={plants}
            onSubmit={onSubmit}
            onDeleteSubmit={onDeleteSubmit}
            isPartsLoading={isPartsLoading}
            setErrorMessage={setErrorMessage}
            setIsErrorDisplayOpen={setIsErrorDisplayOpen}
          />,
        ]}
      />
    </>
  );
}
