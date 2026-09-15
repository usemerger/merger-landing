'use client';

import { useEffect, useState } from 'react';

/**
 * Whether the visitor is signed in, for surfaces that have to LOOK right
 * before they can be sure.
 *
 * THE BUG THIS EXISTS TO FIX: the marketing nav rendered "Sign in" for
 * everyone, because it never asked. A visitor with a perfectly valid 30-day
 * session had to press Sign in to discover they were already signed in — the
 * login page redirected them straight back out again, which is the tell.
 *
 * THE HINT IS A UI CACHE, NEVER AN AUTHORITY. The real session is an HttpOnly
 * cookie this code cannot read, and every gated page does its own server-side
 * check before showing anything. All the hint decides is which of two navs to
 * paint in the first frame, which is the difference between a page that knows
 * you and a page that flickers. The worst a stale hint can do is offer an
 * "Open dashboard" link to someone whose session has since expired — and that
 * page will bounce them to sign in, exactly as it does today.
 */

const HINT = 'merger_nav_session';

/** Forget the cached state. Call on sign-out, before the session really goes. */
export function clearSessionHint() {
  try { localStorage.removeItem(HINT); } catch { /* private mode, or blocked */ }
}

function readHint() {
  try {
    const raw = localStorage.getItem(HINT);
    if (raw === 'out') return { phase: 'out', user: null };
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && typeof user === 'object' ? { phase: 'in', user } : null;
  } catch { return null; }
}

function writeHint(user) {
  try {
    if (!user) { localStorage.setItem(HINT, 'out'); return; }
    // Only what the nav renders. Nothing here is a credential, and nothing
    // here is trusted for access — see the note above.
    localStorage.setItem(HINT, JSON.stringify({
      handle: user.handle ?? null,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
    }));
  } catch { /* private mode, or blocked */ }
}

export default function useSession() {
  /**
   * Starts 'unknown' on EVERY render path, server and client.
   *
   * Reading localStorage during the first render would produce different
   * markup on the server than in the browser, and React would throw away the
   * server's HTML to fix it. So the first paint is deliberately neutral — a
   * reserved, empty slot — and the hint is applied in the effect one tick
   * later. A neutral frame is invisible; a frame of the WRONG answer is the
   * flicker this whole hook is here to remove.
   */
  const [session, setSession] = useState({ phase: 'unknown', user: null });

  useEffect(() => {
    const hinted = readHint();
    if (hinted) setSession(hinted);

    let live = true;
    /**
     * THE API CLIENT IS LOADED LAZILY, AND THAT IS THE WHOLE PERFORMANCE STORY.
     *
     * Importing it at the top of this file puts lib/api into the landing
     * page's own chunk. That page already evaluates a ~620ms Three.js bundle
     * for the hero, and it sits right at the edge of where the browser splits
     * that evaluation into two tasks instead of one. An extra ~2.6kB was
     * enough to tip it: Lighthouse went bimodal, 94-95 most runs and 80-81 on
     * roughly two in five, with the longest task jumping 250ms -> 500ms and
     * the total main-thread work IDENTICAL in both cases. `main` measured
     * 94, 94, 94, 95, 95 across five runs and never moved, so the variance was
     * ours even though the work was not.
     *
     * A dynamic import keeps the page chunk exactly as it was and fetches this
     * code after load, when nothing is competing for the thread. Deferring
     * *when the request fires* did not help and could not have — the cost was
     * never the request.
     */
    const ask = () => { if (live) void run(); };
    if (document.readyState === 'complete') setTimeout(ask, 0);
    else window.addEventListener('load', () => setTimeout(ask, 0), { once: true });

    async function run() {
      const { meOrNull } = await import('./api');
      if (!live) return;
    meOrNull()
      .then((user) => {
        if (!live) return;
        setSession({ phase: user ? 'in' : 'out', user: user ?? null });
        writeHint(user);
      })
      .catch(() => {
        // The network failed, not the session. Keep whatever the hint said and
        // fall back to signed-out only when there was nothing to keep: showing
        // "Sign in" to someone who is signed in is recoverable, and claiming a
        // session we have no evidence for is not.
        if (live) setSession((current) => (current.phase === 'unknown' ? { phase: 'out', user: null } : current));
      });
    }
    return () => { live = false; };
  }, []);

  return session;
}
