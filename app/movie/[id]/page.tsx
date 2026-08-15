// app/movie/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import Login from '@/components/Auth/Login';
import PosterImage from '@/components/PosterImage';
import type { MovieDetails } from '@/lib/types';

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, addFavorite, removeFavorite } = useAuthStore();

  const isFavorite = !!user?.favorites?.includes(id as string);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMovie = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/movies/${id}`);
        const data = await response.json();
        setMovie(response.ok ? data : null);
      } catch (error) {
        console.error('Error fetching movie:', error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovie();
    }
  }, [id, isAuthenticated]);

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleFavoriteToggle = async () => {
    if (!user) return;
    try {
      if (isFavorite) {
        await removeFavorite(id as string);
      } else {
        await addFavorite(id as string);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-dark">
        <Navbar />
        <div className="pt-16 flex items-center justify-center h-[60vh]">
          <div className="text-white animate-pulse">Loading…</div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-netflix-dark">
        <Navbar />
        <div className="pt-16 flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="text-white">Movie not found</div>
          <Link href="/" className="netflix-button">Back to home</Link>
        </div>
      </div>
    );
  }

  const hasPoster = !!movie.Poster && movie.Poster !== 'N/A';

  return (
    <div className="min-h-screen bg-netflix-dark">
      <Navbar />

      {/* Backdrop hero, mirroring the look of the Home banner so a title's
          detail page feels like part of the same product, not a bare form. */}
      <div className="relative h-[38vh] sm:h-[46vh] overflow-hidden bg-netflix-dark">
        {hasPoster && (
          // eslint-disable-next-line @next/next/no-img-element -- decorative, heavily blurred background; a broken image here just falls back to the gradient beneath it
          <img
            src={movie.Poster}
            alt=""
            aria-hidden="true"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="absolute inset-0 w-full h-full object-cover object-top scale-110 blur-2xl opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-netflix-dark/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        <div className="absolute top-20 left-4 sm:left-6 lg:left-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-gray-200 hover:text-white transition-colors text-sm sm:text-base">
            <span aria-hidden="true">←</span> Back to home
          </Link>
        </div>
      </div>

      <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-12 pb-12 -mt-24 sm:-mt-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
          <div className="md:col-span-1 max-w-[240px] mx-auto md:mx-0 w-full">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
              <PosterImage
                src={movie.Poster}
                alt={movie.Title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 60vw, 240px"
              />
            </div>
            {user && (
              <button onClick={handleFavoriteToggle} className="w-full netflix-button mt-4">
                {isFavorite ? 'Remove from My List ❤️' : 'Add to My List 🤍'}
              </button>
            )}
          </div>
          <div className="md:col-span-2 pt-2">
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-white mb-3 sm:mb-4 tracking-wide leading-[0.95]">
              {movie.Title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-sm sm:text-base">
              <span className="text-gray-300">{movie.Year}</span>
              {movie.Runtime && movie.Runtime !== 'N/A' && (
                <span className="text-gray-300">{movie.Runtime}</span>
              )}
              {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                  ⭐ {movie.imdbRating}/10
                </span>
              )}
            </div>
            {movie.Genre && movie.Genre !== 'N/A' && (
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {movie.Genre.split(',').map((genre: string) => (
                  <span
                    key={genre}
                    className="bg-white/10 text-white px-3 py-1 rounded-full text-xs sm:text-sm"
                  >
                    {genre.trim()}
                  </span>
                ))}
              </div>
            )}
            {movie.Plot && movie.Plot !== 'N/A' && (
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-2">Synopsis</h2>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl">{movie.Plot}</p>
              </div>
            )}
            {movie.Director && movie.Director !== 'N/A' && (
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-bold text-white">Director</h3>
                <p className="text-gray-300 text-sm sm:text-base">{movie.Director}</p>
              </div>
            )}
            {movie.Actors && movie.Actors !== 'N/A' && (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Cast</h3>
                <p className="text-gray-300 text-sm sm:text-base">{movie.Actors}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
