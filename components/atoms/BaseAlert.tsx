import React, { useEffect, useState } from 'react';
import { tv } from 'tailwind-variants';
import { Info } from '@phosphor-icons/react/dist/ssr/Info';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { WarningCircle } from '@phosphor-icons/react/dist/ssr/WarningCircle';

const AlertStyle = tv({
  base: 'alert rounded border-2 text-default-text text-base font-semibold w-[500px] h-[60px] top-12 mr-10 z-50 absolute flex items-center',
  variants: {
    type: {
      success: 'bg-[#F3F8F7] border-[#0F755F]',
      info: 'bg-[#F3F8FA] border-primary',
      error: 'bg-[#FFF7F4] border-error',
    },
  },
});

type Props = {
  isOpen: boolean;
  message: string;
  type?: 'info' | 'error' | 'success';
};

export default function BaseAlert({ isOpen, message, type = 'info' }: Props) {
  const [isDisplayed, setIsDisplayed] = useState(false);

  const [displayMessage, setDisplayMessage] = useState(message);
  const [displayType, setDisplayType] = useState(type);

  useEffect(() => {
    if (isOpen) {
      setIsDisplayed(true);
      setDisplayMessage(message);
      setDisplayType(type);
    } else {
      const timer = setTimeout(() => {
        setIsDisplayed(false);
        setDisplayMessage('');
        setDisplayType('info');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, message, type]);

  const animationClass = isOpen ? 'animate-fade-in' : 'animate-fade-out';

  return isDisplayed ? (
    <div className='absolute flex justify-center w-full top-0'>
      <div className='w-[1424px] flex justify-end'>
        <div role='alert' className={`${AlertStyle({ type })} ${animationClass}`}>
          {displayType === 'success' && (
            <CheckCircle size='32' className='fill-[#0F755F]' />
          )}
          {displayType === 'info' && <Info size='32' className='fill-primary' />}
          {displayType === 'error' && (
            <WarningCircle size='32' className='fill-error' />
          )}
          {displayMessage}
        </div>
      </div>
    </div>
  ) : null;
}
