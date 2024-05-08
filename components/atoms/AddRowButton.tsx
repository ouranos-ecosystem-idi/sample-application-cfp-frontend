import { PlusCircle } from '@phosphor-icons/react';

export default function AddRowButton({
  disabled = false,
  onClick,
  hasBorder,
  buttonText = '部品を追加',
}: {
  disabled?: boolean;
  onClick: () => void;
  hasBorder: boolean;
  buttonText?: string;
}) {
  return (
    <div
      className={
        hasBorder ? 'w-full border-t-primary border-t-[1px] pt-4' : 'pt-5'
      }
    >
      <div
        className={
          'inline-flex items-center ' +
          (disabled ? 'cursor-not-allowed' : 'cursor-pointer')
        }
        onClick={disabled ? () => { } : onClick}
      >
        <PlusCircle size={24} className={disabled ? 'fill-gray' : ''} />
        <div
          className={
            'ml-2 text-sm font-semibold ' +
            (disabled ? 'text-gray' : 'text-primary')
          }
        >
          {buttonText}
        </div>
      </div>
    </div>
  );
}
