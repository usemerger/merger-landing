# Touch funnel motion repair — 2026-11-08

## Cause and change

The previous mobile adaptation intentionally selected a static/stacked flow for horizontal scenes. It replaced the vision typewriter with word reveals, and its context diagram was hidden in the phone layout. These branches did not provide the requested scroll stories.

Full-motion touch layouts now use native CSS sticky stages, stable small-viewport heights, and GSAP timelines scrubbed from native scrolling. The context diagram and channel orbit, workflow, aspiration horizontal sequence, and vision typewriter use this path. Desktop retains its existing ScrollSmoother and pinned timelines. Reduced Motion retains readable static layouts with no sticky travel.

Videos explicitly declare muted inline playback before play is attempted. The existing play control remains available when browser policy refuses autoplay.

## Opening example

The hero and first context card now show Riverfront, a fictional 48-unit real-estate opportunity with a $12M asking price and 30-day diligence. The later Harbor Point ecommerce walkthrough remains unchanged.

`public/funnel-v3/assets/hero-realestate-detail.png` is a fresh 1206 × 2622 simulator screenshot of the dedicated synthetic Merger capture app, not a painted replacement of the app screen. The capture app uses the existing build-36 source with isolated example fixtures and no customer account. SHA-256: `0cbb83ee7759b8621c323bd67ee60e46d5d6d26ba4a1afEAC26B10EF0646E3EC`.

## Verification

- Full test suite: 325 Vitest tests plus 4 HTTP tests passed.
- Production Next.js build passed, including all 72 generated pages.
- Browser checks at 320 × 740, 390 × 844, 768 × 1024, 844 × 390 landscape, and 1440 × 1000 desktop.
- Full-motion touch: four native sticky stories, no horizontal page overflow. Typewriter starts blank, advances with scroll, and resets when scrolling back before its start.
- Reduced Motion: zero sticky story wrappers and zero GSAP pins; the entire vision sentence remains readable.
- Desktop: original ScrollSmoother path with five GSAP pins, zero native touch wrappers.
- Safari in an iPhone 17 simulator, iOS 27.0: native swipe gestures advanced the context diagram, character typewriter, aspiration rail and workflow video chapters. Screenshots are retained in the local Merger outputs directory.
- Physical iPhone on the reported iOS 26.7.1 has not been directly tested. Browser not specified by the user.

No account, admin, checkout, pricing, backend, or customer-data behavior was changed.
