// app/api/activity/ping/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// Called periodically by the client while the person is actively using
// the app. Updates the most recent access-log entry's lastActiveAt so
// the admin panel can approximate how long each session lasted.
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

    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    if (!user.accessLogs || user.accessLogs.length === 0) {
      // No login entry yet (e.g. token survived a schema migration) —
      // create one so the session still shows up in the history.
      user.accessLogs = [{ loginAt: now, lastActiveAt: now, userAgent: '', ip: '' }];
    } else {
      user.accessLogs[user.accessLogs.length - 1].lastActiveAt = now;
    }
    await user.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Activity ping error:', error);
    return NextResponse.json({ error: 'Failed to record activity' }, { status: 500 });
  }
}
