# Safari context-story stability — 2026-11-08

The whole “Every conversation holds part of the deal” section still shook on the owner's physical iPhone running iOS 26.7.1 after the previous release. The earlier simulator position samples did not establish visual stability on that device.

## Repair

- Remove overflow clipping from the mobile sticky scene and its section ancestor. Clip only the artwork beneath the sticky element; constrain the background to the scene's width.
- Require a wide viewport before using the short-height two-column layout. Safari's expanding address bar cannot switch a portrait phone between one and two columns.
- Size the card and orbit against the space available below the copy, so the complete visual fits short portrait screens.
- Scope all changes to touch-story styles. Keep the desktop timeline and Reduced Motion fallback.

## Evidence

- Connected physical iPhone: iOS 26.7.1, Safari, 440 CSS-pixel width. Web Inspector enabled by the owner for this check.
- Applied the clipping repair to the open production page for an A/B check. The owner scrolled the section and explicitly confirmed **“It's smooth now.”** This is the direct smoothness acceptance, not a claim inferred from simulator DOM positions.
- Final candidate CSS inspected on the same phone: native sticky positioning, 674px stable stage, 440px document width (no horizontal overflow), deal-card and channel-orbit stages rendered.
- Chromium responsive checks: one-column portrait retained across 620px/740px viewport heights; the complete card fits the short stage. At 1440 × 900 the desktop keeps two columns and has no touch-story wrappers.
- 328 Vitest tests and 4 HTTP tests passed. Production Next.js build passed after the final CSS changes.

Native screenshots and test captures are under `outputs/context-scroll-stability-20261108`. The MJPEG captures have sparse sampled frames and are not frame-rate evidence.

## Release boundary

Website CSS only. No app release, backend, authentication, billing, data, or encryption changes. Rollback deployment: `dpl_EHm2TSLQX7r2Jk3DKFELQ5dk24oM`.
