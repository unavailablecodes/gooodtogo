'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string | number; label: string; disabled?: boolean }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[13px] font-medium text-[#1d1d1f] mb-2 opacity-80"
          >
            {label}
            {props.required && <span className="text-[#ff3b30] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-4 py-3.5 text-[15px]
              bg-white
              border-2 rounded-2xl
              appearance-none
              cursor-pointer
              transition-all duration-200
              focus:outline-none
              disabled:bg-[#f5f5f7] disabled:text-[#86868b]
              ${error
                ? 'border-[#ff3b30] focus:border-[#ff3b30] focus:ring-4 focus:ring-[#ff3b30]/10'
                : 'border-[#d2d2d7] hover:border-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10'
              }
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none w-5 h-5" />
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

Select.displayName = 'Select';

export { Select };
export type { SelectProps };
