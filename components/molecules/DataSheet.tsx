import { ReactNode } from 'react';

type Props = {
  data: {
    header: string;
    width?: number;
    value: ReactNode;
  }[];
};
export default function DataSheet({ data }: Props) {
  return (
    <div className='flex gap-[84px] break-all'>
      {data.map(({ header, width, value }) => (
        <div
          key={header}
          className='flex flex-col gap-3'
          style={{ width: width && `${width}px` }}
        >
          <div className='text-xs'>{header}</div>
          <div className='h-full flex items-center'>
            <div className='text-base'>{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
