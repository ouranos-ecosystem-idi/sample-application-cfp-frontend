import { ReactNode } from 'react';
import { tv } from 'tailwind-variants';

type Props = {
  message: ReactNode;
  children: ReactNode;
  position?: 'center' | 'left';
  triangle?: 'center' | 'left';
};

const tooltip = tv({
  base:
    'rounded text-xs font-normal bg-default-text p-4 max-w-lg w-max ' +
    'opacity-0 group-hover:opacity-100 transition pointer-events-none z-20',
  variants: {
    position: {
      center: 'absolute left-1/2 -translate-x-1/2 bottom-[calc(100%_-_104px)]',
      left: 'absolute left-12 -translate-x-full bottom-[calc(100%_-_108px)]',
    },
    triangle: {
      center:
        'before:left-1/2 before:-translate-x-1/2 before:absolute before:bottom-[calc(100%_-_24px)] before:w-6 before:h-6 before:rotate-[47deg] before:rounded before:bg-default-text before:z-[-1] before:skew-y-[20deg]  before:skew-x-[20deg] before:content-[""]',
      left: 'before:absolute before:bottom-[calc(100%_-_24px)] before:left-[352px] before:w-6 before:h-6 before:rotate-45 before:rounded before:bg-default-text before:z-[-1] before:skew-y-[20deg]  before:skew-x-[20deg] before:content-[""]',
    },
  },
});

export default function Tooltip({
  children,
  message,
  position = 'center',
  triangle = 'center',
}: Props) {
  return (
    <span className='relative group'>
      <span className={`${tooltip({ position, triangle })} text-white`}>
        {message}
      </span>
      <span className='text-white'>{children}</span>
    </span>
  );
}
