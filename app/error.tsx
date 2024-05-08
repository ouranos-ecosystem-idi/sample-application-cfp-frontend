'use client';
import { Button } from '@/components/atoms/Button';
import BaseModal from '@/components/atoms/BaseModal';
import { X } from '@phosphor-icons/react/dist/ssr';

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <BaseModal isOpen={true}>
      <div
        style={{ width: '900px' }}
        className='h-72 px-24 pb-10 pt-20 relative rounded flex flex-col justify-between'
      >
        <div
          className='absolute top-8 right-8 cursor-pointer'
          onClick={() => reset()}
        >
          <X size='24' className='fill-primary' />
        </div>
        <div className='relative flex flex-col justify-center'>
          <div className='font-semibold text-2xl mb-2 mt-2 text-wrap whitespace-pre-wrap'>
            エラーが発生しました。管理者にお問い合わせください。
          </div>
        </div>
        <div className='flex justify-center'>
          <div className='flex gap-4'>
            <Button
              color='primary'
              variant='solid'
              size='default'
              onClick={() => reset()}
            >
              再読み込み
            </Button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
