'use client';
import BackButton from '@/components/atoms/BackButton';
import PartsDetail from '@/components/organisms/PartsDetailTable';
import Template from '@/components/template/Template';
import { repository } from '@/api/repository';
import useErrorHandler from '@/components/template/ErrorHandler';
import { PartsStructure, Plant } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useAlert } from '@/components/template/AlertHandler';
import { getPlants } from '@/lib/plantSessionUtils';
import LoadingScreen from '@/components/molecules/LoadingScreen';
import ErrorSheet from '@/components/molecules/ErrorSheet';

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
            isPartsLoading={isPartsLoading}
            setErrorMessage={setErrorMessage}
            setIsErrorDisplayOpen={setIsErrorDisplayOpen}
          />,
        ]}
      />
    </>
  );
}
