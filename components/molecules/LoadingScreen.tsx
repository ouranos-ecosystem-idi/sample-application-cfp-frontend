type Props = {
  isOpen: boolean;
};
export default function LoadingScreen({ isOpen }: Props) {
  return isOpen ? (
    <div className='fixed inset-0 w-screen h-screen bg-dull-white bg-opacity-90 flex items-center justify-center z-50'>
      <div className='flex flex-col items-center justify-center max-h-screen overflow-y-auto overflow-x-hidden default-text'>
        <span className='flex justify-center text-2xl font-semibold mb-3'>
          処理中のため、しばらくお待ちください。
        </span>
        <div className='loading loading-dots loading-lg' />
      </div>
    </div>
  ) : (
    <></>
  );
}
