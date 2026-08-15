// components/MovieCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import type { Movie } from '@/lib/types';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const { user, addFavorite, removeFavorite } = useAuthStore();
  // Derive favorite status from the store instead of local state, so it
  // stays correct after a refresh, on other cards, and on /my-list.
  const isFavorite = !!user?.favorites?.includes(movie.imdbID);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (isFavorite) {
        await removeFavorite(movie.imdbID);
      } else {
        await addFavorite(movie.imdbID);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="netflix-card relative group w-full">
      <Link href={`/movie/${movie.imdbID}`} className="block">
        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-md bg-gray-800 shadow-md">
          {movie.Poster && movie.Poster !== 'N/A' ? (
            <Image
              src={movie.Poster}
              alt={movie.Title}
              fill
              className="object-cover"
              sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1200px) 18vw, 180px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-center p-4 text-sm">{movie.Title}</span>
            </div>
          )}
          {/* Desktop hover overlay */}
          <div className="hidden sm:flex absolute inset-0 flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <h3 className="text-white font-semibold text-sm line-clamp-2">{movie.Title}</h3>
            <p className="text-gray-300 text-xs">{movie.Year}</p>
          </div>
        </div>
        {/* Always-visible caption for touch devices (no hover state) */}
        <div className="sm:hidden mt-1.5">
          <h3 className="text-white text-xs font-medium truncate">{movie.Title}</h3>
          <p className="text-gray-400 text-[11px]">{movie.Year}</p>
        </div>
      </Link>
      {user && (
        <button
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? 'Remove from My List' : 'Add to My List'}
          className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
        >
          <span className="text-lg">{isFavorite ? '❤️' : '🤍'}</span>
        </button>
      )}
    </div>
  );
}