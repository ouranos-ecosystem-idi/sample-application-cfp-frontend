import { ReactNode } from 'react';
import { tv } from 'tailwind-variants';

type Props = {
  children: ReactNode;
  data: {
    header: string;
    width?: number;
    value: ReactNode;
  }[];
  position?: 'center' | 'left';
  triangle?: 'center' | 'left';
  isLoading?: boolean;
};

const tooltip = tv({
  base:
    'rounded text-xs font-normal bg-default-text z-30 p-3 max-w-lg w-max ' +
    'opacity-0 group-hover:opacity-100 transition pointer-events-none',
  variants: {
    position: {
      center: 'absolute left-1/2 -translate-x-1/2 top-[calc(100%_+_8px)]',
      left: 'absolute left-12 -translate-x-full top-[calc(100%_+_8px)]',
    },
    triangle: {
      center:
        'before:left-1/2 before:-translate-x-1/2 before:absolute before:bottom-[calc(100%_-_24px)] before:w-6 before:h-6 before:rotate-[47deg] before:rounded before:bg-default-text before:z-[-1] before:skew-y-[20deg]  before:skew-x-[20deg] before:content-[""]',
      left: 'before:absolute before:bottom-[calc(100%_-_24px)] before:left-[352px] before:w-6 before:h-6 before:rotate-45 before:rounded before:bg-default-text before:z-[-1] before:skew-y-[20deg]  before:skew-x-[20deg] before:content-[""]',
    },
  },
});

export default function TooltipDetailInfoHorizontal({
  children,
  data,
  position = 'left',
  triangle = 'left',
  isLoading = false,
}: Props) {
  return isLoading ? (
    <div className='relative group'>
      <div className={tooltip({ position, triangle })}>
        <div className='flex flex-col items-center justify-center w-[372px]'>
          <span className='text-xs text-white'>部品情報を取得中です。</span>
          <div className='loading loading-dots loading-lg text-white' />
        </div>
      </div>
      <div>{children}</div>
    </div>
  ) : (
    <div className='relative group'>
      <div className={tooltip({ position, triangle })}>
        <table className='text-left w-full'>
          <thead>
            <tr>
              {data.map(({ header, width }) => (
                <th
                  key={header}
                  className='font-semibold text-xs pt-1 pr-4 last:pr-0 text-white'
                  style={{ width: width && `${width}px` }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className='align-top'>
              {data.map(({ header, value }) => (
                <td key={header} className='pt-2 pr-2 pb-1 last:pr-0 '>
                  <div className='text-xs line-clamp-2 text-white'>{value}</div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div>{children}</div>
    </div>
  );
}
