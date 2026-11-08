# Approved funnel → production integration

Prepared 2026-11-08. This is migration preparation, not a deployment receipt.

## Decision

Replace the homepage presentation inside the existing Next.js application. Keep the existing website, deployment project, backend proxy, cookies, accounts, subscriptions, admin pages and customer data. Do not replace the repository with the standalone HTML prototype, embed the entire homepage in an iframe, or move authentication to a new domain.

The approved design stays the visual reference: promise, integration logos, connected context/orbit, handshake, product walkthrough, origin story including Match/escrow concepts, FAQ, ambition, membership and monochrome footer. Current product behavior and planned concepts retain their existing distinctions.

## Verified baseline

- Repository: `usemerger/merger-landing`.
- Integration branch: `codex/funnel-production-integration-20261108`.
- Starting commit: `0112965559962b094b1d63182b91d80e0bd0676d` (latest fetched `origin/main`). The public homepage was also read and matches this version's main content; this is not proof of the deployed commit ID.
- Hosting configuration: Next.js on Vercel (`vercel.json`). Use the existing production project; do not register a new public site.
- **311 Vitest tests across 26 files passed, plus 4 real-HTTP synthetic API tests.** Exit 0.
- **Next production build passed.** Exit 0.
- 30 existing page/route patterns inventoried, plus generated metadata routes and `/api/*` rewrite.
- 112 existing non-homepage application/config files recorded in `funnel-preservation-baseline.json`. Preservation check passes.
- No production configuration, deployment, account, billing or admin data was changed.

Logs are in `../outputs/funnel-migration-baseline-{tests,build}-20261108.log` relative to the Merger project directory. These are baseline checks; they do not certify the new homepage, which still needs integration and acceptance testing.

## What carries over

| Area | Existing implementation / route | Migration treatment |
| --- | --- | --- |
| Session-aware navigation | `MarketingNav`, `useSession`, `clearSessionHint` | Retain the signed-out/loading/signed-in states and real sign-out behavior. Restyle only the homepage presentation. Do not use workshop storage as account authority. |
| Dashboard/admin entry | `Shell`, `AccountDashboard` | Keep `/dashboard` and its capability-gated Users & access and waitlist links. The signed-in homepage must retain a clear Open dashboard action. |
| Users and roles | `/admin/users`, `adminAccounts`, server capabilities | Preserve role/grant/revoke controls, self/protected-admin safeguards, and 401/403 handling. No new homepage-derived permission model. |
| Waitlist | `/admin/waitlist`, import worker/parser, `waitlistPermissions` | Preserve view/import/manage distinctions, selection, pagination, duplicate handling, confirmation and invitation behavior. |
| Campaigns and growth | `/admin/campaigns`, `/admin/growth` | Preserve campaign controls, totals, reporting and links. No live campaign sends during homepage QA. |
| Password and Google sign-in | `/signup`, `/login`, `/auth/finish`, `GoogleAccountButton`, `/api/*` | Preserve current callback/redirect validation and same-origin cookie flow. Do not route preview signup links to production during tests. |
| Recovery and invitations | `/forgot-password`, `/reset-password`, `/verify-email`, `/invite`, `/alpha` | Keep tokens, safe `next`, invite acceptance, referral separation and recovery behavior. |
| Desktop authorization | `/desktop/authorize`, `/auth/art` | Preserve app login and artwork routes even though these are not prominent on the landing page. |
| Billing and membership | `billingOffer`, `PlanStep`, `AccountDashboard`, `/billing` | Use shared constants: $50/month; $480/year; 30-day first-payment refund guarantee; applicable tax and cancellation disclosures. Do not copy stale trial comments into the new page. Keep backend-selected checkout authoritative. |
| Downloads and entitlement | `/download`, existing account access checks, App Store URL | Keep authenticated entitlement/download selection. Avoid hardcoded installer URLs. iPhone App Store listing stays the verified existing ID. |
| Referrals | `captureRef`, `storedRef`, signup referral handling | Capture a valid referral before homepage navigation. Carry it into signup without replacing invite authorization. |
| Campaign attribution | root `FirstTouch`, `attribution` | Preserve UTM/referrer attribution once and existing storage/expiry. Do not add tracking vendors as part of the redesign. |
| Public discovery | `/for`, `/for/[slug]`, `/playbooks`, `/playbooks/[slug]`, `/developers` | Keep existing pages, internal links and discoverability. Restore Who it's for, Playbooks and official social links absent from the workshop footer. |
| Booking and support | `/book`, `/support`, `/privacy`, `/terms` | Preserve existing routes and working forms. |
| SEO and metadata | root layout, `seo`, sitemap, robots, OG image, `llms*.txt` | Keep canonical domain, social image and app banner. Homepage schema must match visible current-feature/FAQ/price content. Planned roadmap capabilities must not become live product/schema claims. Preview remains noindex; production homepage must not inherit workshop noindex. |
| API/session transport | `next.config.js` `/api/:path*` rewrite and security headers | Preserve same-origin proxy, credentials and cache/referrer policy. No cross-origin replacement calls. |

