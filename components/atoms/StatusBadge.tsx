export type StatusBadgeColors =
  | 'blue'
  | 'yellow'
  | 'red'
  | 'gray'
  | 'dark-gray';
type Size = 'small' | 'normal';

type Props = {
  size?: Size;
  color?: StatusBadgeColors;
  text: string;
};

function getClassName({
  size,
  color,
}: {
  size: Size;
  color: StatusBadgeColors;
}) {
  let className =
    'badge p-1 text-[10px] leading-[14px] font-semibold text-default-text';
  if (size === 'normal') {
    className += ' w-[72px]';
  } else if (size === 'small') {
    className += ' w-[64px]';
  }

  if (color === 'blue') {
    className += ' badge-info';
  } else if (color === 'yellow') {
    className += ' badge-warning';
  } else if (color === 'red') {
    className += ' badge-error text-white';
  } else if (color === 'gray') {
    className += ' border-transparent bg-done-light-gray text-done-gray';
  } else if (color === 'dark-gray') {
    className += ' border-transparent bg-dark-gray text-white';
  }
  return className;
}

export default function StatusBadge({
  size = 'normal',
  color = 'blue',
  text,
}: Props) {
  return <div className={getClassName({ size, color })}>{text}</div>;
}
