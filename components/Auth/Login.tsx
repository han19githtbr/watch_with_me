// components/Auth/Login.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-netflix-dark">
      {/* Cinematic backdrop, like Netflix's own sign-in page: a dark
          vignette with a subtle red glow rather than a flat color. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(60,10,10,0.55),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(0,0,0,0.9),_rgba(0,0,0,1))]" />

      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-8 font-display text-2xl sm:text-3xl text-netflix-red tracking-wide"
      >
        WATCH WITH ME
      </Link>

      <div className="relative z-10 bg-black/75 p-6 sm:p-10 rounded max-w-md w-full shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-7">Sign In</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-neutral-800 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-neutral-800 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              required
            />
            {error && (
              <p className="text-netflix-red text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full netflix-button py-3 disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Sign In'}
            </button>
          </div>
        </form>
        <p className="text-gray-400 text-center mt-6">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-white hover:underline">
            Sign up now
          </a>
        </p>
      </div>
    </div>
  );
}