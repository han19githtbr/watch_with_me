// components/admin/StatCard.tsx
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: 'red' | 'green' | 'default';
}

export default function StatCard({ label, value, hint, icon, accent = 'default' }: StatCardProps) {
  const accentClass =
    accent === 'red'
      ? 'text-netflix-red'
      : accent === 'green'
      ? 'text-emerald-400'
      : 'text-white';

  return (
    <div className="bg-neutral-900/80 border border-white/10 rounded-lg p-4 sm:p-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-gray-400 text-xs sm:text-sm mb-1">{label}</p>
        <p className={`font-display text-2xl sm:text-3xl tracking-wide ${accentClass}`}>{value}</p>
        {hint && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
      </div>
      {icon && <div className="text-gray-500 shrink-0 mt-0.5">{icon}</div>}
    </div>
  );
}
