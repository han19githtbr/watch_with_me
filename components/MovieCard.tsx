// components/MovieCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

interface MovieCardProps {
  movie: {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
  };
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { user, addFavorite, removeFavorite } = useAuthStore();

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (isFavorite) {
        await removeFavorite(movie.imdbID);
        setIsFavorite(false);
      } else {
        await addFavorite(movie.imdbID);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="netflix-card relative group">
      <Link href={`/movie/${movie.imdbID}`}>
        <div className="relative w-full aspect-[2/3]">
          {movie.Poster && movie.Poster !== 'N/A' ? (
            <Image
              src={movie.Poster}
              alt={movie.Title}
              fill
              className="object-cover rounded"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
              <span className="text-gray-400 text-center p-4">{movie.Title}</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <h3 className="text-white font-bold text-sm truncate">{movie.Title}</h3>
          <p className="text-gray-300 text-xs">{movie.Year}</p>
        </div>
      </Link>
      {user && (
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <span className="text-xl">{isFavorite ? '❤️' : '🤍'}</span>
        </button>
      )}
    </div>
  );
}