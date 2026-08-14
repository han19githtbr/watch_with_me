// store/movieStore.ts
import { create } from 'zustand';

interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
}

interface MovieState {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  searchMovies: (query: string) => Promise<void>;
  getMovieDetails: (id: string) => Promise<any>;
  clearMovies: () => void;
}

export const useMovieStore = create<MovieState>((set) => ({
  movies: [],
  loading: false,
  error: null,

  searchMovies: async (query: string) => {
    if (!query.trim()) {
      set({ movies: [], error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search movies');
      }
      const data = await response.json();
      set({ movies: data.movies || [], loading: false });
    } catch (error) {
      set({ error: 'Failed to search movies', loading: false });
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
    set({ movies: [], error: null });
  },
}));