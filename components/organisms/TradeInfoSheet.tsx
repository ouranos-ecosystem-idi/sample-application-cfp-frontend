import Card from '@/components/atoms/Card';
import DisplayHyphen from '@/components/atoms/DisplayHyphen';
import DetailInfoHorizontal from '@/components/molecules/DetailInfoHorizontal';
import { Operator, TradeResponseDataType } from '@/lib/types';
import { isEmpty } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../atoms/Button';
import InputTextArea from '../atoms/InputTextArea';
import PopupModal from '../molecules/PopupModal';

type Props = {
  tradeResponseData: TradeResponseDataType;
  operatorsData: Operator[];
  isLoading: boolean;
  onUpdate: (requestId: string, replyMessage: string) => void;
};

export default function TradeInfoSheet({
  tradeResponseData,
  operatorsData = [],
  isLoading,
  onUpdate
}: Props) {
  const [isInputMessageModalOpen, setIsInputMessageModalOpen] = useState<boolean>(false);
  const statusId = `${tradeResponseData.statusId}`;
  const partsToShow = tradeResponseData.downstreamPart ?? undefined;
  const [replyMessage, setReplyMessage] = useState('');
  useEffect(() => {
    setReplyMessage(tradeResponseData.replyMessage ?? '');
  }, [tradeResponseData]);

  const checkInputMessage = useMemo(() => {
    if (replyMessage.length > 1000) return false;
    return true;
  }, [replyMessage.length]);

  return (
    <>
      <Card
        className='p-6'
        skeletonProperty={{ isLoading: isLoading, height: 'h-52' }}
      >
        <DetailInfoHorizontal
          gap={70}
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
              width: 160,
            },
            {
              header: '単位',
              value: partsToShow?.amountRequiredUnit,
              width: 100,
            },
            {
              header: '回答希望日',
              value: isEmpty(tradeResponseData.responseDueDate) ?
                (<DisplayHyphen />) :
                tradeResponseData.responseDueDate!.replaceAll('-', '/'),
              width: 100,
            },
          ]}
        />
        <div className='mt-5 mb-2 text-xs'>メッセージ</div>
        <div className='text-base max-h-[90px] w-full break-words overflow-y-auto'>
          {tradeResponseData.message ? tradeResponseData.message : <DisplayHyphen align='left' />}
        </div>
        <div className='mt-5 mb-2 text-xs'>応答メッセージ</div>
        <div className='flex justify-between items-center'>
          <div className='text-base max-h-[90px] break-words overflow-y-auto'>
            {tradeResponseData.replyMessage ? tradeResponseData.replyMessage : <DisplayHyphen align='left' />}
          </div>
          <Button
            key='link-button'
            className='w-20 ml-4'
            onClick={() => {
              setIsInputMessageModalOpen(true);
            }}
          >
            編集
          </Button>
        </div>
      </Card>
      <PopupModal
        zIndex='40'
        button={
          <Button color='primary' variant='solid' size='default'
            onClick={() => {
              onUpdate(statusId, replyMessage);
              setIsInputMessageModalOpen(false);
              setReplyMessage(tradeResponseData.replyMessage ?? '');
            }}
            disabled={!checkInputMessage}
          >
            登録
          </Button>
        }
        isOpen={isInputMessageModalOpen}
        setIsOpen={setIsInputMessageModalOpen}
      >
        <p>応答メッセージ </p>
        <InputTextArea
          className='p-1 h-[80px] font-semibold'
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          error={checkInputMessage ? undefined : '1000文字以内'}
        />
      </PopupModal>
    </>
  );
}
