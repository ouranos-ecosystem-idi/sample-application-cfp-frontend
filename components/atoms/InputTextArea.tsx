import { isEmpty } from '@/lib/utils';
import { FocusEvent, ComponentProps } from 'react';
import { tv } from 'tailwind-variants';

const inputTextArea = tv({
  base: 'textarea textarea-bordered block w-full border-neutral disabled:border-neutral rounded text-xs focus:outline-none resize-none bg-white disabled:bg-[#F6F6F6]',
  variants: {
    error: {
      true: 'border-error',
    },
  },
});

type Props = {
  className?: string;
  error?: string;
};

export default function InputTextArea({
  className = '',
  error,
  ...others
}: ComponentProps<'textarea'> & Props) {
  const handleBlur = (e: FocusEvent<HTMLTextAreaElement, Element>) => {
    // 文字列の両端から空白を削除
    e.target.value = e.target.value.trim();

    // コンポーネントに渡されたイベントハンドラを呼ぶ
    if (others.onChange !== undefined) others.onChange(e); //値を書き換えるためonChangeも実行
    if (others.onBlur !== undefined) others.onBlur(e);
  };

  return (
    <div className='w-full'>
      <textarea
        className={
          inputTextArea({
            error: !isEmpty(error),
          }) +
          ' ' +
          className
        }
        {...others}
        onBlur={handleBlur}
      />
      {!isEmpty(error) && (
        <div className='absolute text-[10px] text-error'>{error}</div>
      )}
    </div>
  );
}
