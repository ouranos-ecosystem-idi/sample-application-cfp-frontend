import { FileArchive } from '@phosphor-icons/react/dist/ssr';

type Props = {
  href?: string;
};
export default function ArchiveButton({ href }: Props) {
  return (
    <a href={href} className='flex items-center cursor-pointer'>
      <FileArchive size='16' className='fill-primary' />
      <div className='m-1 text-link-blue text-xs underline'>アーカイブ</div>
    </a>
  );
}
