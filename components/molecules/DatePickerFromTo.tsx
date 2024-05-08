import DatePickerWithStyle from '@/components/atoms/DatePickerWithStyle';

type Props = {
  fromDate: Date;
  fromOnChange: (date: Date) => void;
  fromDateMax: Date;
  toDate: Date;
  toOnChange: (date: Date) => void;
  toDateMax: Date;
};

export default function DatePickerFromTo({
  fromDate,
  fromOnChange,
  fromDateMax,
  toDate,
  toOnChange,
  toDateMax,
}: Props) {
  return (
    <div className='flex h-8 items-center font-semibold'>
      <div className='text-xs px-3'>期間</div>
      <DatePickerWithStyle
        selected={fromDate}
        onChange={fromOnChange}
        maxDate={fromDateMax}
        placeholderText='開始日'
      />
      <div className='text-xs px-1'>〜</div>
      <DatePickerWithStyle
        selected={toDate}
        onChange={toOnChange}
        maxDate={toDateMax}
        placeholderText='終了日'
      />
    </div>
  );
}
