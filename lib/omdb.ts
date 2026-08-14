// lib/omdb.ts
const API_KEY = process.env.OMD_API_KEY;
const BASE_URL = 'https://www.omdbapi.com';

interface OMDbMovie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
  imdbRating?: string;
  Plot?: string;
  Actors?: string;
  Director?: string;
  Genre?: string;
}

export async function searchMovies(query: string, page: number = 1) {
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

export async function getMovieDetails(id: string) {
  const response = await fetch(
    `${BASE_URL}/?apikey=${API_KEY}&i=${id}&plot=full`
  );
  const data = await response.json();
  
  if (data.Response === 'False') {
    return null;
  }

  return data;
}

export async function getPopularMovies() {
  // Search for popular movies using common search terms
  const popularSearches = ['avengers', 'star wars', 'harry potter', 'lord of the rings', 'inception', 'matrix', 'dark knight'];
  const randomSearch = popularSearches[Math.floor(Math.random() * popularSearches.length)];
  
  const results = await searchMovies(randomSearch);
  return results.movies.slice(0, 10);
}

export async function getMoviesByCategory(category: string) {
  const results = await searchMovies(category);
  return results.movies.slice(0, 10);
}