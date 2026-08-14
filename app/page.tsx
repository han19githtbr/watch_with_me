// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMovieStore } from '@/store/movieStore';
import MovieCarousel from '@/components/MovieCarousel';
import SearchBar from '@/components/SearchBar';
import Navbar from '@/components/Navbar';
import Login from '@/components/Auth/Login';

export default function Home() {
  const { isAuthenticated, user, loadFavorites } = useAuthStore();
  const { searchMovies, movies, loading } = useMovieStore();
  const [popularMovies, setPopularMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [dramaMovies, setDramaMovies] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Load initial movies
    const loadMovies = async () => {
      const popular = await fetch('/api/movies/search?q=action&page=1').then(r => r.json());
      const action = await fetch('/api/movies/search?q=avengers&page=1').then(r => r.json());
      const comedy = await fetch('/api/movies/search?q=comedy&page=1').then(r => r.json());
      const drama = await fetch('/api/movies/search?q=drama&page=1').then(r => r.json());

      setPopularMovies(popular.movies || []);
      setActionMovies(action.movies || []);
      setComedyMovies(comedy.movies || []);
      setDramaMovies(drama.movies || []);
    };

    if (isAuthenticated) {
      loadMovies();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login />;
  }

  const displayMovies = movies.length > 0 ? movies : popularMovies;

  return (
    <div className="min-h-screen bg-netflix-dark">
      <Navbar />
      
      {/* Hero Banner */}
      {displayMovies.length > 0 && (
        <div className="relative h-[60vh] mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10" />
          <img
            src={displayMovies[0]?.Poster || '/placeholder-banner.jpg'}
            alt={displayMovies[0]?.Title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-10 left-10 z-20">
            <h1 className="text-5xl font-bold text-white mb-4">{displayMovies[0]?.Title}</h1>
            <p className="text-gray-300 text-lg max-w-md">{displayMovies[0]?.Year}</p>
          </div>
        </div>
      )}

      <div className="px-4">
        <SearchBar />
      </div>

      {movies.length > 0 ? (
        <MovieCarousel title="Search Results" movies={movies} />
      ) : (
        <>
          <MovieCarousel title="Popular" movies={popularMovies} />
          <MovieCarousel title="Action" movies={actionMovies} />
          <MovieCarousel title="Comedy" movies={comedyMovies} />
          <MovieCarousel title="Drama" movies={dramaMovies} />
        </>
      )}
    </div>
  );
}
