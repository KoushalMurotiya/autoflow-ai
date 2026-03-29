import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { API_BASE } from '../lib/api.js';

export default function Home() {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState(null);
  const rootRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.js-hero-line',
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out',
        }
      );
      gsap.fromTo(
        '.js-panel',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.35, ease: 'power2.out' }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!tasks?.length) return;
    const rows = resultsRef.current?.querySelectorAll('.js-task-row');
    if (!rows?.length) return;
    gsap.fromTo(
      rows,
      { opacity: 0, x: -16 },
      {
        opacity: 1,
        x: 0,
        duration: 0.45,
        stagger: 0.07,
        ease: 'power2.out',
      }
    );
  }, [tasks]);

  const processMeeting = useCallback(async () => {
    setError(null);
    setTasks(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/process-meeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data.error === 'string'
            ? data.error
            : `Request failed (${res.status})`;
        throw new Error(msg);
      }
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [notes]);

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,#ebe6dc_0%,#f5f2eb_45%,#f0ebe3_100%)] text-[#2a2620]"
    >
      <div className="pointer-events-none fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2240%22%20height%3D%2240%22%3E%3Cpath%20d%3D%22M0%2040h40M40%200v40%22%20stroke%3D%22%23221f1c%22%20stroke-opacity%3D%22.04%22%20stroke-width%3D%22.5%22/%3E%3C/svg%3E')] opacity-70" />

      <main className="relative mx-auto max-w-2xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
        <nav className="mb-8 flex justify-center">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-[#6b5d4f] underline decoration-[#c9bfb2] underline-offset-4 transition hover:text-[#3a322b]"
          >
            Task dashboard
          </Link>
        </nav>

        <header className="mb-12 text-center sm:mb-14">
          <p className="js-hero-line font-display text-sm font-medium uppercase tracking-[0.35em] text-[#6b5d4f]">
            AutoFlow AI
          </p>
          <h1 className="js-hero-line font-display mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#1f1c18] sm:text-4xl">
            Turn notes into{' '}
            <span className="italic text-[#5c4d3d]">action</span>
          </h1>
          <p className="js-hero-line mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#5a5349]">
            Paste your meeting transcript. We extract tasks, owners, and
            deadlines—then save them for your team.
          </p>
        </header>

        <section className="js-panel rounded-2xl border border-[#dcd4c8] bg-white/75 p-6 shadow-[0_20px_50px_-24px_rgba(35,28,22,0.35)] backdrop-blur-sm sm:p-8">
          <label
            htmlFor="meeting-input"
            className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#7a6e62]"
          >
            Meeting notes
          </label>
          <textarea
            id="meeting-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Action items from today’s standup…"
            rows={10}
            className="mt-3 w-full resize-y rounded-xl border border-[#cfc5b8] bg-[#fffcf7]/90 px-4 py-3 text-[15px] leading-relaxed text-[#2a2620] shadow-inner placeholder:text-[#9a9084] focus:border-[#8a7a68] focus:outline-none focus:ring-2 focus:ring-[#5c4d3d]/15"
            disabled={loading}
          />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={processMeeting}
              disabled={loading || !notes.trim()}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#3a322b] px-8 text-sm font-semibold tracking-wide text-[#f7f3ed] shadow-[0_4px_14px_-4px_rgba(30,24,20,0.55)] transition hover:bg-[#2e2822] hover:shadow-[0_6px_20px_-4px_rgba(30,24,20,0.45)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#f7f3ed]/30 border-t-[#f7f3ed]"
                    aria-hidden
                  />
                  Processing
                </span>
              ) : (
                'Process Meeting'
              )}
            </button>
            {notes.trim() && !loading && (
              <span className="text-xs text-[#8a8075]">
                {notes.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            )}
          </div>

          {error && (
            <div
              className="mt-6 rounded-xl border border-[#c9a8a0] bg-[#faf0ee] px-4 py-3 text-sm text-[#5c3530]"
              role="alert"
            >
              {error}
            </div>
          )}
        </section>

        {tasks !== null && (
          <section ref={resultsRef} className="mt-10">
            <h2 className="font-display mb-4 text-lg font-semibold text-[#2c2620]">
              Extracted tasks
              <span className="ml-2 text-sm font-normal text-[#7a6e62]">
                ({tasks.length})
              </span>
            </h2>
            {tasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#c9bfb2] bg-white/40 px-4 py-8 text-center text-sm text-[#7a7168]">
                No tasks were found in this text.
              </p>
            ) : (
              <ul className="space-y-3">
                {tasks.map((t, i) => (
                  <li
                    key={t.id ?? `${i}-${t.task}`}
                    className="js-task-row rounded-xl border border-[#e3dcd2] bg-white/85 px-4 py-4 shadow-sm"
                  >
                    <p className="font-medium text-[#1f1c18]">{t.task}</p>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#5a5349]">
                      {t.owner ? (
                        <span>
                          <span className="text-[#9a9084]">Owner</span>{' '}
                          {t.owner}
                        </span>
                      ) : null}
                      {t.deadline ? (
                        <span>
                          <span className="text-[#9a9084]">Due</span>{' '}
                          {t.deadline}
                        </span>
                      ) : null}
                      {t.status ? (
                        <span className="rounded-md bg-[#ebe6dc] px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-[#5c4d3d]">
                          {t.status}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
