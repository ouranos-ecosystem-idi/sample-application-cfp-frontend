import { ReactNode } from 'react';

type Props = {
  header: string;
  data: {
    header: ReactNode;
    value: ReactNode;
    lineBreak?: boolean;
  }[];
  headerWidth?: number;
  valueWidth?: number;
  gap?: number;
};
export default function DetailInfo({
  header,
  data,
  headerWidth,
  valueWidth,
  gap = 8,
}: Props) {
  return (
    <div>
      <div className='font-semibold pb-3'>{header}</div>
      <div className='flex flex-col' style={gap ? { gap: `${gap}px` } : {}}>
        {data.map((row, index) => (
          <div key={index} className='flex'>
            <div
              className={`${headerWidth ? '' : 'w-1/3'} shrink-0`}
              style={headerWidth ? { width: `${headerWidth}px` } : {}}
            >
              {row.header}
            </div>
            <div
              className={`${headerWidth ? '' : 'w-2/3'} ${row.lineBreak ? 'break-all' : 'line-clamp-1 break-all'
                }`}
              style={valueWidth ? { width: `${valueWidth}px` } : {}}
            >
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
