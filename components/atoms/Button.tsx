import { ReactNode } from 'react';
import { tv } from 'tailwind-variants';
const button = tv({
  base: `btn rounded min-h-0 h-10 text-sm px-2 animate-none active:focus:scale-[0.97] active:hover:scale-[0.97]
    active:focus:animate-button-pop-slight active:hover:animate-button-pop-slight
    disabled:bg-gray disabled:border-none disabled:text-white disabled:pointer-events-auto disabled:cursor-not-allowed
    disabled:hover:text-white disabled:hover:bg-gray
  `,
  variants: {
    color: {
      primary: 'btn-primary text-white',
      secondary: '',
      error: 'btn-error text-white',
    },
    variant: {
      solid: '',
      outline: 'btn-outline',
      transparent:
        'bg-transparent hover:bg-transparent hover:opacity-70 border-none text-primary',
    },
    size: {
      default: 'w-40',
      tight: '',
    },
  },
});

type Props = {
  color?: 'primary' | 'secondary' | 'error';
  variant?: 'solid' | 'outline' | 'transparent';
  disabled?: boolean;
  size?: 'default' | 'tight';
  children: ReactNode;
};

export function Button({
  color,
  variant,
  size,
  className,
  disabled = false,
  children,
  ...props
}: Props & JSX.IntrinsicElements['button']) {
  return (
    <button
      className={button({
        color: color ?? 'primary',
        variant: variant ?? 'solid',
        size: size ?? 'default',
        class: className,
      })}
      disabled={disabled}
      onChange={disabled ? undefined : props.onChange}
      {...props}
    >
      {children}
    </button>
  );
}