## Main differences found in the prototype

1. The header is a workshop header; it lacks real session-aware account controls.
2. Signup links are absolute production URLs. Integration needs existing local routes/referral handling so staging cannot accidentally start production flows.
3. Offer figures are duplicated in HTML/JavaScript rather than derived from `billingOffer`.
4. Existing links use `/#pricing`, `/#faq`, `/#download`, `/#waitlist`, `/#deal-desk` and `/#documents`. New sections use different IDs. Preserve the old anchors as aliases to the appropriate new sections.
5. Workshop editors and local saved copy are mixed with animation initialization. Simply removing the editor markup would throw in `hero.js`, `workflow.js`, `closing.js` and other form setup. Extract the production motion from editor code before removing it.
6. Prototype scripts attach global listeners and own GSAP timelines/WebGL instances. A Next client navigation must tear these down; otherwise animation state, body transforms or observers can leak into signup/admin pages. Existing `pagehide` listeners alone do not cover client navigation.
7. Global prototype rules (`body`, headings, `button`, `dialog`, `.nav`, etc.) can restyle account/admin pages if imported unchanged. Scope the new homepage styles and keep existing shared CSS untouched.
8. The font is Inter in the approved design; existing account pages use Geist. Scope Inter to the new homepage so this migration does not unexpectedly restyle the entire application.
9. Private review controls, export buttons, original-art links, debug dataset/UI, source renders and retired assets are not customer-facing functionality.
10. The existing footer includes audience/Playbooks and official social links missing from the new footer. Carry these links into the monochrome design.

## Asset and copy preservation

The reviewed copy was captured from the browser's explicit editable fields and headings, including saved workshop edits. It is stored in `outputs/funnel-migration-20261108/approved-copy.json`; no account credentials or unrelated browser storage were collected.

`outputs/funnel-migration-20261108/approved-reference/` is a hash-verified design reference, **not a deployable production package**. Its HTML still includes workshop markup so it can be used for comparison.

Inventory result:

- 415 referenced/dependency files, **20,338,949 bytes** total.
- Full prototype `assets/` directory: 770 files, 185,594,920 bytes.
- 409 unreferenced asset candidates, 167,483,795 bytes. Preserve the source files; omit these candidates from the production allowlist after final runtime comparison.
- Four explicitly inventoried frame sets: handshake 96, aspiration handshake 96, watch 96, car 16.
- No missing declared files.
- These sizes are a conservative static dependency inventory, **not a measured initial download or transfer budget**. It includes some declared assets/styles that can be removed during the native port.

Deploy new assets under a versioned `public/funnel-v3/` prefix. Keep existing public assets used by auth, other pages and old cached builds. Preserve provenance/license files for GSAP, shaders, models, fonts and artwork alongside the source. Use lazy section loading and static fallbacks; do not preload all frames.

## Implementation order

