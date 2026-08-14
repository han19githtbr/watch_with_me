// app/movie/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user, addFavorite, removeFavorite } = useAuthStore();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`/api/movies/${id}`);
        const data = await response.json();
        setMovie(data);
        if (user) {
          setIsFavorite(user.favorites?.includes(id as string) || false);
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovie();
    }
  }, [id, user]);

  const handleFavoriteToggle = async () => {
    if (!user) return;
    try {
      if (isFavorite) {
        await removeFavorite(id as string);
        setIsFavorite(false);
      } else {
        await addFavorite(id as string);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-netflix-dark flex items-center justify-center">
        <div className="text-white">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="text-white hover:text-netflix-red mb-4 inline-block">
          ← Back to home
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="relative aspect-[2/3]">
              {movie.Poster && movie.Poster !== 'N/A' ? (
                <Image
                  src={movie.Poster}
                  alt={movie.Title}
                  fill
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No poster available</span>
                </div>
              )}
            </div>
            {user && (
              <button
                onClick={handleFavoriteToggle}
                className="w-full netflix-button mt-4"
              >
                {isFavorite ? 'Remove from My List ❤️' : 'Add to My List 🤍'}
              </button>
            )}
          </div>
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-4">{movie.Title}</h1>
            <div className="flex flex-wrap gap-4 mb-4">
              <span className="text-gray-300">{movie.Year}</span>
              {movie.Runtime && (
                <span className="text-gray-300">{movie.Runtime}</span>
              )}
              {movie.imdbRating && (
                <span className="text-yellow-400">⭐ {movie.imdbRating}/10</span>
              )}
            </div>
            {movie.Genre && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.Genre.split(',').map((genre: string) => (
                  <span
                    key={genre}
                    className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {genre.trim()}
                  </span>
                ))}
              </div>
            )}
            {movie.Plot && (
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">Synopsis</h2>
                <p className="text-gray-300">{movie.Plot}</p>
              </div>
            )}
            {movie.Director && (
              <div className="mb-2">
                <h3 className="text-lg font-bold text-white">Director</h3>
                <p className="text-gray-300">{movie.Director}</p>
              </div>
            )}
            {movie.Actors && (
              <div>
                <h3 className="text-lg font-bold text-white">Cast</h3>
                <p className="text-gray-300">{movie.Actors}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}