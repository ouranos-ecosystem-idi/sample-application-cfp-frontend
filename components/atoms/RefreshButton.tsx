import { ArrowsCounterClockwise } from '@phosphor-icons/react/dist/ssr/ArrowsCounterClockwise';

type Props = {
  onClick: () => void;
  className?: string;
};
export default function RefreshButton({ onClick, className = '' }: Props) {
  return (
    <div onClick={onClick}>
      <ArrowsCounterClockwise
        size={36}
        weight='bold'
        className={`fill-primary cursor-pointer ${className}`}
      />
    </div>
  );
}
