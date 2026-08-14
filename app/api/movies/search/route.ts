// app/api/movies/search/route.ts
import { NextResponse } from 'next/server';
import { searchMovies } from '@/lib/omdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const page = searchParams.get('page') || '1';

  if (!query) {
    return NextResponse.json(
      { error: 'Search query required' },
      { status: 400 }
    );
  }

  try {
    const results = await searchMovies(query, parseInt(page));
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search movies' },
      { status: 500 }
    );
  }
}