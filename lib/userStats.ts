// lib/userStats.ts
// Pure helpers that turn a user document's raw accessLogs / viewHistory /
// searchHistory arrays into the summarized shapes the admin UI renders.
// Kept framework-free so they're easy to unit test and reuse between the
// list endpoint (lightweight summary) and the detail endpoint (full
// breakdown).

interface AccessLog {
  loginAt: Date | string;
  lastActiveAt: Date | string;
  userAgent?: string;
  ip?: string;
}

interface ViewEntry {
  movieId: string;
  title?: string;
  genre?: string;
  poster?: string;
  viewedAt: Date | string;
}

interface SearchEntry {
  query: string;
  searchedAt: Date | string;
}

function sessionDurationMs(log: AccessLog): number {
  const start = new Date(log.loginAt).getTime();
  const end = new Date(log.lastActiveAt).getTime();
  return Math.max(0, end - start);
}

/** Tallies occurrences of a key (genre, movie title, search term...) and returns the top N, most-frequent first. */
function topCounts(items: string[], limit: number): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = item.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Splits an OMDb-style "Action, Adventure, Sci-Fi" genre string into individual genres. */
function splitGenres(genre: string | undefined): string[] {
  if (!genre) return [];
  return genre.split(',').map((g) => g.trim()).filter(Boolean);
}

export function summarizeAccess(accessLogs: AccessLog[]) {
  const sorted = [...accessLogs].sort(
    (a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime()
  );
  const last = sorted[0] || null;
  const durations = accessLogs.map(sessionDurationMs);
  const avgSessionMs = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  return {
    totalSessions: accessLogs.length,
    lastLoginAt: last ? last.loginAt : null,
    lastActiveAt: last ? last.lastActiveAt : null,
    lastSessionMs: last ? sessionDurationMs(last) : 0,
    avgSessionMs,
  };
}

export function summarizeGenres(viewHistory: ViewEntry[], limit = 6) {
  const genres = viewHistory.flatMap((v) => splitGenres(v.genre));
  return topCounts(genres, limit);
}

export function summarizeTopMovies(viewHistory: ViewEntry[], limit = 6) {
  const counts = new Map<string, { title: string; poster: string; count: number }>();
  for (const v of viewHistory) {
    if (!v.movieId) continue;
    const existing = counts.get(v.movieId);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(v.movieId, { title: v.title || v.movieId, poster: v.poster || '', count: 1 });
    }
  }
  return Array.from(counts.entries())
    .map(([movieId, data]) => ({ movieId, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function summarizeTopSearches(searchHistory: SearchEntry[], limit = 8) {
  return topCounts(
    searchHistory.map((s) => s.query),
    limit
  );
}

export function buildAccessHistory(accessLogs: AccessLog[]) {
  return [...accessLogs]
    .sort((a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime())
    .map((log) => ({
      loginAt: log.loginAt,
      lastActiveAt: log.lastActiveAt,
      durationMs: sessionDurationMs(log),
      userAgent: log.userAgent || '',
      ip: log.ip || '',
    }));
}
