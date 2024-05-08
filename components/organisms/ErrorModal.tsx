import { Fragment } from 'react';
import BaseModal from '@/components/atoms/BaseModal';
import { Button } from '@/components/atoms/Button';
import { X } from '@phosphor-icons/react/dist/ssr';
import { useRouter } from 'next/navigation';
import { ModalError } from '@/api/modalError';

type Props = {
  error?: ModalError;
  overrideTitle?: string[];
  onReset: () => void;
};

export default function ErrorModal({ error, overrideTitle, onReset }: Props) {
  const router = useRouter();
  function gotoLoginPage() {
    router.push('/login');
  }
  const titleStringArray = overrideTitle ?? error?.toTitleStringArray() ?? [];
  const onClick = () => {
    if (error?.needLogin) {
      gotoLoginPage();
    }
    onReset();
  };
  return (
    <BaseModal isOpen={error !== undefined} zIndex='50'>
      <div style={{ width: '900px' }} className='px-[100px] pt-8 pb-5 relative'>
        <div className='absolute top-8 right-8 cursor-pointer'>
          <X size='24' className='fill-primary' onClick={onClick} />
        </div>

        <div className='font-semibold text-2xl mb-2'>
          {titleStringArray.map((s, i) => (
            <Fragment key={i}>
              {s}
              <br />
            </Fragment>
          ))}
        </div>
        <div className=''>
          {error?.toBodyStringArray().map((s, i) => (
            <Fragment key={i}>
              {s}
              <br />
            </Fragment>
          ))}
        </div>
        <div className='flex justify-center mt-5'>
          <Button onClick={onClick}>閉じる</Button>
        </div>
      </div>
    </BaseModal>
  );
}
