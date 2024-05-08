import { ReactNode } from 'react';
import BaseModal from '@/components/atoms/BaseModal';
import { Button } from '@/components/atoms/Button';
import { X } from '@phosphor-icons/react/dist/ssr';

type Props = {
  title?: string;
  button?: ReactNode;
  children?: ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  type?: 'info' | 'error';
};

export default function PopupModal({
  title,
  button,
  children,
  isOpen,
  setIsOpen,
  type = 'info',
}: Props) {
  return (
    <BaseModal isOpen={isOpen}>
      <div
        style={{ width: '900px' }}
        className='h-72 px-24 pb-10 pt-20 relative rounded flex flex-col justify-between'
      >
        <div
          className='absolute top-8 right-8 cursor-pointer'
          onClick={() => setIsOpen(false)}
        >
          <X size='24' className='fill-primary' />
        </div>
        <div className='relative flex flex-col justify-center'>
          <div className='font-semibold text-2xl mb-2 mt-2 text-wrap whitespace-pre-wrap'>
            {title}
          </div>
          {children}
        </div>
        <div className='flex justify-center'>
          <div className='flex gap-4'>
            {type === 'info' ? (
              <>
                {button}
                <Button variant='outline' onClick={() => setIsOpen(false)}>
                  キャンセル
                </Button>
              </>
            ) : (
              <Button
                color='primary'
                variant='solid'
                size='default'
                onClick={() => setIsOpen(false)}
              >
                閉じる
              </Button>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
