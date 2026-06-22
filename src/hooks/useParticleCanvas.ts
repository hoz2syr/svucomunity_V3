import { useEffect, useRef, useState } from 'react';
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

export interface UseParticleCanvasOptions {
  particleCount?: number;
  enableTextAssemble?: boolean;
  textChars?: string[];
  onReady?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
}

export function useParticleCanvas(options: UseParticleCanvasOptions = {}) {
  const {
    particleCount = 80,
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
  const charRefs = enableTextAssemble ? useRef<(HTMLSpanElement | null)[]>([]) : null;
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(isReduced);

    if (isReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, isActive: true };
    };
    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    };

    resizeHandlerRef.current = () =>
      resizeCanvas(canvas, ctx, () => measureTextTargets(charRefs?.current ?? [], textChars, particlesRef.current), activeLinksRef);
    window.addEventListener('resize', resizeHandlerRef.current);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    particlesRef.current = initParticles(particleCount, enableTextAssemble, textChars);
    resizeCanvas(canvas, ctx, () => measureTextTargets(charRefs?.current ?? [], textChars, particlesRef.current), activeLinksRef);
    lastTimeRef.current = Date.now();

    const maxDist = 200;
    const LOOP_DURATION = 8000;
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
      const px = (mx - w / 2) * -0.04;
      const py = (my - h / 2) * -0.04;

      const gx = w / 2 + Math.cos(now * 0.0003) * w * 0.2 + (px * -2.5);
      const gy = h / 2 + Math.sin(now * 0.0002) * h * 0.2 + (py * -2.5);
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.8);
      grad.addColorStop(0, '#111835');
      grad.addColorStop(1, '#04081c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;
      const isHome = enableTextAssemble;

      if (isHome && charRefs?.current) {
        updateTextDOM(charRefs.current, textChars, loopTime);
      }

      for (const p of particles) {
        p.x += p.vx * (dt / 16.66);
        p.y += p.vy * (dt / 16.66);

        if (isHome && p.isText) {
          const tp = p as TextParticle;
          const assembleStart = 500 + tp.textCharIndex * 50;
          const dissolveStart = 6500 + (textChars.length - 1 - tp.textCharIndex) * 50;
          let progress = 0;

          if (loopTime >= assembleStart && loopTime < dissolveStart) {
            progress = spring((loopTime - assembleStart) / 1000);
          } else if (loopTime >= dissolveStart) {
            const elapsed = loopTime - dissolveStart;
            if (elapsed < 1000) progress = 1 - easeInOutCubic(elapsed / 1000);
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
  }, [reducedMotion, particleCount, enableTextAssemble, textChars.join('')]);

  return {
    canvasRef,
    charRefs: charRefs ?? undefined,
    reducedMotion,
    particleCount,
  };
}
