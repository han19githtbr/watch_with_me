// store/movieStore.ts
import { create } from 'zustand';
import type { Movie, MovieDetails } from '@/lib/types';

interface MovieState {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  /** Empty string means "no active search" (showing category rows). */
  lastQuery: string;
  searchMovies: (query: string) => Promise<void>;
  getMovieDetails: (id: string) => Promise<MovieDetails>;
  clearMovies: () => void;
}

export const useMovieStore = create<MovieState>((set) => ({
  movies: [],
  loading: false,
  error: null,
  lastQuery: '',

  searchMovies: async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      set({ movies: [], error: null, lastQuery: '' });
      return;
    }

    set({ loading: true, error: null, lastQuery: trimmed });
    try {
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(trimmed)}`);
      if (!response.ok) {
        throw new Error('Failed to search movies');
      }
      const data = await response.json();
      set({ movies: data.movies || [], loading: false });
    } catch {
      set({ error: 'Failed to search movies', loading: false, movies: [] });
    }
  },

  getMovieDetails: async (id: string) => {
    try {
      const response = await fetch(`/api/movies/${id}`);
      if (!response.ok) {
        throw new Error('Failed to get movie details');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting movie details:', error);
      throw error;
    }
  },

  clearMovies: () => {
    set({ movies: [], error: null, lastQuery: '' });
  },
}));