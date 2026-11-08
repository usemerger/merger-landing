export const diskVertex = `
  varying vec2 vDisk;
  void main() {
    vDisk = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
export const diskFragment = `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uPulse;
  uniform float uFine;
  varying vec2 vDisk;
  void main() {
    float r = length(vDisk);
    float angle = atan(vDisk.y, vDisk.x);
    float inner = smoothstep(.155, .21, r);
    float outer = 1.0 - smoothstep(.39, .55, r);
    float current = pow(.5 + .5 * sin(angle * 3.0 + r * 45.0 - uTime * 2.7), 7.0);
    float strands = pow(.5 + .5 * sin(r * 124.0 + sin(angle * 4.0 - uTime) * 1.5), 13.0);
    float hotRim = exp(-abs(r - .186) * 91.0);
    float orbit = .55 + .45 * pow(.5 + .5 * sin(angle * 2.0 - uTime * 1.3), 2.0);
    float alpha = inner * outer * (.11 + strands * .5 + current * .45) * orbit;
    alpha += hotRim * (.58 + orbit * .4);
    alpha *= mix(.4, 1.2, uEnergy) * mix(1.0, .68, uFine);
    alpha += hotRim * uPulse * .28;
    vec3 amber = vec3(1.0, .49, .13);
    vec3 gold = vec3(1.0, .79, .39);
    vec3 ivory = vec3(1.0, .95, .77);
    vec3 color = mix(amber, gold, clamp(strands + current + .18, 0.0, 1.0));
    color = mix(color, ivory, hotRim * .76);
    gl_FragColor = vec4(color, alpha);
  }
`;
export const horizonVertex = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-p.xyz);
    gl_Position = projectionMatrix * p;
  }
`;
export const horizonFragment = `
  uniform float uEnergy;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 4.0);
    vec3 core = vec3(.003, .004, .007);
    vec3 corona = vec3(1.0, .65, .23) * (.58 + uEnergy * .65 + uPulse * .65);
    gl_FragColor = vec4(core + corona * rim, 1.0);
  }
`;
export const streamVertex = `
  attribute float aPhase;
  attribute float aArm;
  attribute float aSize;
  uniform float uTime;
  uniform float uEnergy;
  uniform float uPulse;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vHeat;
  void main() {
    float journey = fract(aPhase + uTime * (.073 + aArm * .007));
    float radius = mix(.58, .155, journey);
    float angle = aArm * 2.094395 + journey * 9.6 + uTime * .29;
    float lift = sin(journey * 6.283185 + aArm * 2.094395) * (.11 + (1.0 - journey) * .15);
    vec3 p = vec3(cos(angle) * radius, sin(angle) * radius * .78, lift);
    float tilt = .7 + aArm * .38;
    p = vec3(p.x, p.y * cos(tilt) - p.z * sin(tilt), p.y * sin(tilt) + p.z * cos(tilt));
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = clamp(aSize * uPixelRatio * (8.0 / max(1.0, -view.z)), 1.0, 5.0);
    vAlpha = sin(journey * 3.141593) * (.25 + uEnergy * .65) + uPulse * .12;
    vHeat = journey;
  }
`;
export const streamFragment = `
  varying float vAlpha;
  varying float vHeat;
  void main() {
    float r = length(gl_PointCoord - vec2(.5));
    float alpha = (1.0 - smoothstep(.09, .5, r)) * vAlpha;
    vec3 color = mix(vec3(1.0, .56, .15), vec3(1.0, .9, .59), vHeat);
    gl_FragColor = vec4(color, alpha);
  }
`;