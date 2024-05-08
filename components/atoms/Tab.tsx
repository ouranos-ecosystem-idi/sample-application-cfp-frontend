type Props = {
  tabs: string[];
  activeTabIndex: number;
  onSelect: (index: number) => void;
  width?: number;
  className?: string;
};
export default function Tab({
  tabs,
  activeTabIndex,
  onSelect,
  width = 56,
  className,
}: Props) {
  return (
    <div
      className={
        'tabs tabs-boxed relative inline-flex bg-white border border-gray gap-1 ' +
        className
      }
    >
      <div
        className='tab tab-active h-6 !rounded absolute z-10'
        style={{
          width: `${width}px`,
          transition: 'transform .18s ease-out',
          transform: `translateX(${activeTabIndex * (width + 4)}px)`,
        }}
      />
      {tabs.map((tab, i) => (
        <a
          key={tab + i}
          className={
            'tab h-6 text-xs leading-none !rounded p-0 z-20 ' +
            (activeTabIndex === i
              ? 'tab-active !text-white !bg-transparent'
              : 'text-default-text')
          }
          style={{ width: `${width}px`, transition: 'color .2s ease-in-out' }}
          onClick={() => onSelect(i)}
        >
          {tab}
        </a>
      ))}
    </div>
  );
}
