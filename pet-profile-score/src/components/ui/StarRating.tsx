'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showLabel = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const labels = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform
            `}
          >
            <Star
              className={`
                ${sizeStyles[size]}
                ${rating <= displayValue
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
                }
              `}
            />
          </button>
        ))}
      </div>
      {showLabel && value > 0 && (
        <span className="ml-2 text-sm text-gray-600">{labels[value]}</span>
      )}
    </div>
  );
}
