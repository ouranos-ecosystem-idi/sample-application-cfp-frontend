'use client';
import SectionHeader from '@/components/molecules/SectionHeader';
import Template from '@/components/template/Template';
import { Operator, Plant } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';
import useErrorHandler from '@/components/template/ErrorHandler';
import { useAlert } from '@/components/template/AlertHandler';
import PlantTable from '@/components/organisms/PlantTable';
import OperatorInfoSheet from '@/components/organisms/OperatorInfoSheet';
import { setPlants } from '@/lib/plantSessionUtils';
import { repository } from '@/api/repository';
import { returnErrorAsValue } from '@/lib/utils';
import LoadingScreen from '@/components/molecules/LoadingScreen';

export default function PlantsListPage() {
  const handleError = useErrorHandler();
  const showAlert = useAlert();
  const [plantsData, setPlantsData] = useState<Plant[]>([]);
  const [operatorData, setOperatorData] = useState<Operator>({
    operatorId: '',
    operatorName: '',
    openOperatorId: '',
    globalOperatorId: '',
  });

  const [isSheetLoading, setIsSheetLoading] = useState<boolean>(true);

  const operatorSheetFetchPart = async () => {
    const operatorData = await repository.getOperatorByOpenOperatorId();
    setOperatorData(operatorData);
    setIsSheetLoading(false);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isPlantsLoading, setIsPlantsLoading] = useState<boolean>(true);

  const fetchPlants = async () => {
    setIsPlantsLoading(true);
    const _plants = await setPlants();
    setPlantsData(_plants);
    setIsPlantsLoading(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchPlants();
        await operatorSheetFetchPart();
      } catch (e) {
        handleError(e);
      }
    };
    fetchData();
  }, [handleError]);

  const onSubmit = useCallback(
    async (modifiedPlants: Plant[]) => {
      setIsLoading(true);
      // 各事業所データの更新処理の結果を格納する配列
      const results = await Promise.all(
        modifiedPlants.map((plant) =>
          returnErrorAsValue(
            () =>
              repository.registerPlantsData(plant) ?? Promise.resolve(undefined)
          )
        )
      );

      // エラー結果のみを抽出
      const errors = results
        .filter((result) => result.error !== undefined)
        .map((result) => result.error);

      // 更新後の事業所情報を取得
      const _plantsData = await setPlants();
      setPlantsData(_plantsData);
      setIsLoading(false);
      if (errors.length === modifiedPlants.length) {
        // 全ての更新が失敗した場合
        handleError(errors.at(0));
      } else if (errors.length > 0) {
        // 一部の更新が失敗した場合
        handleError(errors.at(0), [
          '一部、処理を完了することができませんでした。',
          '画面を更新してから、リトライしてください。',
        ]);
      } else {
        // 全ての更新が成功した場合
        showAlert.success('事業所情報を登録しました。');
      }
    },
    [handleError, showAlert]
  );

  return (
    <>
      <LoadingScreen isOpen={isLoading} />
      <Template
        stickyHeaderContents={[
          <SectionHeader
            key='title'
            title='事業所情報一覧'
            variant='h1'
            className='pt-4'
            stickyOptions={{ backgroundTop: true }}
          />,
        ]}
        contents={[
          <OperatorInfoSheet
            key='businessInfo'
            operatorData={operatorData}
            isLoading={isSheetLoading}
          />,
          <PlantTable
            key='form'
            onSubmit={onSubmit}
            initialData={plantsData}
            isPlantLoading={isPlantsLoading}
          />,
        ]}
      />
    </>
  );
}
