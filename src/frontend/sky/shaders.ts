export const STAR_VERTEX = /* glsl */ `
attribute float aSize;
attribute float aPhase;
uniform float uTime;
uniform float uPixelRatio;
uniform float uTwinkle;
uniform float uDprCap;
varying float vAlpha;
varying float vBright;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float twinkle = 0.62 + 0.38 * sin(uTime * (0.35 + aPhase * 0.9) + aPhase * 6.28318);
  vAlpha = mix(0.82, twinkle, uTwinkle);
  vBright = aPhase;
  float size = aSize * min(uPixelRatio, uDprCap) * (170.0 / max(1.2, -mvPosition.z));
  gl_PointSize = clamp(size, 0.6, 7.5);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const STAR_FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uDim;
uniform vec3 uMid;
uniform vec3 uBright;
uniform vec3 uLantern;
varying float vAlpha;
varying float vBright;

void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float d = length(c);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.08, d);
  float halo = smoothstep(0.5, 0.0, d) * 0.35;
  vec3 col = mix(uDim, uMid, clamp(vBright * 1.4, 0.0, 1.0));
  col = mix(col, uBright, step(0.72, vBright));
  col = mix(col, uLantern, step(0.93, vBright));
  float alpha = (core + halo) * vAlpha;
  gl_FragColor = vec4(col, alpha);
}
`;

export const SHOOT_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aSeed;
varying float vAlpha;

void main() {
  float t = fract(uTime * 0.04 + aSeed);
  vec3 p = position;
  p.x += t * 18.0 - 4.0;
  p.y -= t * 7.0;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  vAlpha = smoothstep(0.0, 0.08, t) * smoothstep(1.0, 0.72, t);
  gl_PointSize = 2.4 * min(uPixelRatio, 2.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const SHOOT_FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float d = length(c);
  if (d > 0.5) discard;
  gl_FragColor = vec4(uColor, (1.0 - d * 2.0) * vAlpha);
}
`;

export const SKY_PALETTE = {
  dim: [0.478, 0.541, 0.525] as const,
  mid: [0.788, 0.831, 0.784] as const,
  bright: [0.957, 0.906, 0.765] as const,
  lantern: [0.949, 0.706, 0.361] as const,
};
