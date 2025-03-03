import { isEmpty } from '@/lib/utils';
import {
  ChangeEventHandler,
  ComponentProps,
  FocusEvent,
  HTMLInputTypeAttribute,
  memo,
} from 'react';
import { tv } from 'tailwind-variants';

const inputTextBoxTv = tv({
  base: 'input input-bordered w-full px-3 font-semibold border-neutral rounded h-11 text-xs focus:outline-none',
  variants: {
    align: {
      right: 'text-right',
    },
    background: {
      white: 'bg-white',
      transparent: 'bg-transparent',
    },
    disabled: {
      true: 'cursor-not-allowed',
    },
    error: {
      true: 'border-error focus:border-error',
      false: 'focus:border-neutral',
    },
    defaultVariants: {
      error: false,
    },
  },
});

type Props = {
  className?: string;
  background?: 'white' | 'transparent';
  disabled?: boolean;
  type?: HTMLInputTypeAttribute;
  align?: 'right';
  error?: string;
  placeholder?: string;
};

function _InputTextBox({
  className,
  background = 'white',
  disabled = false,
  type,
  align,
  error,
  placeholder,
  ...others
}: ComponentProps<'input'> & Props) {
  const handleBlur = (e: FocusEvent<HTMLInputElement, Element>) => {
    // 文字列の両端から空白を削除
    e.target.value = e.target.value.trim();

    if (type === 'number') {
      e.target.value = e.target.value.replace(/\.$/, ''); // 末尾の小数点を削除
    }

    // コンポーネントに渡されたイベントハンドラを呼ぶ
    if (others.onChange !== undefined) others.onChange(e); //値を書き換えるためonChangeも実行
    if (others.onBlur !== undefined) others.onBlur(e);
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (type === 'number') {
      // 数値以外が入力された場合イベントハンドラを呼ばずにreturn
      if (!e.target.value.match(/(^$)|(^([1-9]\d*|0)(\.\d*)?$)/)) return;
    }
    // コンポーネントに渡されたイベントハンドラを呼ぶ
    if (others.onChange !== undefined) others.onChange(e);
  };

  return (
    <div className='w-full relative'>
      <input
        className={
          inputTextBoxTv({
            align,
            disabled,
            background,
            error: !isEmpty(error),
          }) +
          ' placeholder-neutral ' +
          className
        }
        readOnly={disabled}
        // input type=numberの場合ブラウザ独自のUIを出さないようtextに上書き
        type={type === 'number' ? 'text' : type}
        placeholder={placeholder}
        {...others}
        onBlur={handleBlur}
        onChange={handleChange}
      />
      {!isEmpty(error) && (
        <div className='absolute text-[10px] text-error'>{error}</div>
      )}
    </div>
  );
}

const InputTextBox = memo(_InputTextBox);
export default InputTextBox;
