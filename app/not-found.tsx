import { Button } from '@/components/atoms/Button';
import Link from 'next/link';

export default function NotFound() {
  const buttonName = '部品構成一覧に戻る';
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h2 className='mb-[60px] font-semibold text-[24px]'>
        お探しのページは見つかりません
      </h2>
      <div className='flex flex-col items-center justify-center'>
        <Link href={'/parts'}>
          <Button>{buttonName}</Button>
        </Link>
      </div>
    </div>
  );
}
