import { Check } from '@phosphor-icons/react/dist/ssr';

type Props = {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  disabled?: boolean;
};
export default function CheckBox({
  checked,
  setChecked,
  disabled = false,
}: Props) {
  return (
    <div
      className={
        'w-5 h-5 border rounded ' +
        (checked ? 'flex items-center justify-center ' : '') +
        (disabled
          ? 'border-neutral cursor-not-allowed '
          : 'border-primary cursor-pointer ') +
        (
          disabled ? 'bg-gray ' : (
            checked ? 'bg-primary ' : 'bg-white '
          )
        )
      }
      onClick={disabled ? () => { } : () => setChecked(!checked)}
    >
      {checked && <Check className='fill-white' size='16' />}
    </div>
  );
}
