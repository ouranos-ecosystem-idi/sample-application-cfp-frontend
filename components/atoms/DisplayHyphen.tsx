import { tv } from 'tailwind-variants';

const div = tv({
  base: 'w-full',
  variants: {
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
});

type Align = 'left' | 'center' | 'right';

type Props = {
  align?: Align;
  className?: string;
};

export default function DisplayHyphen({
  align = 'center',
  className = '',
}: Props) {
  return <div className={div({ align }) + ' ' + className}>-</div>;
}
