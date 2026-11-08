# Story animation arrival timing — 2026-11-08

The owner asked for the “Our Vision · Not Live” arrival behavior throughout the story, except its final escrow chapter. Mobile artwork previously started playing while entering the viewport.

## Change

- Read each chapter's copy, then scroll its artwork fully into view. A native sticky stage begins scrubbing at `top top`, matching the Vision reference.
- Apply this to notifications, unified inbox, overflowing documents, deal detection, roundtable, identity scan and Match. Preserve the Vision typewriter's existing stage and the final vault's play/pause behavior.
- Fit tall artwork inside a stable `100svh` frame on resize. Clip within the artwork, not on the sticky frame or its ancestors, preserving the Safari stability repair.
- On desktop, start each content timeline exactly at scene arrival instead of 0.1 timeline units before it. Preserve the final vault's timing and the existing diagonal route.
- Restore the original DOM and styles when switching modes or leaving the page. Reduced Motion remains an unpinned, readable layout.

## Verification

- 329 Vitest tests and 4 HTTP tests passed. Next.js production build passed.
- Physical iPhone, iOS 26.7.1 / Safari: all eight stages checked before arrival, midway, at the end and after reversing. Initial states remain unchanged above the start; frames settle at top 0; artwork fits fully; reversing restores the initial state. Stable frame height 674px, document width 440px, no horizontal overflow.
- Notifications reach all four messages; inbox translates from 0 to -823px; tray, deal morph and roundtable reach completion; Vision types through its handoff; identity lighting plays; Match reaches both profile phases and reverses to posts. Escrow still has its original Play example control and no sticky wrapper.
- Responsive Chromium: 320 × 568 fits all seven new frames; 1440 × 900 retains the desktop route without touch wrappers. Reduced Motion removes wrappers and leaves all nine chapters accessible.
- Screenshot and geometry receipts: `outputs/story-arrival-20261108` in the Merger project. Native swipe exercised on the connected phone; geometry checks do not constitute a frame-rate benchmark.

## Release boundary

Website motion and layout only. No backend, account, billing, desktop, iOS app or encryption changes. Previous deployment for rollback: `dpl_52ak3gPiEGoErFz6FAKwF8p77MNw`.
