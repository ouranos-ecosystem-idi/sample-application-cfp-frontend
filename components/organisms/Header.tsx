'use client';
import { deleteAccessToken } from '@/api/accessToken';
import { UserCircle } from '@phosphor-icons/react/dist/ssr/UserCircle';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAlert } from '@/components/template/AlertHandler';

type Props = {
  contentsWidth: string;
};
export default function Header({ contentsWidth }: Props) {
  const pathname = usePathname();
  const showAlert = useAlert();
  const router = useRouter();

  const tabs = [
    { name: '部品構成一覧', basePath: '/parts' },
    { name: '受領依頼一覧', basePath: '/requests' },
    { name: '通知一覧', basePath: '/notifications' },
    { name: '事業所情報一覧', basePath: '/plants' },
  ];

  const onLogout = () => {
    deleteAccessToken();
    router.push('/login');
    showAlert.success('ログアウトに成功しました。');
  };

  return (
    <div className='w-full bg-white h-10 flex items-center justify-center border-b border-done-gray'>
      <div className='px-8 h-full flex' style={{ width: contentsWidth }}>
        <div className='flex grow gap-8 h-full'>
          {tabs.map(({ name, basePath }) => (
            <Link key={name} href={basePath}>
              <div
                className={
                  'h-full px-5 flex items-center border-b-4 pt-1 cursor-pointer ' +
                  (pathname.startsWith(basePath)
                    ? 'font-semibold border-primary'
                    : 'border-transparent hover:opacity-70')
                }
              >
                {name}
              </div>
            </Link>
          ))}
        </div>
        <div className='inline-flex items-center '>
          <div className='dropdown dropdown-bottom dropdown-end'>
            <div
              tabIndex={0}
              role='button'
              className='btn btn-link btn-sm no-underline hover:no-underline hover:opacity-70 p-0'
            >
              <div className='inline-flex items-center'>
                <div className='mr-1 font-normal text-default-text'>
                  アカウント
                </div>
                <UserCircle size={24} className='fill-primary' />
              </div>
            </div>
            <ul
              tabIndex={0}
              className='dropdown-content z-[1] menu p-0 mt-1 shadow rounded bg-white min-w-[100px]'
            >
              <li className='[&>div]:text-xs'>
                <div
                  onClick={onLogout}
                  className='p-4 hover:pointer hover:opacity-70 hover:bg-white'
                >
                  ログアウト
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
