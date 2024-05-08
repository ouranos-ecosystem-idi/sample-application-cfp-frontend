import { X } from '@phosphor-icons/react/dist/ssr/X';
import { XCircle } from '@phosphor-icons/react/dist/ssr/XCircle';
import { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function ErrorSheet({
  title,
  children,
  isOpen,
  setIsOpen,
}: Props) {
  return isOpen ? (
    <div className='fixed h-[100px] pr-12 pl-4 z-40 pt-1  w-[1360px] top-14 rounded z-30 border-2 border-error bg-[#FFF7F4]'>
      <div
        className='absolute top-3 right-3 cursor-pointer'
        onClick={() => setIsOpen(false)}
      >
        <X size='20' />
      </div>
      <div className='overflow-auto h-full w-full pt-3 pb-2'>
        <div className=' mb-2 flex items-center'>
          <XCircle size={24} weight='bold' className='fill-error mr-2' />
          <div className='text-base font-semibold'>{title}</div>
        </div>
        <p className='break-words whitespace-pre-wrap ml-8 text-xs font-semibold leading-[18px]'>
          {children}
        </p>
      </div>
    </div>
  ) : (
    <></>
  );
}
