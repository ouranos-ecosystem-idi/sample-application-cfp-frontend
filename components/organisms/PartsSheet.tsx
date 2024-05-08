import { Parts, Plant } from '@/lib/types';
import Card from '@/components/atoms/Card';
import DetailInfoHorizontal from '@/components/molecules/DetailInfoHorizontal';
import { isEmpty } from '@/lib/utils';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';

type Props = {
  partsData?: Parts;
  plants: Plant[];
  isLoading: boolean;
};
export default function PartsSheet({ partsData, plants, isLoading }: Props) {
  const plant = plants.find(({ plantId }) => plantId && plantId === partsData?.plantId);

  return (
    <Card
      className='p-6'
      skeletonProperty={{ isLoading: isLoading, height: 'h-24' }}
    >
      <DetailInfoHorizontal
        gap={52}
        data={[
          {
            header: '部品項目',
            value: partsData?.partsName ?? <DisplayHyphen />,
            width: 180,
          },
          {
            header: '補助項目',
            value: isEmpty(partsData?.supportPartsName) ? (
              <DisplayHyphen />
            ) : (
              partsData?.supportPartsName
            ),
            width: 88,
          },
          {
            header: '事業所名',
            value:
              plant?.plantName ?? <DisplayHyphen />,
            width: 280,
          },
          {
            header: '事業所識別子',
            value:
              plant?.openPlantId ?? <DisplayHyphen />,
            width: 240,
          },
          {
            header: 'トレース識別子',
            value: partsData?.traceId ?? <DisplayHyphen />,
            width: 316,
          },
        ]}
      />
    </Card>
  );
}
