import { ScreenSlot } from './DeviceMockup';

/**
 * The mobile section: a photoreal hand holding a phone, with the app playing
 * on its screen.
 *
 * ═══ WHAT GOES HERE, AND WHERE ═════════════════════════════════════════════
 *
 * TWO assets, swapped independently:
 *
 *   1. THE HAND. A photoreal image of a hand holding a phone, shot or
 *      generated, ideally a PNG with the background cut out so it can overlap
 *      the section edge. Drop it at /public/showcase/hand-phone.png and pass:
 *
 *        <HandPhone hand="/showcase/hand-phone.png" />
 *
 *      Until one exists this renders a CLEARLY MARKED stand-in — a CSS phone
 *      at roughly the right angle — so the composition can be judged without
 *      anyone mistaking it for the finished thing.
 *
 *   2. THE SCREEN. The same slot every other mockup uses:
 *
 *        <HandPhone hand="..." media={{ src: '/showcase/mobile.mp4' }} />
 *
 * ═══ MATCHING THE SCREEN TO THE PHOTO ══════════════════════════════════════
 *
 * The screen is a positioned, perspective-transformed quad laid over the
 * phone in the image. Every number that pins it is a CSS custom property on
 * .hp-figure in showcase.css, in one block marked SCREEN QUAD:
 *
 *     --quad-top / --quad-left / --quad-w / --quad-h   where it sits
 *     --quad-rx / --quad-ry / --quad-rz                the phone's angle
 *     --quad-radius                                     corner rounding
 *
 * Swapping in a real photograph means opening that block and tuning those
 * seven values against it — nothing else changes, and no JavaScript is
 * involved. Set them with the video visible; the fit is obvious when it is
 * wrong and invisible when it is right.
 *
 * ═══ WHY NOT A 3D HAND ═════════════════════════════════════════════════════
 *
 * Because a real-time 3D hand looks like a real-time 3D hand. Skin, nails and
 * the way fingers deform around a hard edge are exactly what realtime
 * rendering is worst at, and the uncanny version is worse than no hand. A
 * photograph with a video masked onto the screen is how the reference does
 * it, and it costs one image plus one composited transform. The only true 3D
 * on this site stays the hero gem, which is a faceted object and the one
 * shape realtime rendering flatters.
 */

export default function HandPhone({ hand, media, alt = 'Merger running on a phone' }) {
  return (
    <figure className="hp-figure">
      {hand
        ? <img className="hp-photo" src={hand} alt={alt} loading="lazy" decoding="async" />
        : (
          /* The stand-in. Deliberately plain and deliberately labelled: the
             point of the placeholder is that nobody can mistake it for the
             photograph that replaces it. */
          <div className="hp-standin" aria-hidden="true">
            <div className="hp-standin-phone" />
            <span className="hp-standin-tag">Hand + phone photo goes here</span>
          </div>
        )}
      <div className="hp-screen">
        <ScreenSlot media={media} tag="Preview" note={null} />
      </div>
    </figure>
  );
}
