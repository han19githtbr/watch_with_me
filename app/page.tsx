// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMovieStore } from '@/store/movieStore';
import MovieCarousel from '@/components/MovieCarousel';
import SearchBar from '@/components/SearchBar';
import Navbar from '@/components/Navbar';
import Login from '@/components/Auth/Login';
import PosterImage from '@/components/PosterImage';
import Link from 'next/link';
import type { Movie } from '@/lib/types';

// OMDb has no "browse by genre" endpoint, so each category row is backed
// by a representative search term rather than a true genre filter.
const CATEGORIES: { title: string; query: string }[] = [
  { title: 'Popular', query: 'avengers' },
  { title: 'Action', query: 'batman' },
  { title: 'Comedy', query: 'friends' },
  { title: 'Drama', query: 'godfather' },
];

export default function Home() {
  const { isAuthenticated, user, loadFavorites } = useAuthStore();
  const { movies, loading, lastQuery } = useMovieStore();
  const [categoryMovies, setCategoryMovies] = useState<Movie[][]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const isSearching = lastQuery !== '';

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
    }
    
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const loadCategories = async () => {
      setCategoriesLoading(true);
      const results = await Promise.all(
        CATEGORIES.map((c) =>
          fetch(`/api/movies/search?q=${encodeURIComponent(c.query)}&page=1`)
            .then((r) => r.json())
            .then((d) => d.movies || [])
            .catch(() => [])
        )
      );
      if (!cancelled) {
        setCategoryMovies(results);
        setCategoriesLoading(false);
      }
    };

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login />;
  }

  const heroMovie: Movie | undefined = categoryMovies[0]?.[0];

  return (
    <div className="min-h-screen bg-netflix-dark">
      <Navbar />

      <div className={heroMovie && !isSearching ? '' : 'pt-16'}>
        
        {heroMovie && !isSearching && (
          <div className="relative h-[62vh] sm:h-[75vh] md:h-[85vh] mb-6 sm:mb-10 overflow-hidden bg-netflix-dark">
            {heroMovie.Poster && heroMovie.Poster !== 'N/A' && (
              
              <img
                src={heroMovie.Poster}
                alt=""
                aria-hidden="true"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="absolute inset-0 w-full h-full object-cover object-top scale-110 blur-2xl opacity-60"
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-transparent to-black/20" />

            <div className="relative z-10 h-full max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-12 flex items-end pb-10 sm:pb-16">
              <div className="flex items-end gap-5 sm:gap-8 w-full">
                <div className="relative hidden sm:block w-40 md:w-56 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 shrink-0">
                  <PosterImage
                    src={heroMovie.Poster}
                    alt={heroMovie.Title}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
                <div className="max-w-xl">
                  <span className="inline-block bg-netflix-red text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase px-2 py-1 rounded mb-3 sm:mb-4">
                    Featured
                  </span>
                  <h1 className="font-display text-4xl sm:text-6xl md:text-7xl text-white mb-2 sm:mb-4 leading-[0.95] line-clamp-2 [text-shadow:0_2px_16px_rgba(0,0,0,0.6)]">
                    {heroMovie.Title}
                  </h1>
                  <p className="text-gray-300 text-sm sm:text-lg mb-5 sm:mb-6">{heroMovie.Year}</p>
                  <div className="flex gap-3">
                    <Link href={`/movie/${heroMovie.imdbID}`} className="netflix-button-play text-sm sm:text-base">
                      <span aria-hidden="true">▶</span> Play
                    </Link>
                    <Link href={`/movie/${heroMovie.imdbID}`} className="netflix-button-secondary text-sm sm:text-base">
                      <span aria-hidden="true">ⓘ</span> More Info
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`px-4 sm:px-6 lg:px-12 ${!heroMovie || isSearching ? 'pt-4' : '-mt-4 sm:-mt-8 relative z-10'}`}>
          <SearchBar />
        </div>

        {isSearching ? (
          loading && movies.length === 0 ? (
            <p className="text-center text-gray-400 px-4 pb-12">Searching…</p>
          ) : movies.length > 0 ? (
            <MovieCarousel title={`Results for "${lastQuery}"`} movies={movies} />
          ) : (
            <p className="text-center text-gray-400 px-4 pb-12">
              No results found for &ldquo;{lastQuery}&rdquo;.
            </p>
          )
        ) : categoriesLoading ? (
          <div className="px-4 sm:px-6 lg:px-12 space-y-3 pb-12">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-6 w-40 bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          CATEGORIES.map((c, i) => (
            <MovieCarousel key={c.title} title={c.title} movies={categoryMovies[i] || []} />
          ))
        )}
      </div>
    </div>
  );
}
