type Props = {
  h?: number;
};

export default function Divider({ h }: Props) {
  return (
    <div className='w-0 bg-gray' style={{ height: h && h * 4, width: '1px' }} />
  );
}
