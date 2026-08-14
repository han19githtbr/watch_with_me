// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  favorites: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addFavorite: (movieId: string) => Promise<void>;
  removeFavorite: (movieId: string) => Promise<void>;
  loadFavorites: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
        });
      },

      register: async (name: string, email: string, password: string) => {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Registration failed');
        }

        // Auto-login after registration
        await get().login(email, password);
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      addFavorite: async (movieId: string) => {
        const { token, user } = get();
        if (!token || !user) throw new Error('Not authenticated');

        const response = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ movieId }),
        });

        if (!response.ok) {
          throw new Error('Failed to add favorite');
        }

        const data = await response.json();
        set({
          user: { ...user, favorites: data.favorites },
        });
      },

      removeFavorite: async (movieId: string) => {
        const { token, user } = get();
        if (!token || !user) throw new Error('Not authenticated');

        const response = await fetch('/api/user/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ movieId }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove favorite');
        }

        const data = await response.json();
        set({
          user: { ...user, favorites: data.favorites },
        });
      },

      loadFavorites: async () => {
        const { token, user } = get();
        if (!token || !user) return;

        const response = await fetch('/api/user/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error('Failed to load favorites');
          return;
        }

        const data = await response.json();
        set({
          user: { ...user, favorites: data.favorites },
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);