// components/MovieCard.tsx
'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import PosterImage from './PosterImage';
import { PlusIcon, CheckIcon } from './icons';
import type { Movie } from '@/lib/types';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const { user, addFavorite, removeFavorite } = useAuthStore();
  
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
        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-md bg-gray-800 shadow-md ring-1 ring-white/5 group-hover:ring-2 group-hover:ring-white/70 group-hover:shadow-2xl group-hover:shadow-black/80 transition-shadow duration-200">
          <PosterImage
            src={movie.Poster}
            alt={movie.Title}
            fill
            className="object-cover"
            sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1200px) 18vw, 180px"
          />
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
          aria-pressed={isFavorite}
          title={isFavorite ? 'Remove from My List' : 'Add to My List'}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center border transition-all sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 ${
            isFavorite
              ? 'bg-white border-white text-black'
              : 'bg-black/60 border-white/40 text-white hover:border-white'
          }`}
        >
          {isFavorite ? <CheckIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}