// lib/adminTypes.ts

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  favoritesCount: number;
  viewCount: number;
  searchCount: number;
  topGenre: string | null;
  totalSessions: number;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  lastSessionMs: number;
  avgSessionMs: number;
}

export interface AdminUserDetail {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
    favorites: string[];
  };
  access: {
    totalSessions: number;
    lastLoginAt: string | null;
    lastActiveAt: string | null;
    lastSessionMs: number;
    avgSessionMs: number;
  };
  accessHistory: {
    loginAt: string;
    lastActiveAt: string;
    durationMs: number;
    userAgent: string;
    ip: string;
  }[];
  topGenres: { value: string; count: number }[];
  topMovies: { movieId: string; title: string; poster: string; count: number }[];
  topSearches: { value: string; count: number }[];
  recentViews: {
    movieId: string;
    title: string;
    genre: string;
    poster: string;
    viewedAt: string;
  }[];
}
