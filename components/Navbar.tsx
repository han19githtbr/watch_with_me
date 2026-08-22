// components/Navbar.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useMovieStore } from '@/store/movieStore';
import Link from 'next/link';
import Avatar from './Avatar';
import { SearchIcon, XIcon } from './icons';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const searchMovies = useMovieStore((s) => s.searchMovies);
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navQuery, setNavQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  
  const handleNavSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = navQuery.trim();
    if (!trimmed) return;
    searchMovies(trimmed);
    if (pathname !== '/') router.push('/');
    setSearchOpen(false);
    setNavQuery('');
  };

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [searchOpen]);

  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-colors duration-300 ${
        scrolled
          ? 'bg-black shadow-[0_2px_12px_rgba(0,0,0,0.6)]'
          : 'bg-gradient-to-b from-black/85 via-black/40 to-transparent'
      }`}
    >
      <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-12 h-full flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl sm:text-3xl md:text-4xl text-netflix-red tracking-wide shrink-0 leading-none"
        >
          WATCH WITH ME
        </Link>

        {user && (
          <div className="flex items-center gap-2 sm:gap-6 text-sm sm:text-base">
            <div className="relative" ref={searchRef}>
              {searchOpen ? (
                <form onSubmit={handleNavSearchSubmit} className="flex items-center">
                  <div className="flex items-center bg-black/80 border border-white/25 rounded overflow-hidden animate-fadeIn">
                    <SearchIcon className="w-4 h-4 ml-3 text-gray-400 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={navQuery}
                      onChange={(e) => setNavQuery(e.target.value)}
                      placeholder="Titles, people, genres..."
                      aria-label="Search for movies"
                      className="w-32 xs:w-44 sm:w-56 bg-transparent text-white text-sm placeholder-gray-400 py-1.5 px-2 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        setNavQuery('');
                      }}
                      aria-label="Close search"
                      className="px-2.5 text-gray-400 hover:text-white transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className="text-white/90 hover:text-white transition-colors p-1"
                >
                  <SearchIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            <Link href="/my-list" className="hidden xs:inline text-white/90 hover:text-white transition-colors">
              My List
            </Link>

            {user.role === 'admin' && (
              <Link href="/admin" className="hidden sm:inline text-white/90 hover:text-white transition-colors">
                Admin
              </Link>
            )}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 sm:gap-2"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-label="Account menu"
              >
                <Avatar name={user.name} email={user.email} size={32} />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className={`hidden sm:block w-3.5 h-3.5 text-white transition-transform duration-200 ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-black/95 border border-white/15 rounded shadow-2xl overflow-hidden text-sm animate-fadeIn">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                    <Avatar name={user.name} email={user.email} size={36} />
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{user.name}</p>
                      <p className="text-gray-400 text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/my-list"
                    onClick={() => setMenuOpen(false)}
                    className="xs:hidden block px-4 py-2.5 text-white hover:bg-white/10 transition-colors"
                  >
                    My List
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="sm:hidden block px-4 py-2.5 text-white hover:bg-white/10 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Sign out of Watch With Me
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
