'use client';

import { useState } from 'react';

interface StarRatingProps {
  rating: number; // 0-10 scale
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

/**
 * StarRating Component
 *
 * Displays a 5-star rating (converts from 10-point scale).
 * Can be interactive or readonly.
 */
export default function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showValue = true
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Convert 10-point scale to 5-star scale
  const displayRating = hoverRating !== null ? hoverRating / 2 : rating / 2;

  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const handleStarClick = (starIndex: number) => {
    if (readonly || !onRatingChange) return;
    // Convert back to 10-point scale
    const newRating = starIndex * 2;
    onRatingChange(newRating);
  };

  const handleStarHover = (starIndex: number) => {
    if (readonly || !onRatingChange) return;
    // Convert to 10-point scale for hover
    setHoverRating(starIndex * 2);
  };

  const handleMouseLeave = () => {
    if (readonly || !onRatingChange) return;
    setHoverRating(null);
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= displayRating;
          const isHalfFilled = starIndex - 0.5 === displayRating;

          return (
            <button
              key={starIndex}
              type="button"
              className={`
                ${sizeClasses[size]}
                ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                transition-transform
                focus:outline-none
                focus:ring-2
                focus:ring-yellow-400
                rounded
              `}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
              disabled={readonly}
              aria-label={`Rate ${starIndex} stars`}
            >
              {isFilled ? (
                // Filled star
                <svg
                  className="text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>
              ) : isHalfFilled ? (
                // Half-filled star (for display only)
                <svg
                  className="text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <defs>
                    <linearGradient id={`half-${starIndex}`}>
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="rgb(229 231 235)" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#half-${starIndex})`}
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"
                  />
                </svg>
              ) : (
                // Empty star
                <svg
                  className="text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={`${textSizeClasses[size]} font-medium text-gray-700`}>
          {(hoverRating !== null ? hoverRating : rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
