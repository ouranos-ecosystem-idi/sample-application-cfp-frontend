type Props = {
  className?: string;
};
export default function SkeletonColumn({ className }: Props) {
  return (
    <div className={`w-full h-full ${className}`}>
      <div className='skeleton w-full h-full relative bg-light-gray rounded ' />
    </div>
  );
}
