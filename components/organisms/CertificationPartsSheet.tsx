import { ComponentProps } from 'react';
import { Parts, Plant } from '@/lib/types';
import Card from '@/components/atoms/Card';
import DetailInfoHorizontal from '@/components/molecules/DetailInfoHorizontal';
import { isEmpty } from '@/lib/utils';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';

export default function CertificationPartsSheet({
  parts,
  plant,
}: {
  parts: Parts;
  plant?: Plant;
}) {
  const partsSheetData: ComponentProps<typeof DetailInfoHorizontal>['data'] = [
    {
      header: '部品項目',
      value: parts.partsName,
      width: 92,
    },
    {
      header: '補助項目',
      value: isEmpty(parts.supportPartsName) ? (
        <DisplayHyphen />
      ) : (
        parts.supportPartsName
      ),
      width: 88,
    },
    {
      header: '事業所名',
      value: plant?.plantName ?? <DisplayHyphen />,
      width: 188,
    },
    {
      header: '事業所識別子',
      value: plant?.openPlantId ?? <DisplayHyphen />,
      width: 160,
    },
    {
      header: 'トレース識別子',
      value: parts.traceId,
      width: 168,
    },
  ];
  return (
    <Card className='mb-8 p-6'>
      <DetailInfoHorizontal gap={24} data={partsSheetData} />
    </Card>
  );
}
