# Funnel redesign — research notes

Technique study, not a moodboard. Everything below was measured out of the
shipped CSS of the reference sites (downloaded and grepped), not eyeballed from
screenshots — so the numbers are what those teams actually ship.

## What the references actually do

### Motion: one curve, used everywhere

The single most copyable thing, and the least obvious:

| site | easing | uses |
|---|---|---|
| Linear | `cubic-bezier(.32,.72,0,1)` | **the only curve in their CSS** |
| Stripe | `cubic-bezier(.25,1,.5,1)` | 41 — dominant |
| Resend | `cubic-bezier(.4,0,.2,1)` | 8 — Material standard |

Linear ships exactly one easing across the whole site. Stripe has a handful but
one accounts for nearly all of it. Both primaries are the same *shape*: leaves
fast, settles slowly (`.32,.72,0,1` and `.25,1,.5,1` both end with a long tail).

That shape is what "expensive" means in motion. Bouncy overshoot reads as toy;
a long decelerating settle reads as weight. **No spring, no overshoot, no
bounce.**

### Duration: two bands, nothing in between

Measured from `transition` declarations:

- **micro-interactions 150–300ms** — Resend .15/.2/.3, Stripe .15/.2/.25/.3
  (30 uses at .3s). Hover, color, border, small translate.
- **reveals and larger moves 400–700ms** — Resend .4/.5, Stripe .4/.5, Linear .7

Nothing sits at 1s+ for interface motion. Long durations appear only on ambient
loops (gradients, background drift), never on anything a user is waiting for.

### Type: three roles, not three fonts chosen for variety

Resend ships `aBCFavorit` (display), `Inter` (body), `commitMono` (data).
Stripe ships `sohne-var` (display) and `SourceCodePro` (data). The pattern is a
**characterful display face, a neutral workhorse body, and a mono reserved for
data and labels** — the mono is what makes numbers read as instruments rather
than prose.

Merger already has this trio specified (Archivo / Source Serif 4 /
JetBrains Mono), so the job is using them with that discipline, not picking new
ones.

### Rhythm: ~96–100px between sections

Resend's large paddings cluster at 60/70/100px; Linear at 96px. Sections are
separated by roughly a sixth of a viewport of nothing. The generosity IS the
premium signal — it says the content is worth waiting for.

### What they don't do

- No competing accents. One accent, everything else neutral.
- No motion on first paint that delays LCP.
- No decorative animation that doesn't explain something.
- No dense feature grids above the fold.

## Merger's own identity — not a clone

The references are developer-tool brands: bright, optimistic, a little playful.
Merger's audience is PE and finance dealmakers, and the tone brief is
**discretion, precision, gravitas — "this moves real money"**. So we take the
craft level and invert the temperature.

**Palette (ink and brass, matching the desktop app so funnel → app is one product):**

| token | value | role |
|---|---|---|
| `--ink` | `#0F1319` | base |
| `--panel` | `#151B24` | raised surfaces |
| `--line` | `#232C3A` | hairlines |
| `--bone` | `#E7E9EE` | primary text |
| `--slate` | `#8A94A6` | secondary text |
| `--brass` | `#C9A96A` | the one accent |

Brass is used **sparingly** — CTAs, the resolved state of the hero object, one
emphasis per section. The moment a second accent appears the discretion is gone.

**Motion tokens** (derived from the study above, defined once, never ad hoc):

```
--ease:      cubic-bezier(.22,1,.36,1)   /* fast out, long settle */
--dur-micro: 200ms                        /* hover, color, border */
--dur-move:  480ms                        /* reveals, transforms */
```

One curve. Two durations. Anything that wants a third number needs an argument.

## The hero: "many → one"

The 3D object has to *be* the product thesis. Merger's thesis is twelve
disconnected channels becoming one deal desk, so the object is **shards
converging into a single resolved diamond** — the Merger mark.

- **scroll drives the merge.** At the top of the page the shards are apart and
  slowly drifting; by the time the hero leaves the viewport they have fused.
  The user performs the product metaphor by scrolling.
- **cursor adds parallax/tilt only.** It must never fight the scroll position —
  the merge state belongs to scroll, the viewing angle belongs to the pointer.
- weighted motion, same easing family as the DOM. Nothing bouncy.

**Non-negotiables** (this is what separates premium from amateur, per the brief):

- dynamic import, `ssr: false`, loaded after first paint — 3D never blocks LCP
- `dpr` capped, render loop paused when the tab is hidden or the hero is offscreen
- mobile gets a lighter scene or a static poster — never a phone-melting canvas
- `prefers-reduced-motion` → the final, resolved frame as a still image, no loop
- the hero box is reserved at every breakpoint so CLS stays ~0; a poster frame
  holds the space until the scene is ready

## Motion that teaches, not decorates

The valuable sequences are the ones that show what the product does:

1. messages arriving from many networks → one unified inbox
2. the AI reading a thread and recognising a deal — a line lights brass
3. a deal card materialising on the Desk with parties, size, stage

Rendered in the app's real style (ink panels, brass accent, mono labels), not
stock imagery, so the marketing and the product are visibly the same object.

Each reveals on scroll with the same choreography: a short rise and fade at
`--dur-move`, staggered by ~60ms, triggered once, and skipped entirely under
reduced motion.
