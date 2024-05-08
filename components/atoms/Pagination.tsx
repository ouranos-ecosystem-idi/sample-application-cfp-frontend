import { CaretDoubleLeft } from '@phosphor-icons/react/dist/ssr/CaretDoubleLeft';
import { CaretLeft } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRight } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { Dispatch, SetStateAction } from 'react';
import { tv } from 'tailwind-variants';

const buttonStyle = tv({
  base: `btn btn-primary btn-outline rounded w-16 min-h-0 h-8 text-sm animate-none
    active:focus:scale-[0.97] active:hover:scale-[0.97] active:focus:animate-button-pop-slight
    active:hover:animate-button-pop-slight disabled:pointer-events-auto disabled:cursor-not-allowed
    disabled:border-primary disabled:hover:border-primary
   bg-white disabled:bg-white disabled:hover:bg-white
    fill-primary hover:fill-white disabled:fill-gray disabled:hover:fill-gray
    `,
});
const divStyle = tv({
  base: 'flex items-center justify-center text-xs font-semibold w-[140px] h-8 border border-primary bg-white',
});

type Props = {
  className?: string;
  next?: string;
  setNext: Dispatch<SetStateAction<string | undefined>>;
  history?: string[]; // historyがundefinedな状態＝呼び出し側で表示すべきページが決定していない状態
  setHistory: Dispatch<SetStateAction<string[] | undefined>>;
};
export default function Pagination({
  className = '',
  next,
  setNext,
  history,
  setHistory,
}: Props) {
  const currentPage = history ? history.length + 1 : undefined;
  const hasNextPage = history !== undefined && next !== undefined;
  function onClickStart() {
    setNext(undefined);
    setHistory([]);
  }
  function onClickNext() {
    if (history !== undefined && next !== undefined) {
      const _next = next;
      setNext(undefined);
      setHistory([...history, _next]);
    }
  }
  function onClickPrev() {
    if (history && history.length > 0) {
      setNext(undefined);
      setHistory(history.slice(0, -1));
    }
  }

  return (
    <div className={'flex ' + className}>
      <button
        className={buttonStyle()}
        onClick={onClickStart}
        disabled={currentPage === undefined || currentPage === 1}
      >
        <CaretDoubleLeft className='fill-inherit' size={24} />
      </button>
      <div className='join ml-2'>
        <button
          className={'join-item ' + buttonStyle()}
          onClick={onClickPrev}
          disabled={currentPage === undefined || currentPage === 1}
        >
          <CaretLeft className='fill-inherit' size={24} />
        </button>
        <div className={'join-item ' + divStyle()}>
          <div>{currentPage === undefined ? '' : `${currentPage}ページ`}</div>
        </div>
        <button
          className={'join-item ' + buttonStyle()}
          onClick={onClickNext}
          disabled={currentPage === undefined || !hasNextPage}
        >
          <CaretRight className='fill-inherit' size={24} />
        </button>
      </div>
    </div>
  );
}
