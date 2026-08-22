// components/ActivityTracker.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

// How often to tell the server "still here" while the tab is active.
// Session duration in the admin panel is derived from the gap between
// login time and the last of these pings, so this controls how
// granular that number is — not tight enough to matter for billing,
// tight enough to be useful for an admin glancing at who's online.
const PING_INTERVAL_MS = 45_000;

export default function ActivityTracker() {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const ping = (keepalive = false) => {
      fetch('/api/activity/ping', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        keepalive,
      }).catch(() => {
        // Best-effort — a missed heartbeat just means a slightly
        // shorter recorded session, nothing the user needs to see.
      });
    };

    // Fire once right away so a short visit still registers.
    ping();

    const interval = setInterval(() => ping(), PING_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') ping();
    };
    const onPageHide = () => ping(true);

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [isAuthenticated, token]);

  return null;
}
