export const RELEASE_DURATION = 3.1;
export const INSPECTION_DURATION = 28;

// A continuous turn that slows at each readable front/back silhouette.
export function inspectionAngle(seconds) {
  const turn = seconds / INSPECTION_DURATION * Math.PI * 2;
  return turn - .19 * Math.sin(turn * 2);
}

export function inspectionAmount(angle) {
  const side = Math.abs(Math.sin(angle));
  const t = Math.max(0, Math.min(1, (side - .25) / .66));
  return t * t * (3 - 2 * t);
}

export function inspectionPhase(angle, amount = inspectionAmount(angle)) {
  if (amount < .015) return 'Logo aligned';
  if (amount > .94) return 'Singularity exposed';
  return Math.sin(angle * 2) > 0 ? 'Opening into orbit' : 'Drawn back together';
}

export function inspectionScale(amount, aspect) {
  const narrowCompensation = Math.max(0, Math.min(.2, (1.3 - aspect) * .4));
  return 1 - Math.max(0,amount) * (.27 + narrowCompensation);
}

// The far and near layers alternate so an edge-on view reads as a volume.
// Every offset and tumble vanishes in the readable logo-facing window.
export function fragmentTransform(index, base, amount, seconds) {
  const phase = seeded(index,8) * Math.PI * 2;
  const radial = Math.hypot(base[0], base[1] + .255) || 1;
  const reach = .6 + seeded(index,2) * .5;
  const side = index % 2 === 0 ? 1 : -1;
  const depth = side * (1.1 + seeded(index,4) * .8);
  const orbit = seconds * .23 + phase;
  return {
    position: [
      base[0] + amount * (base[0] / radial * reach + Math.cos(orbit) * .19),
      base[1] + amount * ((base[1] + .255) / radial * reach + Math.sin(orbit * .8) * .17),
      base[2] + amount * (depth + Math.sin(orbit) * .21),
    ],
    rotation: [
      amount * ((seeded(index,3) - .5) * 1.15 + Math.sin(orbit) * .15),
      amount * ((seeded(index,5) - .5) * 1.6 + Math.cos(orbit) * .18),
      amount * ((seeded(index,6) - .5) * .85 + Math.sin(orbit*.7) * .1),
    ],
  };
}

// Fast fracture, a suspended beat, then an accelerating gravitational return.
export function releaseAmount(seconds) {
  if (seconds < 0 || seconds >= RELEASE_DURATION) return 0;
  if (seconds < 0.48) return 1 - Math.pow(1 - seconds / 0.48, 3);
  if (seconds < 1.25) return 1 + Math.sin((seconds - 0.48) * 4) * 0.018;
  if (seconds < 2.65) {
    const t = (seconds - 1.25) / 1.4;
    return 1 - (Math.pow(2, 9 * t) - 1) / 511;
  }
  const impact = seconds - 2.65;
  return -Math.sin(impact * 35) * Math.exp(-impact * 11) * 0.055;
}

export function releasePhase(seconds) {
  if (seconds < 0 || seconds >= RELEASE_DURATION) return 'In equilibrium';
  if (seconds < 0.48) return 'Releasing';
  if (seconds < 1.25) return 'Suspended';
  if (seconds < 2.65) return 'Returning to the core';
  return 'Reassembling';
}

export function seeded(index, salt = 1) {
  const value = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}
