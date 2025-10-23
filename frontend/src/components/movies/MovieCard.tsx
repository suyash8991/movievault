'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types/movie.types';

interface MovieCardProps {
  movie: Movie;
}

/**
 * MovieCard Component
 *
 * Displays a single movie in a card format with poster, title, and rating.
 */
export default function MovieCard({ movie }: MovieCardProps) {
  // Format the movie release date
  const formattedDate = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown release date';

  // Format rating to one decimal place and handle null values
  const rating = movie.voteAverage
    ? `${movie.voteAverage.toFixed(1)}/10`
    : 'Not rated';

  // Base URL for TMDB posters
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  // Placeholder for movies without posters - gray background with movie icon
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMHB4IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';

  // Image source with fallback
  const imageSrc = movie.posterPath
    ? `${imageBaseUrl}${movie.posterPath}`
    : placeholderImage;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
      <Link href={`/movies/${movie.id}`}>
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={imageSrc}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = placeholderImage;
            }}
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold line-clamp-2">{movie.title}</h3>
            <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm font-medium">
              {rating}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
          <p className="mt-2 text-sm line-clamp-3 text-gray-600">{movie.overview}</p>
        </div>
      </Link>
    </div>
  );
}