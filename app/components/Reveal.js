'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * The one reveal-on-scroll primitive. Every section uses this; nothing defines
 * its own timing.
 *
 * WHY ONE COMPONENT. The measured lesson from the reference sites is that the
 * discipline matters more than the curve — Linear ships exactly one easing
 * across their whole site. Per-element timings are what make a page feel
 * assembled by several people, and this page has one voice.
 *
 * The curve and durations live in CSS custom properties (landing.css) but
 * Framer needs numbers, so the two are kept in sync here deliberately: .22 1
 * .36 1 is `--ease`, .48s is `--dur-move`. If one changes the other must.
 */

const EASE = [0.22, 1, 0.36, 1];
const DUR = 0.48;
/** Enough to read as sequence, short enough not to feel like a queue. */
const STAGGER = 0.06;

export default function Reveal({
  children,
  as = 'div',
  delay = 0,
  /** How far it travels. Small — this is a settle, not an entrance. */
  y = 18,
  className,
  ...rest
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as] || motion.div;

  // Under reduced motion the element is simply present. Not a faster animation
  // — none at all, which is what the preference actually asks for.
  if (reduced) {
    const Plain = as;
    return <Plain className={className} {...rest}>{children}</Plain>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      // once: a section that re-animates every time it scrolls back into view
      // turns the page into a slideshow. amount: 0.2 fires when a fifth of it
      // is showing, so it has finished by the time it is being read.
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DUR, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Convenience for lists: index-based stagger without per-item delay maths. */
export function RevealItem({ index = 0, ...props }) {
  return <Reveal delay={index * STAGGER} {...props} />;
}
