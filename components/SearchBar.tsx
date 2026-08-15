// components/SearchBar.tsx
'use client';

import { useState } from 'react';
import { useMovieStore } from '@/store/movieStore';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const { searchMovies, clearMovies, loading } = useMovieStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await searchMovies(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    clearMovies();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies..."
          className="w-full p-3 sm:p-4 pr-24 sm:pr-28 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-netflix-red"
        />
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
          {loading ? '...' : 'Search'}
        </button>
      </div>
    </form>
  );
}