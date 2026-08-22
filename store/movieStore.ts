// store/movieStore.ts
import { create } from 'zustand';
import type { Movie, MovieDetails } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';

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

export const useMovieStore = create<MovieState>((set, get) => ({
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

      // With live/debounced search, a slower earlier request can resolve
      // after a newer one. If the query has since moved on, drop this
      // response instead of overwriting fresher results.
      if (get().lastQuery !== trimmed) return;

      // OMDb's "s" search matches titles containing the term anywhere, but
      // for a live, type-as-you-go search the titles that actually *start*
      // with what the person typed are the most relevant match — surface
      // those first instead of leaving OMDb's default ordering as-is.
      const needle = trimmed.toLowerCase();
      const movies: Movie[] = [...(data.movies || [])].sort((a, b) => {
        const aStarts = a.Title.toLowerCase().startsWith(needle) ? 0 : 1;
        const bStarts = b.Title.toLowerCase().startsWith(needle) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.Title.localeCompare(b.Title);
      });

      set({ movies, loading: false });

      // Best-effort activity log for the admin panel's "most searched"
      // view. Only recorded for signed-in users and never awaited, so
      // it can't slow down or break the search itself.
      const { token, isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated && token) {
        fetch('/api/activity/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query: trimmed }),
        }).catch(() => {});
      }
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