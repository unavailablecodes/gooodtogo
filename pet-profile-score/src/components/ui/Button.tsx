'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function PawLoader({ size = 16 }: { size?: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[0.6rem]" style={{ animationDelay: '0ms' }}>🐾</span>
      <span className="text-[0.6rem] animate-paw-delay-1">🐾</span>
      <span className="text-[0.6rem] animate-paw-delay-2">🐾</span>
    </div>
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'px-5 py-2.5 text-[13px]',
      md: 'px-6 py-3 text-[14px]',
      lg: 'px-8 py-4 text-[15px]',
    };

    const variantStyles = {
      primary: 'bg-[#1d1d1f] text-white hover:bg-black active:scale-[0.98] shadow-sm',
      secondary: 'bg-white text-[#1d1d1f] border border-black/10 hover:border-black/20 active:scale-[0.98] shadow-sm',
      outline: 'bg-transparent text-[#0071e3] border border-[#0071e3]/30 hover:border-[#0071e3] active:scale-[0.98]',
      ghost: 'bg-transparent text-[#1d1d1f] hover:bg-black/5 active:scale-[0.98]',
      danger: 'bg-[#ff3b30] text-white hover:bg-[#e8352c] active:scale-[0.98] shadow-sm',
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-full
          transition-all duration-200 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <PawLoader />
        ) : leftIcon ? (
          <span className="opacity-80">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && (
          <span className="opacity-80">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
