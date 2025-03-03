import { CSSProperties, ReactNode } from 'react';
import { tv } from 'tailwind-variants';
type Props = {
  title?: string;
  variant?: 'h1' | 'h2' | 'h3';
  align?: 'top' | 'middle' | 'bottom';
  leftChildren?: ReactNode[];
  rightChildren?: ReactNode[];
  className?: string;
  stickyOptions?: { top?: number; backgroundTop?: boolean; };
};
const outer = tv({
  base: 'flex',
  variants: {
    align: {
      top: 'items-start',
      middle: 'items-center',
      bottom: 'items-end',
    },
    backgroudTop: {
      true: 'before:content-[""] before:w-[1381px] before:absolute before:bottom-0 before:bg-[#FAFAFA] before:z-[-1] before:h-32  before:left-[-2px]',
      false: '',
    },
  },
});
export default function SectionHeader({
  title,
  variant = 'h1',
  align = 'top',
  leftChildren = [],
  rightChildren = [],
  className = '',
  stickyOptions,
}: Props) {
  const stickyBackGroundStyleClass: CSSProperties = stickyOptions?.top
    ? {
      position: 'sticky',
      top: stickyOptions.top,
      zIndex: 25,
    }
    : {};
  return (
    <>
      <div
        className={`${outer({
          align,
          backgroudTop:
            stickyOptions?.backgroundTop === undefined ? false : true,
        })} ${className} `}
        style={stickyBackGroundStyleClass}
      >
        {title !== undefined && (
          <>
            {variant === 'h1' && (
              <h1 className='font-semibold text-2xl leading-9'>{title}</h1>
            )}
            {variant === 'h2' && (
              <h2 className='font-semibold text-xl'>{title}</h2>
            )}
            {variant === 'h3' && (
              <h3 className='font-semibold text-base'>{title}</h3>
            )}
          </>
        )}
        <div className={'flex gap-4'}>{leftChildren}</div>
        <div className='flex ml-auto gap-4'>{rightChildren}</div>
      </div>
    </>
  );
}
