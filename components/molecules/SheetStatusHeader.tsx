import { ReactNode } from 'react';

type Props = {
  statusBadge: ReactNode;
  lastUpdated: string;
};
export default function SheetStatusHeader({ statusBadge, lastUpdated }: Props) {
  return (
    <div className='flex items-center'>
      <div className='grow'>{statusBadge}</div>
      <div>
        <span className='text-xs mr-5'>最終更新日</span>
        <span className='text-xs'>{lastUpdated}</span>
      </div>
    </div>
  );
}
