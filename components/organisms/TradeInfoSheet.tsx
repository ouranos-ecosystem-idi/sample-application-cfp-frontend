import { TradeResponseDataType, Operator } from '@/lib/types';
import Card from '@/components/atoms/Card';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';
import DetailInfoHorizontal from '@/components/molecules/DetailInfoHorizontal';
import { isEmpty } from '@/lib/utils';

type Props = {
  tradeResponseData: TradeResponseDataType;
  operatorsData: Operator[];
  isLoading: boolean;
};

export default function TradeInfoSheet({
  tradeResponseData,
  operatorsData = [],
  isLoading,
}: Props) {
  const partsToShow = tradeResponseData.downstreamPart ?? undefined;
  return (
    <Card
      className='p-6'
      skeletonProperty={{ isLoading: isLoading, height: 'h-52' }}
    >
      <DetailInfoHorizontal
        gap={72}
        data={[
          {
            header: '事業者名',
            value: operatorsData.find(
              (op) => op.operatorId === tradeResponseData.downstreamOperatorId
            )?.operatorName,
            width: 208,
          },
          {
            header: '事業者識別子',
            value: operatorsData.find(
              (op) => op.operatorId === tradeResponseData.downstreamOperatorId
            )?.openOperatorId,
            width: 120,
          },
          {
            header: '部品項目',
            value: isEmpty(partsToShow?.partsName) ? (
              <DisplayHyphen />
            ) : (
              partsToShow!.partsName
            ),
            width: 100,
          },
          {
            header: '補助項目',
            value: isEmpty(partsToShow?.supportPartsName) ? (
              <DisplayHyphen />
            ) : (
              partsToShow!.supportPartsName
            ),
            width: 96,
          },
          {
            header: 'トレース識別子',
            value: tradeResponseData.downstreamTraceId,
            width: 308,
          },
          {
            header: '単位',
            value: partsToShow?.amountRequiredUnit,
            width: 120,
          },
        ]}
      />
      <div className='mt-5 mb-2 text-xs'>メッセージ</div>
      <div className='text-base'>{tradeResponseData.message ? tradeResponseData.message : <DisplayHyphen />}</div>
    </Card>
  );
}
