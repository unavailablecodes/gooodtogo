'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-[#1d1d1f] mb-2 opacity-80"
          >
            {label}
            {props.required && <span className="text-[#ff3b30] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-3.5 text-[15px]
              bg-white
              border-2 rounded-2xl
              placeholder:text-[#86868b]
              transition-all duration-200
              focus:outline-none
              disabled:bg-[#f5f5f7] disabled:text-[#86868b]
              ${leftIcon ? 'pl-12' : ''}
              ${rightIcon ? 'pr-12' : ''}
              ${error
                ? 'border-[#ff3b30] focus:border-[#ff3b30] focus:ring-4 focus:ring-[#ff3b30]/10'
                : 'border-[#d2d2d7] hover:border-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10'
              }
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-[13px] text-[#ff3b30]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-[13px] text-[#86868b]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
