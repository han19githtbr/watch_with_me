// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { summarizeAccess, summarizeGenres } from '@/lib/userStats';

export async function GET(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const users = await User.find().sort({ createdAt: -1 });

    const summarized = users.map((user) => {
      const access = summarizeAccess(user.accessLogs || []);
      const topGenres = summarizeGenres(user.viewHistory || [], 1);

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        createdAt: user.createdAt,
        favoritesCount: (user.favorites || []).length,
        viewCount: (user.viewHistory || []).length,
        searchCount: (user.searchHistory || []).length,
        topGenre: topGenres[0]?.value || null,
        ...access,
      };
    });

    return NextResponse.json({
      users: summarized,
      adminId: admin._id.toString(),
    });
  } catch (error) {
    console.error('Admin list users error:', error);
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}
