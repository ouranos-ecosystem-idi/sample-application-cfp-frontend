import { tv } from 'tailwind-variants';

const input_number = tv({
  base: 'input input-bordered w-full border-neutral rounded h-11 text-xs focus:outline-none',
  variants: {
    align: {
      left: '',
      center: 'text-center',
      right: 'text-right',
    },
  },
});

type Props = {
  value: number | undefined;
  setValue: (value: number | undefined) => void;
  inputWidth?: number;
  unit?: string;
  noUnit?: boolean;
  step?: number;
  align?: 'left' | 'center' | 'right';
};

export default function InputWithUnits({
  value,
  setValue,
  inputWidth,
  unit = 'kg-co2/kg',
  noUnit,
  step = 1,
  align = 'left',
}: Props) {
  return (
    <div className='flex items-center gap-1 '>
      <input
        className={input_number({ align })}
        style={{ width: inputWidth ? `${inputWidth * 4}px` : '' }}
        type='number'
        step={step}
        value={value ?? ''}
        onChange={(e) =>
          setValue(e.target.value === '' ? undefined : Number(e.target.value))
        }
      />
      {noUnit || <span className='font-normal text-[10px] ml-1'>{unit}</span>}
    </div>
  );
}
