import Link from 'next/link';
import { ScreenSlot } from './DeviceMockup';
import { ALPHA_OFFER } from '../lib/billingOffer';

/**
 * The mobile section: a photograph of a hand holding a phone, with the app
 * playing on its screen.
 *
 * ═══ THE TWO ASSETS ════════════════════════════════════════════════════════
 *
 *   1. THE PHOTO — /showcase/hand-phone.webp, in the repo.
 *      The 4K master it came from is beside it as hand-phone.png (3089×4096,
 *      1.6MB). The webp is 1200px wide and 56KB, which is the one that ships:
 *      the slot renders at most ~480 CSS px, so the master is roughly three
 *      times more pixels than any screen can use and a hundred times the
 *      bytes. Re-derive it if the master ever changes.
 *
 *   2. THE SCREEN — the same swappable slot every other mockup uses:
 *
 *        <HandPhone media={{ src: '/showcase/mobile.mp4' }} />
 *
 *      until which point it shows the navy + gem + "Preview" placeholder.
 *
 * ═══ THE SCREEN QUAD, MEASURED RATHER THAN EYEBALLED ═══════════════════════
 *
 * The quad's numbers in showcase.css were read off the photograph, not judged
 * by eye. The phone's frame is markedly brighter than both the black glass and
 * the black backdrop, so walking each row inward from the outer rail until the
 * brightness drops gives the glass boundary directly:
 *
 *      glass left 1472px   right 2378px   top 762px   bottom 2690px
 *      → 47.653% / 18.604% from the left and top, 29.330% × 47.070%
 *
 * The left edge reads 1472 at both y=900 and y=2400, so the phone is genuinely
 * square to the camera — ALL THREE ROTATIONS ARE ZERO, and adding a decorative
 * tilt would put the video visibly off its glass. The 906 × 1928 glass is a
 * 0.470 ratio against a real iPhone's 0.462, which is the confirmation that
 * those edges are the screen and not the bezel.
 *
 * Those percentages are of the PHOTOGRAPH, so .hp-figure carries the photo's
 * own 3089/4096 aspect ratio — that is what makes them map one to one. A
 * different photo means re-running the measurement and replacing the block.
 *
 * ═══ WHY NOT A 3D HAND ═════════════════════════════════════════════════════
 *
 * Because a real-time 3D hand looks like a real-time 3D hand. Skin, nails and
 * the way fingers deform around a hard edge are exactly what realtime
 * rendering is worst at. The only true 3D on this site stays the hero gem.
 */

export default function HandPhone({
  hand = '/showcase/hand-phone.webp',
  media,
  alt = 'A hand holding a phone running Merger',
}) {
  return (
    <div className="hp-block">
      {/* Behind the phone, lit by the CTA below — see .hp-bloom. */}
      <span className="hp-bloom" aria-hidden="true" />
      <figure className="hp-figure">
        <img className="hp-photo" src={hand} alt={alt} width="1200" height="1591"
             loading="lazy" decoding="async" />
        <div className="hp-screen"><ScreenSlot media={media} tag="Preview" note={null} /></div>
      </figure>
      <Link className="mk-button hp-cta" href={ALPHA_OFFER.signupHref}>{ALPHA_OFFER.freeHeadline.replace(/\.$/, '')}</Link>
    </div>
  );
}
