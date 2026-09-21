# Singularity waitlist preview

Preview: https://merger-orbit-preview.vercel.app/

Built from `funnel/waitlist-referrals` at `632e28c` in an isolated worktree on `codex/singularity-waitlist-preview`. The original checkout and usemerger.com deployment were not changed.

## Design decisions

- Lead with the product promise, then demonstrate it before presenting the full waitlist form. All primary actions still go straight to the form.
- Preserve the approved fractured obsidian/gold 3D hero and its existing mobile and no-WebGL fallback.
- Use the same Geist and Geist Mono family with a more deliberate hierarchy, tighter display typography, warmer secondary tones, and varied section layouts.
- ChannelOrbit uses lightweight SVG/DOM animation: ten channel icons orbit, gather into a diamond formation, and release. Selecting a channel changes a fictional inbox; selecting Merger restores the combined view.
- SingularityButton uses six animated shell fragments over a gold core and fine threads. Type stays readable while the shell moves. Hover, focus, and press bring the shell together. The form retains native submission behavior and a stable busy label.
- Per the September 21 preference, keep ChannelOrbit for feature 1 and use the original approved AI deal-detection and DocuSign films for features 2 and 3. Both films have full-width frames, explicit pause/play, offscreen pausing, and reduced-motion posters. The interactive DealStory component remains in source for future use but is not mounted on the landing page.
- Keep both approved films visible in their own sections instead of hiding product proof in one tab group.
- Separate joining the free waitlist from accepting an invitation and starting the future paid trial. Pricing remains $50/month after 14 days, retained while alpha membership stays active.

## Main code

- `app/page.js` and `app/singularity-funnel.css`: complete marketing-page layout.
- `app/components/ChannelOrbit.js` and `channel-orbit.css`: orbital channel illustration and sample inbox.
- `app/components/DealStory.js` and `deal-story.css`: interactive four-stage workflow.
- `app/components/SingularityButton.js` and `singularity-button.css`: reusable native link/button.
- Existing waitlist/referral/account APIs remain intact. No messages or documents are sent by the illustrative demos.

## Validation

- September 21 film preference update: restored the approved AI deal-detection film, retained the original DocuSign film, and widened both frames. The 12 existing film/workflow tests passed, the Vercel build succeeded, desktop and 390px layouts were inspected, and published AI video pause/resume was verified. Deployment: `https://merger-orbit-preview-ankfoh71a-merger1.vercel.app`.
- Vercel production build succeeded for the separate `merger-orbit-preview` project.
- 90 Vitest tests and 4 synthetic HTTP API tests passed.
- Desktop, 390px and 320px layouts checked visually. Channel filtering, reviewed deal filing, document preparation, contact insertion, mobile navigation, and waitlist validation checked through the UI.
- Published preview channel selection and deal filing checked. No new page console errors observed.
- Hydration coordinates round to three decimals to prevent engine-specific trigonometric precision mismatches.

## Existing backend limitations

- The backend only accepts waitlist joins from usemerger.com/www.usemerger.com. Real registration is blocked on this preview origin. Mocked success, referral, retry, and pending states are covered by the existing form tests; no test entries were sent to the real list.
- The existing invitation gate is frontend-only. Before paid onboarding opens, invitation validation and redemption must also be enforced by the backend.

## Suggested next product discussion

Clarify Deal Desk progression: stages, deal owners, next actions and reminders, source-linked AI suggestions, and explicit review before sending. A definitive channel availability matrix and genuine alpha-user feedback will strengthen the funnel further.
