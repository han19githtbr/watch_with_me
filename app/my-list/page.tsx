// app/my-list/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import MovieCard from '@/components/MovieCard';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function MyList() {
  const { user, isAuthenticated, loadFavorites } = useAuthStore();
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/';
      return;
    }

    const fetchFavorites = async () => {
      try {
        await loadFavorites();
        if (user && user.favorites.length > 0) {
          const moviePromises = user.favorites.map(async (id) => {
            const response = await fetch(`/api/movies/${id}`);
            return response.json();
          });
          const movies = await Promise.all(moviePromises);
          setFavoriteMovies(movies.filter(m => m !== null));
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-netflix-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold text-white mb-8">My List</h1>
        {loading ? (
          <div className="text-white text-center py-20">Loading your list...</div>
        ) : favoriteMovies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">Your list is empty</p>
            <Link href="/" className="netflix-button inline-block">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favoriteMovies.map((movie) => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}