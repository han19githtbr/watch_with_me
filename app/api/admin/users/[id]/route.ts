// app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import {
  summarizeAccess,
  summarizeGenres,
  summarizeTopMovies,
  summarizeTopSearches,
  buildAccessHistory,
} from '@/lib/userStats';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const accessLogs = user.accessLogs || [];
    const viewHistory = user.viewHistory || [];
    const searchHistory = user.searchHistory || [];

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        createdAt: user.createdAt,
        favorites: user.favorites || [],
      },
      access: summarizeAccess(accessLogs),
      accessHistory: buildAccessHistory(accessLogs),
      topGenres: summarizeGenres(viewHistory),
      topMovies: summarizeTopMovies(viewHistory),
      topSearches: summarizeTopSearches(searchHistory),
      recentViews: [...viewHistory]
        .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
        .slice(0, 20),
    });
  } catch (error) {
    console.error('Admin get user detail error:', error);
    return NextResponse.json({ error: 'Failed to load user' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    if (admin._id.toString() === id) {
      return NextResponse.json(
        { error: 'You cannot remove your own admin account' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 });
  }
}
