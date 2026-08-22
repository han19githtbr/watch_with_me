// app/api/activity/search/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

const MAX_ENTRIES = 300;

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { query } = await request.json();
    const trimmed = (query || '').trim();
    if (!trimmed) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.searchHistory = user.searchHistory || [];
    user.searchHistory.push({ query: trimmed, searchedAt: new Date() });
    if (user.searchHistory.length > MAX_ENTRIES) {
      user.searchHistory = user.searchHistory.slice(-MAX_ENTRIES);
    }
    await user.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Activity search error:', error);
    return NextResponse.json({ error: 'Failed to record search' }, { status: 500 });
  }
}
