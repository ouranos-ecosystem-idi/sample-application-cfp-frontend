import { ReactNode } from 'react';
import { tv } from 'tailwind-variants';

const modalStyle = tv({
  base: 'fixed inset-0 w-screen h-screen z-30 bg-black bg-opacity-50 flex items-center justify-center',
  variants: {
    zIndex: {
      '40': 'z-40',
      '50': 'z-50',
    },
  },
});
type Props = {
  isOpen: boolean;
  children: ReactNode;
  zIndex?: '40' | '50';
};
export default function BaseModal({ isOpen, children, zIndex }: Props) {
  return isOpen ? (
    <div className={modalStyle({ zIndex })}>
      <div className='max-h-screen overflow-y-auto overflow-x-hidden'>
        <div className='bg-dull-white' onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}
