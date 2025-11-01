'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { movieService } from '@/services/movie.service';
import { MovieDetails } from '@/types/movie.types';
import SimilarMovies from '@/components/movies/SimilarMovies';
import WatchlistButton from '@/components/movies/WatchlistButton';
import RatingSection from '@/components/movies/RatingSection';

/**
 * Movie Details Page
 *
 * Displays detailed information about a specific movie.
 * Accessible via /movies/:id
 */
export default function MovieDetailsPage() {
  const params = useParams();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch movie details when component mounts
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId) return;

      setLoading(true);
      setError(null);

      try {
        const id = parseInt(movieId, 10);
        if (isNaN(id)) {
          throw new Error('Invalid movie ID');
        }

        const movieData = await movieService.getMovieById(id);
        setMovie(movieData);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  // Handle loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 aspect-[2/3] bg-gray-200 rounded-lg"></div>
              <div className="w-full md:w-2/3">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error || 'Movie not found'}</p>
          </div>
          <div className="mt-4">
            <Link
              href="/movies/search"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              &larr; Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format release date
  const formattedDate = movie.releaseDate ?
    new Date(movie.releaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Unknown';

  // Format runtime
  const formatRuntime = (minutes: number | undefined) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format budget/revenue
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine image path for poster
  const imageSrc = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : '/images/movie-placeholder.png';

  // Determine backdrop image if available
  const backdropSrc = movie.backdropPath
    ? `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Backdrop image (if available) */}
        {backdropSrc && (
          <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8">
            <Image
              src={backdropSrc}
              alt={`${movie.title} backdrop`}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-70"></div>
          </div>
        )}

        {/* Back to search button */}
        <div className="mb-6">
          <Link
            href="/movies/search"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            &larr; Back to Search
          </Link>
        </div>

        {/* Movie details */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Movie poster */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src={imageSrc}
                alt={`${movie.title} poster`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                onError={(e) => {
                  // Fallback for broken images
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite callback
                  target.src = '/images/movie-placeholder.png';
                }}
              />
            </div>
          </div>

          {/* Movie info */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>

            {movie.tagline && (
              <p className="text-gray-600 italic mb-4">{movie.tagline}</p>
            )}

            {/* Movie meta info */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-gray-600">
              <div>Released: {formattedDate}</div>
              {movie.runtime && <div>Runtime: {formatRuntime(movie.runtime)}</div>}
              {movie.voteAverage > 0 && (
                <div className="flex items-center">
                  Rating:
                  <span className="ml-1 flex items-center">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                    </svg>
                    {movie.voteAverage.toFixed(1)}
                    {movie.voteCount && <span className="text-xs ml-1">({movie.voteCount} votes)</span>}
                  </span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map(genre => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Watchlist Button */}
            <div className="mb-6">
              <WatchlistButton movieId={movie.id} size="lg" />
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                {movie.overview || 'No overview available.'}
              </p>
            </div>

            {/* Additional details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Details</h3>
                <dl className="space-y-1">
                  <div className="flex">
                    <dt className="w-24 text-gray-500">Budget:</dt>
                    <dd>{formatCurrency(movie.budget)}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500">Revenue:</dt>
                    <dd>{formatCurrency(movie.revenue)}</dd>
                  </div>
                </dl>
              </div>

              {/* Production companies */}
              {movie.productionCompanies && movie.productionCompanies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Production</h3>
                  <ul className="space-y-1">
                    {movie.productionCompanies.map(company => (
                      <li key={company.id}>{company.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Ratings & Reviews</h2>
          <RatingSection movieId={movie.id} />
        </div>

        {/* Similar Movies Section */}
        <SimilarMovies movieId={parseInt(movieId, 10)} limit={8} />
      </div>
    </div>
  );
}