import Header from '@/components/organisms/Header';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const CONTENTS_WIDTH = '1424px';

export default function LayoutWithHeader({ children }: Props) {
  return (
    <>
      <Header contentsWidth={CONTENTS_WIDTH} />
      <div
        className='flex justify-center'
        style={{ height: 'calc(100vh - 43px)' }}
      >
        <div className='flex overflow-x-auto overflow-y-scroll sticky t-0 w-full min-[1424px]:justify-center'>
          <div
            className='px-8 relative'
            style={{
              width: CONTENTS_WIDTH,
              minWidth: CONTENTS_WIDTH,
            }}
          >
            <div className='py-4 relative '>
              <div className='bg-[#FAFAFA] h-4 absolute w-full top-0 right-0' />
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
