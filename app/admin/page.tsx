// app/admin/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import Login from '@/components/Auth/Login';
import Avatar from '@/components/Avatar';
import StatCard from '@/components/admin/StatCard';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { SearchIcon, TrashIcon, UsersIcon, ClockIcon, ShieldIcon } from '@/components/icons';
import { formatDuration, formatRelativeTime, isOnline } from '@/lib/format';
import type { AdminUserSummary } from '@/lib/adminTypes';

type SortKey = 'recent' | 'name' | 'sessions' | 'favorites';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();

  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [pendingDelete, setPendingDelete] = useState<AdminUserSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || !token) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Falha ao carregar usuários');
        }
        const data = await res.json();
        if (!cancelled) setUsers(data.users || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao carregar usuários');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAdmin, token]);

  const stats = useMemo(() => {
    const total = users.length;
    const online = users.filter((u) => isOnline(u.lastActiveAt)).length;
    const totalSessions = users.reduce((sum, u) => sum + u.totalSessions, 0);
    const avgSession =
      users.length > 0
        ? Math.round(users.reduce((sum, u) => sum + u.avgSessionMs, 0) / users.length)
        : 0;
    return { total, online, totalSessions, avgSession };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = users;
    if (needle) {
      list = list.filter(
        (u) => u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle)
      );
    }

    const sorted = [...list];
    switch (sortKey) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'sessions':
        sorted.sort((a, b) => b.totalSessions - a.totalSessions);
        break;
      case 'favorites':
        sorted.sort((a, b) => b.favoritesCount - a.favoritesCount);
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => {
          const at = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
          const bt = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
          return bt - at;
        });
    }
    return sorted;
  }, [users, query, sortKey]);

  const handleDelete = async () => {
    if (!pendingDelete || !token) return;
    setDeleting(true);
    setActionError('');
    try {
      const res = await fetch(`/api/admin/users/${pendingDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao remover usuário');
      }
      setUsers((prev) => prev.filter((u) => u.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Falha ao remover usuário');
    } finally {
      setDeleting(false);
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
          <p className="text-gray-400 mb-6">
            Esta área é exclusiva para administradores. Se você acredita que deveria ter acesso, fale com quem gerencia a plataforma.
          </p>
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

      <div className="pt-24 max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-12 pb-16">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide">Painel de Administração</h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Monitore o acesso e a atividade das contas cadastradas em Watch With Me.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard label="Usuários cadastrados" value={stats.total} icon={<UsersIcon />} />
          <StatCard
            label="Online agora"
            value={stats.online}
            accent="green"
            hint={`de ${stats.total} conta${stats.total === 1 ? '' : 's'}`}
          />
          <StatCard label="Sessões registradas" value={stats.totalSessions} icon={<ClockIcon />} />
          <StatCard label="Duração média de sessão" value={formatDuration(stats.avgSession)} />
        </div>

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

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou e-mail…"
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-netflix-red"
            />
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-neutral-900 border border-white/10 rounded-lg text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-netflix-red sm:w-56"
          >
            <option value="recent">Ordenar por: atividade recente</option>
            <option value="name">Ordenar por: nome</option>
            <option value="sessions">Ordenar por: mais sessões</option>
            <option value="favorites">Ordenar por: mais favoritos</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-900/70 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {users.length === 0 ? 'Nenhum usuário cadastrado ainda.' : 'Nenhum usuário corresponde à busca.'}
          </div>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden md:block bg-neutral-900/60 border border-white/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-white/10 bg-white/[0.03]">
                    <th className="font-medium py-3 px-4">Usuário</th>
                    <th className="font-medium py-3 px-4">Última atividade</th>
                    <th className="font-medium py-3 px-4">Sessões</th>
                    <th className="font-medium py-3 px-4">Tempo médio</th>
                    <th className="font-medium py-3 px-4">Favoritos</th>
                    <th className="font-medium py-3 px-4">Gênero preferido</th>
                    <th className="font-medium py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const online = isOnline(u.lastActiveAt);
                    return (
                      <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar name={u.name} email={u.email} size={34} />
                            <div className="min-w-0">
                              <p className="text-white font-medium truncate flex items-center gap-1.5">
                                {u.name}
                                {u.role === 'admin' && (
                                  <span className="text-[10px] uppercase tracking-wide bg-netflix-red/20 text-netflix-red px-1.5 py-0.5 rounded">
                                    Admin
                                  </span>
                                )}
                              </p>
                              <p className="text-gray-500 text-xs truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-400' : 'bg-gray-600'}`}
                              aria-hidden="true"
                            />
                            {online ? 'Online agora' : formatRelativeTime(u.lastActiveAt)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{u.totalSessions}</td>
                        <td className="py-3 px-4 text-gray-300">{formatDuration(u.avgSessionMs)}</td>
                        <td className="py-3 px-4 text-gray-300">{u.favoritesCount}</td>
                        <td className="py-3 px-4 text-gray-300">{u.topGenre || '—'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/users/${u.id}`)}
                              className="text-xs font-semibold text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded transition-colors"
                            >
                              Ver detalhes
                            </button>
                            <button
                              onClick={() => setPendingDelete(u)}
                              aria-label={`Remover ${u.name}`}
                              className="text-gray-400 hover:text-netflix-red p-1.5 rounded hover:bg-white/10 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="md:hidden space-y-3">
              {filteredUsers.map((u) => {
                const online = isOnline(u.lastActiveAt);
                return (
                  <div key={u.id} className="bg-neutral-900/70 border border-white/10 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={u.name} email={u.email} size={38} />
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate flex items-center gap-1.5">
                            {u.name}
                            {u.role === 'admin' && (
                              <span className="text-[10px] uppercase tracking-wide bg-netflix-red/20 text-netflix-red px-1.5 py-0.5 rounded">
                                Admin
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 text-xs truncate">{u.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPendingDelete(u)}
                        aria-label={`Remover ${u.name}`}
                        className="text-gray-400 hover:text-netflix-red p-1.5 rounded hover:bg-white/10 transition-colors shrink-0"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-400 mb-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-gray-600'}`}
                          aria-hidden="true"
                        />
                        {online ? 'Online agora' : formatRelativeTime(u.lastActiveAt)}
                      </div>
                      <div>{u.totalSessions} sessões</div>
                      <div>Média: {formatDuration(u.avgSessionMs)}</div>
                      <div>{u.favoritesCount} favoritos</div>
                    </div>

                    <button
                      onClick={() => router.push(`/admin/users/${u.id}`)}
                      className="w-full text-xs font-semibold text-white bg-white/10 hover:bg-white/15 py-2 rounded transition-colors"
                    >
                      Ver detalhes
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remover usuário"
        description={
          pendingDelete
            ? `Tem certeza de que deseja remover a conta de ${pendingDelete.name} (${pendingDelete.email})? Essa ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Remover"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setPendingDelete(null);
          setActionError('');
        }}
      />
    </div>
  );
}
