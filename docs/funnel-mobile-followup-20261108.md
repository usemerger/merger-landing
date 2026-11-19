# Mobile funnel follow-up — 2026-11-08

## Changes

- Remove the standalone “Good deals start with trust” handshake mini section and its animation mount. The later connections artwork remains.
- Keep mobile navigation in an overlay so opening it does not shift the page or invalidate scroll positions. Dismiss on navigation, outside pointer input, or Escape; preserve the account/admin controls.
- Ignore small touch-browser viewport-height changes in ScrollTrigger. Safari's collapsing URL bar must not repeatedly rebuild and rewind the context story.
- Point the typewriter's “Here's how” arrow down on mobile.
- Run the existing Merger Match post/profile timeline in a native sticky mobile stage, including both profiles and functional Back to posts controls. Keep short-phone profile spacing compact.
- Give the mobile aspiration rail reading holds for the logo, watch, handshake and car. Retain the desktop timeline.
- Paint the nearest decoded artwork frame while the requested pose loads, rather than withholding every response overtaken by scrolling. Keep two in-flight requests and six decoded frames per sequence, with teardown and static fallback preserved.

## Verification

- Full suite: 328 Vitest tests and 4 HTTP tests passed. Focused navigation/frame-loading suite rerun: 11 passed.
- Production Next.js build passed.
- Safari, iPhone 17 simulator on iOS 27.0: menu opens without changing the 77px header height; section navigation closes it; context and channel orbit advance; mobile arrow points down; both Match profiles reveal and Back to posts returns to the feed; watch/handshake/car frames advance during scrolling.
- Context stability during native upward/downward swipes: 327 frame samples over scroll positions 2121–2434; stage top remained 0px and height 714px. This is a position check, not a frame-rate claim.
- Responsive Chromium at 375 × 667: no horizontal page overflow, five mobile story wrappers. Reduced Motion has no sticky travel and retains readable content. Desktop at 1440 × 900 retains ScrollSmoother and no mobile wrappers.
- Removed section is absent and context proceeds directly to the workflow.

Physical iOS 26.7.1 has not been directly tested. Native Safari evidence is from the iOS 27.0 simulator. Captures and local build log are in the Merger outputs/mobile-followup-20261108 directory.

## Release scope

Website presentation and motion only. No desktop/iOS app release, encryption migration, backend, pricing, checkout, or customer data changes. Previous production deployment for rollback: dpl_2zPnXrCDZTGGujed8H5cZRpcDiUz.
