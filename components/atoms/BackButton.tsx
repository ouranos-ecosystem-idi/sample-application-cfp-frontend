import { CaretLeft } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

type Props = {
  href: string;
  text: string;
};
export default function BackButton({ href, text }: Props) {
  return (
    <div className='leading-3'>
      <Link className='inline-flex items-center cursor-pointer' href={href}>
        <CaretLeft size='24' className='fill-primary' />
        <span className='text-primary'>{text}</span>
      </Link>
    </div>
  );
}
