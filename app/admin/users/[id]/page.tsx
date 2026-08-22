// app/admin/users/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import Login from '@/components/Auth/Login';
import Avatar from '@/components/Avatar';
import PosterImage from '@/components/PosterImage';
import StatCard from '@/components/admin/StatCard';
import BarList from '@/components/admin/BarList';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { ChevronLeftIcon, ClockIcon, DeviceIcon, ShieldIcon, TrashIcon } from '@/components/icons';
import { formatDateTime, formatDuration, formatRelativeTime, isOnline } from '@/lib/format';
import type { AdminUserDetail } from '@/lib/adminTypes';

// Turns a raw User-Agent string into a short, human label like
// "Chrome no Windows" instead of the full technical string.
function summarizeUserAgent(ua: string): string {
  if (!ua) return 'Dispositivo desconhecido';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /Chrome\//.test(ua)
    ? 'Chrome'
    : /Firefox\//.test(ua)
    ? 'Firefox'
    : /Safari\//.test(ua)
    ? 'Safari'
    : 'Navegador';
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Mac OS/.test(ua)
    ? 'macOS'
    : /Android/.test(ua)
    ? 'Android'
    : /iPhone|iPad/.test(ua)
    ? 'iOS'
    : /Linux/.test(ua)
    ? 'Linux'
    : '';
  return os ? `${browser} · ${os}` : browser;
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || !token || !id) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Falha ao carregar usuário');
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao carregar usuário');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAdmin, token, id]);

  const handleDelete = async () => {
    if (!token || !id) return;
    setDeleting(true);
    setActionError('');
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Falha ao remover usuário');
      router.push('/admin');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Falha ao remover usuário');
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-netflix-dark">
        <Navbar />
        <div className="pt-24 max-w-lg mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-netflix-red/15 text-netflix-red mb-4">
            <ShieldIcon className="w-7 h-7" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Acesso restrito</h1>
          <p className="text-gray-400 mb-6">Esta área é exclusiva para administradores.</p>
          <Link href="/" className="netflix-button inline-block">
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-dark">
      <Navbar />

      <div className="pt-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pb-16">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm mb-6"
        >
          <ChevronLeftIcon className="w-4 h-4" /> Voltar ao painel
        </Link>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        {actionError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3">
            {actionError}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 bg-neutral-900/70 rounded-lg animate-pulse" />
            <div className="h-64 bg-neutral-900/70 rounded-lg animate-pulse" />
          </div>
        ) : !detail ? (
          <div className="text-center py-16 text-gray-400">Usuário não encontrado.</div>
        ) : (
          <>
            {/* Profile header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 border border-white/10 rounded-lg p-5 sm:p-6 mb-6">
              <div className="flex items-center gap-4 min-w-0">
                <Avatar name={detail.user.name} email={detail.user.email} size={56} />
                <div className="min-w-0">
                  <h1 className="text-white text-xl sm:text-2xl font-bold truncate flex items-center gap-2">
                    {detail.user.name}
                    {detail.user.role === 'admin' && (
                      <span className="text-[10px] uppercase tracking-wide bg-netflix-red/20 text-netflix-red px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-400 text-sm truncate">{detail.user.email}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Cadastrado em {formatDateTime(detail.user.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-red-300 border border-red-500/40 hover:bg-red-500/10 px-4 py-2.5 rounded transition-colors shrink-0"
              >
                <TrashIcon className="w-4 h-4" /> Remover usuário
              </button>
            </div>

            {/* Access stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <StatCard
                label="Status"
                value={isOnline(detail.access.lastActiveAt) ? 'Online' : 'Offline'}
                accent={isOnline(detail.access.lastActiveAt) ? 'green' : 'default'}
                hint={
                  isOnline(detail.access.lastActiveAt)
                    ? undefined
                    : `Visto ${formatRelativeTime(detail.access.lastActiveAt)}`
                }
              />
              <StatCard label="Total de sessões" value={detail.access.totalSessions} icon={<ClockIcon />} />
              <StatCard label="Última sessão" value={formatDuration(detail.access.lastSessionMs)} />
              <StatCard label="Duração média" value={formatDuration(detail.access.avgSessionMs)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Access history */}
              <div className="lg:col-span-2 bg-neutral-900/70 border border-white/10 rounded-lg p-5 sm:p-6">
                <h2 className="text-white font-bold text-lg mb-4">Histórico de acesso</h2>
                {detail.accessHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum login registrado ainda.</p>
                ) : (
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-sm min-w-[480px]">
                      <thead>
                        <tr className="text-left text-gray-500 text-xs uppercase tracking-wide border-b border-white/10">
                          <th className="font-medium py-2 px-1">Entrada</th>
                          <th className="font-medium py-2 px-1">Duração</th>
                          <th className="font-medium py-2 px-1">Dispositivo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.accessHistory.slice(0, 25).map((log, i) => (
                          <tr key={i} className="border-b border-white/5 last:border-0">
                            <td className="py-2.5 px-1 text-gray-300 whitespace-nowrap">
                              {formatDateTime(log.loginAt)}
                            </td>
                            <td className="py-2.5 px-1 text-gray-300">{formatDuration(log.durationMs)}</td>
                            <td className="py-2.5 px-1 text-gray-400">
                              <span className="inline-flex items-center gap-1.5">
                                <DeviceIcon className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{summarizeUserAgent(log.userAgent)}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Top genres */}
              <div className="bg-neutral-900/70 border border-white/10 rounded-lg p-5 sm:p-6">
                <h2 className="text-white font-bold text-lg mb-4">Gêneros mais assistidos</h2>
                <BarList items={detail.topGenres.map((g) => ({ label: g.value, count: g.count }))} />
              </div>

              {/* Top searches */}
              <div className="bg-neutral-900/70 border border-white/10 rounded-lg p-5 sm:p-6">
                <h2 className="text-white font-bold text-lg mb-4">Termos mais buscados</h2>
                <BarList items={detail.topSearches.map((s) => ({ label: s.value, count: s.count }))} />
              </div>

              {/* Top movies */}
              <div className="bg-neutral-900/70 border border-white/10 rounded-lg p-5 sm:p-6">
                <h2 className="text-white font-bold text-lg mb-4">Filmes mais vistos</h2>
                {detail.topMovies.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhuma visualização registrada ainda.</p>
                ) : (
                  <ul className="space-y-3">
                    {detail.topMovies.map((m) => (
                      <li key={m.movieId} className="flex items-center gap-3">
                        <div className="w-9 h-13 rounded overflow-hidden shrink-0 relative" style={{ width: 36, height: 52 }}>
                          <PosterImage src={m.poster} alt={m.title} fill sizes="36px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-200 text-sm truncate">{m.title}</p>
                        </div>
                        <span className="text-gray-500 text-xs shrink-0">{m.count}x</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Favorites */}
              <div className="lg:col-span-2 bg-neutral-900/70 border border-white/10 rounded-lg p-5 sm:p-6">
                <h2 className="text-white font-bold text-lg mb-4">
                  Lista de favoritos ({detail.user.favorites.length})
                </h2>
                {detail.user.favorites.length === 0 ? (
                  <p className="text-gray-500 text-sm">Este usuário ainda não adicionou favoritos.</p>
                ) : (
                  <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-3">
                    {detail.user.favorites.map((movieId) => {
                      const match = [...detail.topMovies, ...detail.recentViews].find(
                        (v) => v.movieId === movieId
                      );
                      return (
                        <Link
                          key={movieId}
                          href={`/movie/${movieId}`}
                          target="_blank"
                          className="group"
                          title={match?.title || movieId}
                        >
                          <div className="aspect-[2/3] rounded overflow-hidden relative bg-neutral-800 ring-1 ring-white/10 group-hover:ring-netflix-red/60 transition-all">
                            <PosterImage src={match?.poster} alt={match?.title || movieId} fill sizes="120px" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Remover usuário"
        description={
          detail
            ? `Tem certeza de que deseja remover a conta de ${detail.user.name} (${detail.user.email})? Essa ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Remover"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
