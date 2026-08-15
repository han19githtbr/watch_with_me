// components/Navbar.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-black/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link
          href="/"
          className="text-lg sm:text-2xl md:text-3xl font-bold text-netflix-red tracking-tight shrink-0"
        >
          Watch With Me
        </Link>
        {user && (
          <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base">
            <Link href="/my-list" className="text-white hover:text-netflix-red transition-colors">
              My List
            </Link>
            <span className="hidden sm:inline text-gray-500">|</span>
            <span className="hidden md:inline text-white truncate max-w-[120px]">{user.name}</span>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}