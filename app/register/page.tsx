// app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const register = useAuthStore((state) => state.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(name, email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-netflix-dark">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(60,10,10,0.55),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(0,0,0,0.9),_rgba(0,0,0,1))]" />

      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-8 font-display text-2xl sm:text-3xl text-netflix-red tracking-wide"
      >
        WATCH WITH ME
      </Link>

      <div className="relative z-10 bg-black/75 p-6 sm:p-10 rounded max-w-md w-full shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-7">Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-neutral-800 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              required
            />
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
              minLength={6}
            />
            {error && (
              <p className="text-netflix-red text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full netflix-button py-3 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <p className="text-gray-400 text-center mt-6">
          Already have an account?{' '}
          <Link href="/" className="text-white hover:underline">
            Sign in now
          </Link>
        </p>
      </div>
    </div>
  );
}