// components/Avatar.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getAvatarColor, getInitials } from '@/lib/avatar';

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  /** Real profile photo URL (e.g. from a future Google/Gmail sign-in). */
  photoUrl?: string | null;
  size?: number;
  className?: string;
}

export default function Avatar({ name, email, photoUrl, size = 32, className = '' }: AvatarProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const initials = getInitials(name, email);
  const bg = getAvatarColor(email || name || 'user');

  if (photoUrl && !photoFailed) {
    return (
      <Image
        src={photoUrl}
        alt={name || 'User avatar'}
        width={size}
        height={size}
        onError={() => setPhotoFailed(true)}
        className={`rounded object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name || email || 'User avatar'}
      className={`flex items-center justify-center rounded font-bold text-white select-none shrink-0 ring-1 ring-white/20 ${className}`}
      style={{ width: size, height: size, backgroundColor: bg, fontSize: Math.max(10, size * 0.4) }}
    >
      {initials}
    </div>
  );
}
