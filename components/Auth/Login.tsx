// components/Auth/Login.tsx
'use client';

import { useState } from 'react';
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
    <div className="min-h-screen flex items-center justify-center bg-netflix-dark px-4">
      <div className="bg-black/80 p-6 sm:p-8 rounded max-w-md w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-netflix-red mb-6 sm:mb-8">Watch With Me</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-netflix-red"
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
        <p className="text-gray-400 text-center mt-4">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-white hover:underline">
            Sign up now
          </a>
        </p>
      </div>
    </div>
  );
}