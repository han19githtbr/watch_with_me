// lib/format.ts

/** Formats a millisecond duration as "2h 15min", "42min", "8s", etc. */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

/** Formats a date as a relative "há 3 min" / "há 2 dias" style string, in Portuguese. */
export function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'Nunca';
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'agora';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 45) return 'agora mesmo';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} dia${days > 1 ? 's' : ''}`;

  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} mês${months > 1 ? 'es' : ''}`;

  const years = Math.floor(months / 12);
  return `há ${years} ano${years > 1 ? 's' : ''}`;
}

/** Formats a date as "12/03/2026 14:32" for full timestamps in tables. */
export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * A user counts as "online now" if their last heartbeat was within
 * this window. The client pings roughly every 45s while active, so a
 * couple of minutes of slack comfortably covers normal network jitter
 * and tab backgrounding.
 */
export const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export function isOnline(lastActiveAt: string | Date | null | undefined): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_THRESHOLD_MS;
}
