// lib/omdb.ts
import type { Movie, MovieDetails } from './types';

const API_KEY = process.env.OMDB_API_KEY;
const BASE_URL = 'https://www.omdbapi.com';

if (!API_KEY) {
  // Fails loudly at request time instead of silently returning
  // "movie not found" for every single search.
  console.warn(
    'OMDB_API_KEY is not set. Add it to .env.local (see .env.example).'
  );
}

export async function searchMovies(
  query: string,
  page: number = 1
): Promise<{ movies: Movie[]; totalResults: number }> {
  const response = await fetch(
    `${BASE_URL}/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${page}&type=movie`
  );
  const data = await response.json();

  if (data.Response === 'False') {
    return { movies: [], totalResults: 0 };
  }

  return {
    movies: data.Search || [],
    totalResults: parseInt(data.totalResults) || 0,
  };
}

export async function getMovieDetails(id: string): Promise<MovieDetails | null> {
  const response = await fetch(
    `${BASE_URL}/?apikey=${API_KEY}&i=${id}&plot=full`
  );
  const data = await response.json();

  if (data.Response === 'False') {
    return null;
  }

  return data;
}