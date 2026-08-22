// app/api/activity/view/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

const MAX_ENTRIES = 500;

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

    const { movieId, title, genre, poster } = await request.json();
    if (!movieId) {
      return NextResponse.json({ error: 'movieId is required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.viewHistory = user.viewHistory || [];
    user.viewHistory.push({
      movieId,
      title: title || '',
      genre: genre || '',
      poster: poster || '',
      viewedAt: new Date(),
    });
    if (user.viewHistory.length > MAX_ENTRIES) {
      user.viewHistory = user.viewHistory.slice(-MAX_ENTRIES);
    }
    await user.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Activity view error:', error);
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}
