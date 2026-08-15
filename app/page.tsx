// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMovieStore } from '@/store/movieStore';
import MovieCarousel from '@/components/MovieCarousel';
import SearchBar from '@/components/SearchBar';
import Navbar from '@/components/Navbar';
import Login from '@/components/Auth/Login';
import Link from 'next/link';
import Image from 'next/image';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      <div className="pt-16">
        {/* Hero Banner (hidden while a search is active) */}
        {heroMovie && !isSearching && (
          <div className="relative h-[46vh] sm:h-[56vh] md:h-[64vh] mb-8 overflow-hidden">
            {heroMovie.Poster && heroMovie.Poster !== 'N/A' && (
              // eslint-disable-next-line @next/next/no-img-element -- decorative, heavily blurred background; Image optimization isn't worth it here
              <img
                src={heroMovie.Poster}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-top scale-110 blur-2xl opacity-50"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-netflix-dark/30 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/10 to-transparent" />

            <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-end sm:items-center pb-8 sm:pb-0">
              <div className="flex items-end sm:items-center gap-4 sm:gap-8">
                {heroMovie.Poster && heroMovie.Poster !== 'N/A' && (
                  <Image
                    src={heroMovie.Poster}
                    alt={heroMovie.Title}
                    width={208}
                    height={312}
                    className="hidden sm:block w-40 md:w-52 h-auto rounded-lg shadow-2xl ring-1 ring-white/10"
                    priority
                  />
                )}
                <div className="max-w-xl">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4 line-clamp-2">
                    {heroMovie.Title}
                  </h1>
                  <p className="text-gray-300 text-sm sm:text-lg mb-4">{heroMovie.Year}</p>
                  <div className="flex gap-3">
                    <Link href={`/movie/${heroMovie.imdbID}`} className="netflix-button text-sm sm:text-base">
                      ▶ Watch details
                    </Link>
                    <Link href={`/movie/${heroMovie.imdbID}`} className="netflix-button-secondary text-sm sm:text-base">
                      ℹ More info
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`px-4 sm:px-6 ${!heroMovie || isSearching ? 'pt-8' : ''}`}>
          <SearchBar />
        </div>

        {isSearching ? (
          loading ? (
            <p className="text-center text-gray-400 px-4 pb-12">Searching…</p>
          ) : movies.length > 0 ? (
            <MovieCarousel title={`Results for "${lastQuery}"`} movies={movies} />
          ) : (
            <p className="text-center text-gray-400 px-4 pb-12">
              No results found for &ldquo;{lastQuery}&rdquo;.
            </p>
          )
        ) : categoriesLoading ? (
          <div className="px-4 sm:px-6 space-y-3 pb-12">
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
