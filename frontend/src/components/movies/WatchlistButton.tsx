'use client';

import { useState, useEffect } from 'react';
import { watchlistService } from '@/services/watchlist.service';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface WatchlistButtonProps {
  movieId: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

/**
 * WatchlistButton Component
 *
 * A button that allows users to add/remove movies from their watchlist.
 * Shows different states for added, not added, and loading.
 */
export default function WatchlistButton({
  movieId,
  size = 'md',
  showText = true
}: WatchlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if movie is in watchlist on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkWatchlistStatus = async () => {
      try {
        const inWatchlist = await watchlistService.isInWatchlist(movieId);
        setIsInWatchlist(inWatchlist);
      } catch (err) {
        console.error('Error checking watchlist status:', err);
      }
    };

    checkWatchlistStatus();
  }, [movieId, isAuthenticated]);

  // Handle add/remove from watchlist
  const handleClick = async () => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/movies/${movieId}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(movieId);
        setIsInWatchlist(false);
      } else {
        await watchlistService.addToWatchlist(movieId);
        setIsInWatchlist(true);
      }
    } catch (err) {
      console.error('Error updating watchlist:', err);
      const error = err as {response?: {data?: {error?: string}}};
      setError(error.response?.data?.error || 'Failed to update watchlist');

      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Button styling
  const buttonClasses = `
    ${sizeClasses[size]}
    ${isInWatchlist
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white'}
    font-semibold
    rounded-lg
    transition
    duration-150
    ease-in-out
    flex
    items-center
    gap-2
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={buttonClasses}
        aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        {loading ? (
          <>
            <svg className={`${iconSizes[size]} animate-spin`} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {showText && <span>{isInWatchlist ? 'Removing...' : 'Adding...'}</span>}
          </>
        ) : (
          <>
            {isInWatchlist ? (
              <>
                <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                </svg>
                {showText && <span>In Watchlist</span>}
              </>
            ) : (
              <>
                <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {showText && <span>Add to Watchlist</span>}
              </>
            )}
          </>
        )}
      </button>

      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
