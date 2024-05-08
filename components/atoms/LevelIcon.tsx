import { PartLevel } from '@/lib/types';
import { tv } from 'tailwind-variants';

type Props = {
  level?: PartLevel;
};

const styles = tv({
  base: 'flex items-center justify-center h-5 w-5 rounded text-[10px] font-semibold text-white',
  variants: {
    level: {
      1: 'bg-[#00588C]/40',
      2: 'bg-[#00588C]/60',
    },
  },
});

export default function LevelIcon({ level }: Props) {
  return <div className={styles({ level })}>{level}</div>;
}