1. **Native homepage shell and real controls.** Create a new `FunnelHome` with scoped CSS, original navigation/session behavior, shared pricing data, signup/referral adapter, official social links and legacy anchor aliases. Keep the old homepage component available.
2. **Port the approved sections without visual redesign.** Use server-rendered semantic copy and React components for controls. Wrap motion initialization in owned component effects with cleanup (`gsap.context`/media revert, owned ScrollTriggers, event listeners, RAF, observers, requests and WebGL dispose). Import shared GSAP/Three modules instead of embedding multiple complete Three bundles.
3. **Remove workshop dependencies.** Keep editing in the separate workshop. Commit approved copy as site content; visitors' old localStorage must not replace production copy. Keep illustrations and planned-feature labels.
4. **Add a disabled release switch.** A server-side deployment setting such as `MERGER_FUNNEL_VERSION=3` selects the new homepage. Default remains the old homepage until acceptance. Staging enables the candidate; rollback disables it/redeploys the previous Vercel artifact. Never use a client localStorage flag for release selection.
5. **Exercise both presentations in the actual app.** Verify screenshot parity and all routes below with synthetic accounts and test-mode checkout. Use a dedicated preview backend/fixtures, not a broad environment pointing write tests at production. A preview hostname alone is not a backend sandbox.
6. **Final production configuration review.** Confirm the actual current Vercel deployment ID/env configuration and rollback artifact at release time, rebase if main moved, review the final diff, then promote the same tested artifact. No database migration is needed for this homepage release.

## Acceptance matrix for the integrated candidate

All items here are pending until the new homepage exists; baseline passing tests do not make these passed.

| Scenario | Required evidence |
| --- | --- |
| Anonymous visitor | Correct sign-in/signup/download paths; no admin controls; loading/auth failure handled; no hydration errors. |
| Signed-in member | Account identity, Open dashboard, billing/profile/download navigation and successful sign out. |
| Full admin | Existing users, waitlist, campaigns and growth pages reachable and unchanged; permission failures handled. |
| Limited staff / normal user | Existing capabilities control access; no admin rights inferred from cached nav state; 401/403 verified in fixtures. |
| Password / Google signup and login | Redirect/callback behavior, verification, failed provider response and return navigation preserved. Real Google acceptance only in the intended test account when needed. |
| Referral + UTM entry | Enter through campaign URL; visit offer; signup payload retains referral/attribution; no invite token confusion. |
| Monthly / annual | Visible totals agree with shared config; test checkout request uses selected interval; success/cancel/failure return paths remain correct. No real charges for QA. |
| Existing customer states | Entitled, unpaid, complimentary, grandfathered and expired account handling matches baseline. |
| Navigation lifecycle | Homepage → login/dashboard/admin → back repeatedly; no duplicate listeners/canvases, frozen scrolling, invisible content or leaked styles. |
| Old links | Pricing/FAQ/download/waitlist/deal/document anchors and all existing route patterns resolve. |
| Motion + responsiveness | Desktop, touch/mobile, narrow/short viewport, keyboard, reduced motion, WebGL unavailable, failed assets, resize and scroll restore. Compare with approved reference. |
| Performance | Measure cold first load and full scroll separately; defer offscreen videos/frames/WebGL, bound decoded memory, pause when hidden. Compare main-thread/transfer/load measurements with baseline. |
| SEO | Server HTML contains readable headings/FAQ; production indexable; preview noindex; canonical/schema/OG/robots/sitemap/llms remain coherent; no prototype URLs or workshop controls. |

## Release and rollback

This work is a homepage release only. No desktop/iOS binaries, encryption migration, DM rollout, bridge changes, backend deployment, database movement or campaign sending is part of it.

Before release, record the current Vercel deployment ID and exact tested candidate SHA. Keep the old homepage and assets available. Promote the tested artifact in the same project/domain. Check anonymous homepage, sign-in/account navigation, admin access, checkout initiation in test mode, downloads and API health immediately afterward. A functional regression rolls back to the recorded deployment; it must not be patched by changing permissions, checkout settings or customer data.

## Current status

Preparation complete: branch, reviewed copy/reference snapshot, dependency inventory, route/control map, baseline tests/build, preservation fence and rollout/rollback plan. **Native integration, candidate acceptance and production promotion remain pending.** The live homepage remains unchanged.

Commands from the integration checkout:

```powershell
node scripts/check-funnel-preservation.mjs
npm test
npm run build
```

The preservation script intentionally fails on a changed retained file. Review any necessary shared-file changes explicitly; do not regenerate its baseline merely to make it pass.
