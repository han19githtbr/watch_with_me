// components/Navbar.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-black/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold text-netflix-red">
          Watch With Me
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link href="/my-list" className="text-white hover:text-netflix-red">
                My List
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-white">{user.name}</span>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}