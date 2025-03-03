import { PlusCircle } from '@phosphor-icons/react';

export default function AddRowButton({
  disabled = false,
  onClick,
  hasBorder,
  buttonText = '部品を追加',
  className = '',
  wLength,
}: {
  disabled?: boolean;
  onClick: () => void;
  hasBorder: boolean;
  buttonText?: string;
  className?: string;
  wLength?: number;
}) {

  const parentLength: string = wLength ? `w-[${wLength}px]` : 'w-full';
  const childCalssName: string = wLength ? ' w-[1360px] sticky left-0' : '';

  return (
    <div
      className={
        hasBorder ? `border-t-primary border-t-[1px] pt-4 ${parentLength}` : `${parentLength} pt-4`
      }
    >
      <div
        className={
          'inline-flex items-center ' + className +
          (disabled ? 'cursor-not-allowed' : 'cursor-pointer') +
          childCalssName
        }
        onClick={disabled ? () => { } : onClick}
      >
        <PlusCircle size={24} className={disabled ? 'fill-gray' : ''} />
        <div
          className={
            'ml-2 mr-2 text-sm font-semibold ' +
            (disabled ? 'text-gray' : 'text-primary')
          }
        >
          {buttonText}
        </div>
      </div>
    </div>
  );
}
