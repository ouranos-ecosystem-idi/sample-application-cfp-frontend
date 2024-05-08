import { Triangle } from '@phosphor-icons/react/dist/ssr/Triangle';

export default function TableHeaderWithSortIcon({
  text,
  order,
  bold,
}: {
  text: string;
  order?: 'asc' | 'desc';
  bold?: boolean;
}) {
  return (
    <div className='flex items-center'>
      <span className={bold ? 'font-semibold' : ''}>{text}</span>
      <span className='ml-1'>
        <Triangle
          size='8'
          className='fill-primary'
          weight={order === 'asc' ? 'fill' : undefined}
        />
        <Triangle
          size='8'
          className='fill-primary rotate-180'
          weight={order === 'desc' ? 'fill' : undefined}
        />
      </span>
    </div>
  );
}
