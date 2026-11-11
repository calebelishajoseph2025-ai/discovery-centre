import { useEffect, useRef, useState } from 'react';
import {
  detectWebGL,
  evaluateSkyQuality,
  readHardwareConcurrency,
  readSaveData,
  SkyQuality,
} from './quality.ts';
import { CssStarField } from './fallback.tsx';
import {
  SHOOT_FRAGMENT,
  SHOOT_VERTEX,
  SKY_PALETTE,
  STAR_FRAGMENT,
  STAR_VERTEX,
} from './shaders.ts';
import { shouldReduceMotion } from '../design/motion.ts';

interface StarFieldProps {
  label: string;
  quiet: boolean;
}

async function mountScene(
  canvas: HTMLCanvasElement,
  quality: Exclude<SkyQuality, 'off' | 'css'>,
  reduced: boolean
): Promise<() => void> {
  const THREE = await import('three');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: quality === 'high' ? 'high-performance' : 'low-power',
  });
  renderer.setClearColor(0x000000, 0);
  const dpr = Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : 1.25);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
  camera.position.z = 8;

  const count = quality === 'high' ? 1400 : 700;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 28;
    positions[i * 3 + 1] = (Math.random() - 0.2) * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    sizes[i] = 0.6 + Math.random() * 2.2;
    phases[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL1,
    vertexShader: STAR_VERTEX,
    fragmentShader: STAR_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: dpr },
      uTwinkle: { value: reduced ? 0 : 1 },
      uDprCap: { value: quality === 'high' ? 2 : 1.25 },
      uDim: { value: new THREE.Vector3(...SKY_PALETTE.dim) },
      uMid: { value: new THREE.Vector3(...SKY_PALETTE.mid) },
      uBright: { value: new THREE.Vector3(...SKY_PALETTE.bright) },
      uLantern: { value: new THREE.Vector3(...SKY_PALETTE.lantern) },
    },
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let shootGeom: InstanceType<typeof THREE.BufferGeometry> | null = null;
  let shootMat: InstanceType<typeof THREE.ShaderMaterial> | null = null;
  if (quality === 'high' && !reduced) {
    const shootCount = 4;
    const shootPos = new Float32Array(shootCount * 3);
    const seeds = new Float32Array(shootCount);
    for (let i = 0; i < shootCount; i += 1) {
      shootPos[i * 3] = -10 + Math.random() * 6;
      shootPos[i * 3 + 1] = 4 + Math.random() * 4;
      shootPos[i * 3 + 2] = -2;
      seeds[i] = Math.random();
    }
    shootGeom = new THREE.BufferGeometry();
    shootGeom.setAttribute('position', new THREE.BufferAttribute(shootPos, 3));
    shootGeom.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    shootMat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL1,
      vertexShader: SHOOT_VERTEX,
      fragmentShader: SHOOT_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: dpr },
        uColor: { value: new THREE.Vector3(...SKY_PALETTE.bright) },
      },
    });
    scene.add(new THREE.Points(shootGeom, shootMat));
  }

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  };
  resize();

  let raf = 0;
  let running = true;
  const clock = new THREE.Clock();
  const tick = () => {
    if (!running) return;
    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;
    if (shootMat) shootMat.uniforms.uTime.value = t;
    if (!reduced) {
      points.rotation.y = t * 0.012;
      points.rotation.x = Math.sin(t * 0.05) * 0.02;
    }
    renderer.render(scene, camera);
    raf = window.requestAnimationFrame(tick);
  };
  raf = window.requestAnimationFrame(tick);

  const onResize = () => resize();
  window.addEventListener('resize', onResize);

  return () => {
    running = false;
    window.cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    geometry.dispose();
    material.dispose();
    shootGeom?.dispose();
    shootMat?.dispose();
    renderer.dispose();
  };
}

export default function StarField({ label, quiet }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [quality, setQuality] = useState<SkyQuality>('css');
  const [inView, setInView] = useState(true);
  const [hidden, setHidden] = useState(
    typeof document === 'undefined' ? false : document.hidden
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        setInView(entries[0]?.isIntersecting ?? true);
      },
      { threshold: 0.02 }
    );
    io.observe(host);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const reduced = shouldReduceMotion() || quiet;
    const next = evaluateSkyQuality({
      reducedMotion: reduced,
      quiet,
      saveData: readSaveData(),
      hardwareConcurrency: readHardwareConcurrency(),
      webgl: detectWebGL(),
      hidden,
      inView,
    });
    setQuality(next);
  }, [quiet, hidden, inView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (quality !== 'low' && quality !== 'high') return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const reduced = shouldReduceMotion() || quiet;
    const boot = () => {
      void mountScene(canvas, quality, reduced).then((fn) => {
        if (cancelled) fn();
        else cleanup = fn;
      });
    };
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const handle = ric(boot);
    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(handle as number);
      } else {
        window.clearTimeout(handle as number);
      }
      cleanup?.();
    };
  }, [quality, quiet]);

  const showCanvas = quality === 'low' || quality === 'high';

  return (
    <div
      ref={hostRef}
      data-sky={quality}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: 'var(--sky-opacity)' }}
    >
      {showCanvas ? (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <CssStarField label={label} />
      )}
      {showCanvas ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
