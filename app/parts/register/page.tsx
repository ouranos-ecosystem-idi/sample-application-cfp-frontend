'use client';
import { repository } from '@/api/repository';
import useErrorHandler from '@/components/template/ErrorHandler';
import BackButton from '@/components/atoms/BackButton';
import SectionHeader from '@/components/molecules/SectionHeader';
import PartsRegisterForm from '@/components/organisms/PartsRegisterForm';
import { PartsStructure, Plant } from '@/lib/types';
import Template from '@/components/template/Template';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAlert } from '@/components/template/AlertHandler';
import { getPlants } from '@/lib/plantSessionUtils';
import { Button } from '@/components/atoms/Button';
import LoadingScreen from '@/components/molecules/LoadingScreen';
import ErrorSheet from '@/components/molecules/ErrorSheet';
import { validatePartsDuplication } from '@/lib/utils';

export default function PartsRegisterPage() {
  const handleError = useErrorHandler();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isRegisterButtonActive, setIsRegisterButtonActive] =
    useState<boolean>(false);
  const showAlert = useAlert();
  const searchParams = useSearchParams();
  const backurl = searchParams.get('backurl');

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isErrorDisplayOpen, setIsErrorDisplayOpen] = useState<boolean>(false);
  const [errorMessage, setIsErrorMessage] = useState<string>('');
  const [isUpload, setIsUpload] = useState<boolean>(false);
  const [isConfirm, setIsConfirm] = useState<boolean>(false);

  const onSubmit = useCallback(
    async (value: PartsStructure) => {
      setIsLoading(true);
      try {
        await repository.registerPartsStructure(value);
        router.push('/parts/');
        showAlert.info('部品構成情報の登録を申請しました。');
      } catch (e) {
        handleError(e);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, router, showAlert]
  );

  // 登録確認ボタンクリック処理
  const onClickConfirm = (value: PartsStructure, plants: Plant[]) => {
    setIsConfirm(false);
    //重複チェック
    const duplicateError = validatePartsDuplication(value, plants);
    if (duplicateError !== undefined) {
      setIsErrorMessage(duplicateError);
      setIsErrorDisplayOpen(true);
      return;
    }
    setIsErrorMessage('');
    setIsErrorDisplayOpen(false);
    setIsConfirmModalOpen(true);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        setPlants(await getPlants());
      } catch (e) {
        handleError(e);
      }
    };
    fetch();
  }, [handleError]);

  return (
    <>
      <ErrorSheet
        title='入力内容が重複しているレコードがあります。'
        key='errorSheet'
        isOpen={isErrorDisplayOpen}
        setIsOpen={setIsErrorDisplayOpen}
      >
        <>{errorMessage}</>
      </ErrorSheet>
      <LoadingScreen isOpen={isLoading} />
      <Template
        stickyHeaderContents={[
          <BackButton
            key='button'
            href={backurl ?? '/parts'}
            text={backurl ? '部品紐付け' : '部品構成一覧'}
          />,
          <SectionHeader
            key='header'
            title='部品構成登録'
            variant='h1'
            align='bottom'
            className='pb-4'
            rightChildren={[
              <Button
                key='csv'
                id='button_csv'
                onClick={() => {
                  setIsUpload(true);
                }}
                type='button'
                variant='outline'
              >
                CSV取り込み
              </Button>,
              <Button
                key='confirm'
                type='button'
                onClick={() => {
                  setIsConfirm(true);
                }}
                disabled={!isRegisterButtonActive}
              >
                登録
              </Button>,
            ]}
            stickyOptions={{ backgroundTop: true }}
          />,
        ]}
        contents={[
          <PartsRegisterForm
            key='form'
            plants={plants}
            onSubmit={onSubmit}
            isConfirmModalOpen={isConfirmModalOpen}
            setIsConfirmModalOpen={setIsConfirmModalOpen}
            setIsRegisterButtonActive={setIsRegisterButtonActive}
            isCsvUpload={isUpload}
            setIsCsvUpload={setIsUpload}
            isConfirm={isConfirm}
            onClickConfirm={onClickConfirm}
          />,
        ]}
      />
    </>
  );
}
