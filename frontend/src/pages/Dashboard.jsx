import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../lib/api.js';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'done', label: 'Done' },
];

function statusBadge(row) {
  const s = row.status;
  if (s === 'done') {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-emerald-400/80 bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-900">
        <span aria-hidden>✔</span>
        Done
      </span>
    );
  }
  if (s === 'delayed') {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-red-400/90 bg-red-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-950">
        <span aria-hidden>⚠</span>
        Delayed
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit rounded-md border border-amber-400/70 bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-950">
      Pending
    </span>
  );
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [delayedAlerts, setDelayedAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/alerts`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data.error === 'string'
            ? data.error
            : `Failed to load alerts (${res.status})`;
        throw new Error(msg);
      }
      setDelayedAlerts(Array.isArray(data) ? data : []);
    } catch {
      setDelayedAlerts([]);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data.error === 'string'
            ? data.error
            : `Failed to load tasks (${res.status})`;
        throw new Error(msg);
      }
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadAlerts();
  }, [loadTasks, loadAlerts]);

  const handleStatusChange = useCallback(
    async (taskId, newStatus) => {
      setUpdatingId(taskId);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg =
            typeof data.error === 'string'
              ? data.error
              : `Update failed (${res.status})`;
          throw new Error(msg);
        }
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, ...data } : t))
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Update failed');
      } finally {
        setUpdatingId(null);
      }
    },
    []
  );

  const handleClearAll = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear all tasks? This cannot be undone.')) {
      return;
    }
    setClearing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to clear tasks');
      }
      setTasks([]);
      setDelayedAlerts([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to clear tasks');
    } finally {
      setClearing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,#ebe6dc_0%,#f5f2eb_45%,#f0ebe3_100%)] text-[#2a2620]">
      <div className="pointer-events-none fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2240%22%20height%3D%2240%22%3E%3Cpath%20d%3D%22M0%2040h40M40%200v40%22%20stroke%3D%22%23221f1c%22%20stroke-opacity%3D%22.04%22%20stroke-width%3D%22.5%22/%3E%3C/svg%3E')] opacity-70" />

      <main className="relative mx-auto max-w-5xl px-5 pb-24 pt-14 sm:px-8 sm:pt-16">
        <nav className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-[#6b5d4f] underline decoration-[#c9bfb2] underline-offset-4 transition hover:text-[#3a322b]"
          >
            ← Meeting input
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={loading || clearing}
              className="rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-700 transition hover:bg-red-100 disabled:opacity-50"
            >
              {clearing ? 'Clearing...' : 'Clear All'}
            </button>
            <button
              type="button"
              onClick={() => {
                loadTasks();
                loadAlerts();
              }}
              disabled={loading || clearing}
              className="rounded-lg border border-[#cfc5b8] bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#5c4d3d] transition hover:bg-[#f5f2eb] disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </nav>

        <header className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1f1c18] sm:text-4xl">
            Task dashboard
          </h1>
          <p className="mt-2 max-w-xl text-[15px] text-[#5a5349]">
            All tasks saved from processed meetings. Update status as work
            progresses.
          </p>
        </header>

        {delayedAlerts.length > 0 && (
          <section
            className="mb-6 rounded-xl border-2 border-red-600 bg-gradient-to-b from-red-50 to-[#fff5f5] px-5 py-4 shadow-[0_8px_30px_-8px_rgba(185,28,28,0.45)]"
            aria-label="Delayed tasks"
          >
            <h2 className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-red-800">
              Alerts
            </h2>
            <ul className="space-y-2">
              {delayedAlerts.map((row) => {
                const label = (row.task && String(row.task).trim()) || 'Untitled';
                return (
                  <li
                    key={row.id}
                    className="flex items-baseline gap-2 rounded-lg border border-red-300 bg-white/95 px-4 py-3 text-[15px] font-medium leading-snug text-red-950 shadow-sm"
                    role="status"
                  >
                    <span className="shrink-0 select-none text-lg" aria-hidden>
                      ⚠
                    </span>
                    <span>
                      Task <span className="font-semibold">{label}</span> is delayed
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {error && (
          <div
            className="mb-6 rounded-xl border border-[#c9a8a0] bg-[#faf0ee] px-4 py-3 text-sm text-[#5c3530]"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[#dcd4c8] bg-white/80 shadow-[0_20px_50px_-28px_rgba(35,28,22,0.35)] backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-[#e3dcd2] bg-[#f5f0e8]/90">
                  <th className="px-5 py-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#7a6e62]">
                    Task
                  </th>
                  <th className="px-5 py-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#7a6e62]">
                    Owner
                  </th>
                  <th className="px-5 py-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#7a6e62]">
                    Deadline
                  </th>
                  <th className="px-5 py-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#7a6e62]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center text-[#8a8075]">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#cfc5b8] border-t-[#5c4d3d]"
                          aria-hidden
                        />
                        Loading tasks…
                      </span>
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-14 text-center text-[#8a8075]"
                    >
                      No tasks yet. Process a meeting on the home page.
                    </td>
                  </tr>
                ) : (
                  tasks.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#efe8df] last:border-0"
                    >
                      <td className="max-w-md px-5 py-4 align-top text-[#1f1c18]">
                        <span className="line-clamp-3 font-medium">
                          {row.task || '—'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top text-[#5a5349]">
                        {row.owner || '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top text-[#5a5349]">
                        {row.deadline || '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          {statusBadge(row)}
                          <div className="flex items-center gap-2">
                            <select
                              aria-label={`Status for ${row.task?.slice(0, 40) ?? 'task'}`}
                              value={row.status === 'done' ? 'done' : 'pending'}
                              onChange={(e) =>
                                handleStatusChange(row.id, e.target.value)
                              }
                              disabled={updatingId === row.id}
                              className="cursor-pointer rounded-lg border border-[#cfc5b8] bg-[#fffcf7] px-3 py-2 text-sm font-medium text-[#2a2620] shadow-inner focus:border-[#8a7a68] focus:outline-none focus:ring-2 focus:ring-[#5c4d3d]/15 disabled:cursor-wait disabled:opacity-60"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            {updatingId === row.id && (
                              <span
                                className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#cfc5b8] border-t-[#5c4d3d]"
                                aria-hidden
                              />
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
