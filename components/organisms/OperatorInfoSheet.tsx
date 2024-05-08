import { Operator } from '@/lib/types';
import Card from '@/components/atoms/Card';
import DataSheet from '@/components/molecules/DataSheet';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';

type Props = {
  operatorData: Operator;
  isLoading: boolean;
};
export default function OperatorInfoSheet({ operatorData, isLoading }: Props) {
  return (
    <Card
      className='p-6'
      skeletonProperty={{ isLoading: isLoading, height: 'h-24' }}
    >
      <DataSheet
        data={[
          {
            header: '事業者名',
            value: (
              <p className='w-[334px] truncate'>{operatorData.operatorName}</p>
            ),
            width: 500,
          },
          {
            header: '事業者識別子（ローカル）',
            value: operatorData.openOperatorId,
            width: 364,
          },
          {
            header: '事業者識別子（グローバル）',
            value: operatorData.globalOperatorId ?? <DisplayHyphen />,
            width: 200,
          },
        ]}
      />
    </Card>
  );
}
