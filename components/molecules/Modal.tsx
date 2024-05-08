import { ReactNode } from 'react';
import BaseModal from '@/components/atoms/BaseModal';
import { Button } from '@/components/atoms/Button';
import { X } from '@phosphor-icons/react/dist/ssr';

type Props = {
  title: string;
  button: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function Modal({
  title,
  button,
  children,
  isOpen,
  setIsOpen,
}: Props) {
  return (
    <BaseModal isOpen={isOpen}>
      <div style={{ width: '900px' }} className='px-10 py-6 relative'>
        <div
          className='absolute top-8 right-8 cursor-pointer'
          onClick={() => setIsOpen(false)}
        >
          <X size='24' className='fill-primary' />
        </div>

        <div className='font-semibold text-base'>{title}</div>

        {children}

        <div className='flex justify-center'>
          <div className='flex gap-4'>
            {button}
            <Button variant='outline' onClick={() => setIsOpen(false)}>
              キャンセル
            </Button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
