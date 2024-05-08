type Props = {
  value: number | undefined;
  unit?: string;
  noUnit?: boolean;
  digits?: number;
};
export default function DisplayWithUnits({
  value,
  unit = 'kg-co2/kg',
  noUnit,
  digits = 1,
}: Props) {
  return (
    <div>
      <span className='font-semibold'>
        {value !== undefined
          ? value.toLocaleString(undefined, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
          })
          : '-'}
      </span>
      {noUnit || <span className='font-normal text-[10px] ml-1'>{unit}</span>}
    </div>
  );
}
