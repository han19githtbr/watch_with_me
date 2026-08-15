// app/api/movies/[id]/route.ts
import { NextResponse } from 'next/server';
import { getMovieDetails } from '@/lib/omdb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← Adicionar Promise
) {
  try {
    const { id } = await params;  // ← Aguardar params
    const movie = await getMovieDetails(id);
    
    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(movie);
  } catch (error) {
    console.error('Movie details error:', error);
    return NextResponse.json(
      { error: 'Failed to get movie details' },
      { status: 500 }
    );
  }
}