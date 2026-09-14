# §0 — the gap, measured

Both pages rendered at 1440×900 and probed for computed styles. Not impressions:
the numbers below came off the live DOM.

| | Merger (v1) | Resend | verdict |
|---|---|---|---|
| canvas | `rgb(15,19,25)` | `rgb(0,0,0)` | mine reads **dark grey**, not near-black |
| body text | `#E7E9EE` | `#F0F0F0` | close enough |
| body font | Archivo | Inter | wrong family |
| **h1 font** | **Archivo** (grotesque) | **domaine** (high-contrast serif) | **wrong register entirely** |
| **h1 size / weight** | **69px / 500** | **96px / 400** | mine is small and heavy; theirs is large and light |
| canvases | 1 | 1 | both have a 3D object — but see below |

## What actually makes Resend's hero work

1. **Pure black ground, with one soft diagonal light sweep** across the lower
   third. The page is not flat black — it has a floor.
2. **The headline is the design.** ~96px editorial serif at weight 400, tight
   leading, second line dropping to grey. It carries the whole composition.
3. **Negative space is enormous.** The hero band sits in the middle third; the
   top and bottom are empty and stay empty.
4. **The cube reads through SPECULAR, not emission.** It is a near-black object
   on a near-black ground, and it is legible only because of sharp highlights
   and a rim light along one edge. That is the thing v1 got wrong: I lifted the
   material colour and added emissive glow, which produced a flat brass shape
   instead of a glossy object.
5. Restraint: a small pill above the headline, one filled CTA, one plain text
   link. Nothing else competes.

## What v1 is missing, in order of how visible it is

1. **Canvas is too light** — `#0F1319` against Resend's `#000`. The change from
   the previous palette was ~4 points of luminance, which is not a change.
2. **No editorial serif.** The hero is a grotesque; the whole "expensive"
   register of the reference comes from the serif.
3. **The gem is dim, flat and half-occluded** by the sample-desk card. It needs
   to be a glossy specular object with real presence, not a background texture.
4. **Nothing reacts to the CTA.** Resend shifts the hero light on hover; v1's
   hero is inert.
5. **Not enough air.** The hero is packed with copy, price, billing notice and a
   desk mock; the reference gives the headline room to be the subject.
6. **Gold is flat.** One hex, painted on. It should read as a reflective metal
   gradient and appear only on the primary CTA and active states.

## The bar, restated

Match the **craft, cleanliness and aliveness** — near-black, generous, reactive,
one confident accent — using Merger's own gem, gold and finance-grade tone. Not
a pixel clone: their register is developer-optimistic, Merger's is discretion
and gravitas.
