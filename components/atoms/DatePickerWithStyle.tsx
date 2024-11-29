import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type Props = {
  selected: Date | undefined;
  onChange: (date: Date) => void;
  maxDate?: Date;
  placeholderText?: string;
};

export default function DatePickerWithStyle({
  selected,
  onChange,
  maxDate,
  placeholderText,
}: Props) {
  return (
    <DatePicker
      className='w-[100px] p-2 text-xs border border-gray rounded'
      dateFormat='yyyy/MM/dd'
      selected={selected}
      onChange={onChange}
      maxDate={maxDate}
      placeholderText={placeholderText}
    />
  );
}
