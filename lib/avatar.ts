// lib/avatar.ts
//
// The app authenticates with email/password (not Google/Gmail OAuth), so
// there is no real third-party profile photo to pull from. Instead we
// generate a stable, Netflix-profile-style avatar (colored tile + initials)
// derived from the user's own name/email — same user always gets the same
// avatar, no network request required.
//
// If Google/Gmail sign-in is added later, `user.picture` (a real photo URL)
// can simply be passed into <Avatar photoUrl={user.picture} /> and it will
// take priority over the generated initials automatically.

const PALETTE = [
  '#E50914', // netflix red
  '#B1060F',
  '#8A2BE2',
  '#1E6FD9',
  '#2E8B57',
  '#DAA520',
  '#FF6F3C',
  '#C71585',
  '#0891B2',
];

export function getInitials(name?: string | null, email?: string | null): string {
  const source = (name || email || '?').trim();
  if (!source) return '?';

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  // Fall back to the first two characters (handles single names or emails).
  return source.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || '?';
}

export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
