// components/SearchBar.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useMovieStore } from '@/store/movieStore';

const MIN_CHARS = 2;
const DEBOUNCE_MS = 350;

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const { searchMovies, clearMovies, loading } = useMovieStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live search: fire automatically a moment after the person stops
  // typing, once they've entered enough letters to get a meaningful match.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length === 0) {
      clearMovies();
      return;
    }
    if (trimmed.length < MIN_CHARS) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchMovies(trimmed);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim()) {
      await searchMovies(query.trim());
    }
  };

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery('');
    clearMovies();
  };

  const isTooShort = query.trim().length > 0 && query.trim().length < MIN_CHARS;

  return (
    <div className="max-w-2xl mx-auto mb-2">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 sm:w-5 sm:h-5">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titles, people, genres..."
            aria-label="Search for movies"
            className="w-full p-3 sm:p-4 pl-10 sm:pl-12 pr-24 sm:pr-28 bg-gray-800/90 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-netflix-red transition-shadow"
          />
          {loading && (
            <span
              className="absolute right-[6.5rem] sm:right-[7.5rem] top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin"
              aria-hidden="true"
            />
          )}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-24 sm:right-28 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white px-2"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 netflix-button px-4 sm:px-6 text-sm sm:text-base disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </form>
      {isTooShort && (
        <p className="text-gray-500 text-xs mt-2 px-1">Keep typing — results appear after {MIN_CHARS} letters.</p>
      )}
    </div>
  );
}