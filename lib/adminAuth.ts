// lib/adminAuth.ts
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

/**
 * Optional second lock on top of the "role" field: a comma-separated
 * allowlist of emails read from the environment. When set, someone
 * must be BOTH role="admin" in the database AND on this list to reach
 * any /api/admin/* route — so changing the role field alone (by
 * mistake, or by anyone else with database access) still isn't enough
 * to get in. Configure it once in .env.local (dev) and again in your
 * hosting provider's environment variables (production); it isn't
 * committed to the repo.
 */
function getAdminAllowlist(): string[] | null {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw || !raw.trim()) return null;
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Verifies the bearer token on an incoming request and confirms the
 * signed-in user is allowed into the admin panel: role must be
 * "admin" in the database, and — when ADMIN_EMAILS is configured —
 * their email must also be on that allowlist. Returns the full
 * Mongoose user document on success, or null when the request should
 * be rejected.
 *
 * Centralized here so every /api/admin/* route enforces the same rule
 * instead of re-implementing the check.
 */
export async function getAdminFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return null;

  await connectToDatabase();
  const adminUser = await User.findById(decoded.userId);
  if (!adminUser || adminUser.role !== 'admin') return null;

  const allowlist = getAdminAllowlist();
  if (allowlist && !allowlist.includes(adminUser.email.toLowerCase())) {
    return null;
  }

  return adminUser;
}
