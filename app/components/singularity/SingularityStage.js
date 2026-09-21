'use client';

/**
 * The WebGL stage: a thin wrapper around the approved Singularity component.
 *
 * It exists for one reason — to tell MergeHero the module has arrived and
 * rendered, so the first-paint poster can fade. Singularity has no mount
 * callback of its own and is not modified here; the moment it renders it draws
 * its own SVG inspection fallback, so there is always something on screen from
 * this point on, which is exactly when the poster stops being needed.
 *
 * Everything else — the WebGL2 probe, reduced motion, the <=720px compact
 * mode, the IntersectionObserver frameloop gate, the graphics error boundary,
 * context-loss recovery, drag/keyboard interaction — belongs to Singularity
 * and is deliberately not duplicated here.
 */

import { useEffect } from 'react';
import Singularity from './Singularity';

export default function SingularityStage({ onMounted, ...rest }) {
  useEffect(() => { onMounted?.(); }, [onMounted]);
  return <Singularity {...rest} />;
}
