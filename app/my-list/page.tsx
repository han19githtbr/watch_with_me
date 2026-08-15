// app/my-list/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import MovieCard from '@/components/MovieCard';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import type { MovieDetails } from '@/lib/types';

export default function MyListPage() {
  const router = useRouter();
  const { isAuthenticated, loadFavorites } = useAuthStore();
  const [favoriteMovies, setFavoriteMovies] = useState<MovieDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        await loadFavorites();
        const { user: freshUser } = useAuthStore.getState();
        const favorites = freshUser?.favorites || [];

        if (favorites.length > 0) {
          const results = await Promise.all(
            favorites.map((movieId) =>
              fetch(`/api/movies/${movieId}`)
                .then((r) => (r.ok ? r.json() : null))
                .catch(() => null)
            )
          );
          setFavoriteMovies(results.filter((m): m is MovieDetails => m !== null));
        } else {
          setFavoriteMovies([]);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-netflix-dark">
      <Navbar />
      <div className="pt-24 max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-12 pb-12">
        <h1 className="font-display text-3xl sm:text-4xl text-white mb-6 sm:mb-8 tracking-wide">My List</h1>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800 rounded-md animate-pulse" />
            ))}
          </div>
        ) : favoriteMovies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg sm:text-xl mb-4">Your list is empty</p>
            <Link href="/" className="netflix-button inline-block">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {favoriteMovies.map((movie) => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}