import { useEffect, useRef, useSyncExternalStore } from 'react';
import { DEFAULT_PARTICLE_COUNT, MOUSE_INTERACTION_MAX_DIST, LOOP_DURATION_MS, PARTICLE_TEXT_ASSEMBLY_OFFSET_MS, PARTICLE_DISSOLVE_OFFSET_BASE_MS, PARTICLE_TEXT_CHAR_SPACING_MS, PARTICLE_EASE_DURATION_MS } from '@/src/lib/constants';
import type { TextParticle, LinkState, MouseState } from '../types';
import {
  measureTextTargets,
  resizeCanvas,
  initParticles,
  drawLinks,
  drawParticles,
  getLinesOpacity,
  updateTextDOM,
} from '../utils/canvasRenderer';
import { easeInOutCubic, spring } from '../utils/animation';

// useSyncExternalStore requires three functions: subscribe, getSnapshot, getServerSnapshot.
// We bridge matchMedia here so React can track reduced-motion changes without layout thrash.
function subscribeToReducedMotion(onChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getServerReducedMotionSnapshot() {
  return false;
}

export interface UseParticleCanvasOptions {
  particleCount?: number;
  enableTextAssemble?: boolean;
  textChars?: string[];
  onReady?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
}

export function useParticleCanvas(options: UseParticleCanvasOptions = {}) {
  const {
    particleCount = DEFAULT_PARTICLE_COUNT,
    enableTextAssemble = false,
    textChars = [],
  } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<MouseState>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    isActive: false,
  });
  const mouseEasedRef = useRef<MouseState>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    isActive: false,
  });
  const mouseImpactRef = useRef(0);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());
  const particlesRef = useRef<TextParticle[]>([]);
  const activeLinksRef = useRef<Map<string, LinkState>>(new Map());
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getServerReducedMotionSnapshot);
  const textCharsKey = textChars.join(');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, isActive: true };
    };
    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    };

    resizeHandlerRef.current = () =>
      resizeCanvas(canvas, ctx, () => measureTextTargets(enableTextAssemble ? charRefs.current : [], textChars, particlesRef.current), activeLinksRef);
    window.addEventListener('resize', resizeHandlerRef.current);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    particlesRef.current = initParticles(particleCount, enableTextAssemble, textChars);
    resizeCanvas(canvas, ctx, () => measureTextTargets(enableTextAssemble ? charRefs.current : [], textChars, particlesRef.current), activeLinksRef);
    lastTimeRef.current = Date.now();

    const maxDist = MOUSE_INTERACTION_MAX_DIST;
    const LOOP_DURATION = LOOP_DURATION_MS;
    const startTime = Date.now();

    const render = () => {
      const now = Date.now();
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const loopTime = (now - startTime) % LOOP_DURATION;

      if (mouseRef.current.isActive) {
        mouseImpactRef.current += (1 - mouseImpactRef.current) * 0.1;
      } else {
        mouseImpactRef.current += (0 - mouseImpactRef.current) * 0.05;
        mouseRef.current.x += (w / 2 - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (h / 2 - mouseRef.current.y) * 0.05;
      }
      mouseEasedRef.current.x += (mouseRef.current.x - mouseEasedRef.current.x) * 0.1;
      mouseEasedRef.current.y += (mouseRef.current.y - mouseEasedRef.current.y) * 0.1;
      const mx = mouseEasedRef.current.x;
      const my = mouseEasedRef.current.y;

      // Mouse influence decays exponentially when inactive and lerps toward viewport center.
      // A separate eased ref smooths the final position to avoid jitter in particle repulsion.

      const particles = particlesRef.current;
      const isHome = enableTextAssemble;

      if (isHome && charRefs.current) {
        updateTextDOM(charRefs.current, textChars, loopTime);
      }

      for (const p of particles) {
        p.x += p.vx * (dt / 16.66);
        p.y += p.vy * (dt / 16.66);

        if (isHome && p.isText) {
          const tp = p as TextParticle;
          // Characters assemble in sequence and dissolve in reverse, creating a looped text animation.
          const assembleStart = PARTICLE_TEXT_ASSEMBLY_OFFSET_MS + tp.textCharIndex * PARTICLE_TEXT_CHAR_SPACING_MS;
          const dissolveStart = PARTICLE_DISSOLVE_OFFSET_BASE_MS + (textChars.length - 1 - tp.textCharIndex) * PARTICLE_TEXT_CHAR_SPACING_MS;
          let progress = 0;

          if (loopTime >= assembleStart && loopTime < dissolveStart) {
            progress = spring((loopTime - assembleStart) / 1000);
          } else if (loopTime >= dissolveStart) {
            const elapsed = loopTime - dissolveStart;
            if (elapsed < PARTICLE_EASE_DURATION_MS) progress = 1 - easeInOutCubic(elapsed / PARTICLE_EASE_DURATION_MS);
          }

          if (progress < 0.001) {
            if (p.x < -100) p.x += w + 200;
            else if (p.x > w + 100) p.x -= w + 200;
            if (p.y < -100) p.y += h + 200;
            else if (p.y > h + 100) p.y -= h + 200;
          }

          if (progress > 0 && tp.textTarget) {
            const dx = tp.textTarget.x - p.x;
            const dy = tp.textTarget.y - p.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;
            // Arc motion sweeps particles along a perpendicular curve as they converge on their target.
            const arc = Math.sin(progress * Math.PI) * tp.arcHeight;
            p.x = p.x + dx * progress + nx * arc;
            p.y = p.y + dy * progress + ny * arc;
          }
        } else {
          if (p.x < -100) p.x += w + 200;
          else if (p.x > w + 100) p.x -= w + 200;
          if (p.y < -100) p.y += h + 200;
          else if (p.y > h + 100) p.y -= h + 200;
        }

        if (mouseImpactRef.current > 0.01) {
          const mdx = p.x - mx;
          const mdy = p.y - my;
          const mdistsq = mdx * mdx + mdy * mdy;
          if (mdistsq < maxDist * maxDist && mdistsq > 0) {
            const dist = Math.sqrt(mdistsq);
            // Repulsion force peaks at the mouse center and falls off cubically for a snappy push.
            const force = Math.pow(1 - dist / maxDist, 3) * 150 * mouseImpactRef.current;
            p.x += (mdx / dist) * force;
            p.y += (mdy / dist) * force;
          }
        }
      }

      const linesOpacity = getLinesOpacity(loopTime);
      drawLinks(ctx, particles, activeLinksRef.current, dt, linesOpacity);
      drawParticles(ctx, particles, now);

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameRef.current);
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [reducedMotion, particleCount, enableTextAssemble, textChars, textCharsKey]);

  return {
    canvasRef,
    charRefs: enableTextAssemble ? charRefs : undefined,
    reducedMotion,
    particleCount,
  };
}
