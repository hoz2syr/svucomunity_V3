import type { Particle, TextParticle, LinkState } from '../types';
import { easeInOutQuad, easeInCubic, easeOutCubic } from '../utils/animation';

export function measureTextTargets(
  charRefs: (HTMLSpanElement | null)[],
  textChars: string[],
  particles: Particle[] | TextParticle[],
) {
  if (!charRefs || textChars.length === 0) return;
  const validChars: { index: number; rect: DOMRect }[] = [];
  charRefs.forEach((el, i) => {
    if (el && el.innerHTML !== '\u00A0' && el.innerHTML !== ' ') {
      const rect = el.getBoundingClientRect();
      validChars.push({ index: i, rect });
    }
  });
  if (validChars.length === 0) return;

  let assigned = 0;
  const textParticles = particles as TextParticle[];
  textParticles.forEach((p) => {
    if (p.isText) {
      const charObj = validChars[assigned % validChars.length];
      p.textCharIndex = charObj.index;
      p.textTarget = {
        x: charObj.rect.left + Math.random() * charObj.rect.width,
        y: charObj.rect.top + Math.random() * charObj.rect.height,
      };
      assigned++;
    }
  });
}

export function resizeCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  measureTargets: () => void,
  activeLinks: React.MutableRefObject<Map<string, LinkState>>,
) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  measureTargets();
  activeLinks.current.clear();
}

export function initParticles(
  particleCount: number,
  enableTextAssemble: boolean,
  textChars: string[],
): TextParticle[] {
  const textParticleCount = enableTextAssemble ? Math.min(textChars.length || 40, 40) : 0;
  const out: TextParticle[] = [];
  for (let i = 0; i < particleCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = 0.15 + Math.random() * 0.25;
    const base: Particle = {
      id: i,
      x: 0,
      y: 0,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      seed: Math.random(),
    };

    if (enableTextAssemble && i < textParticleCount) {
      out.push({
        ...base,
        isText: true,
        textTarget: null,
        textCharIndex: 0,
        arcHeight: (Math.random() - 0.5) * 120,
      });
      continue;
    }

    out.push({
      ...base,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      isText: false,
      textTarget: null,
      textCharIndex: 0,
      arcHeight: 0,
    });
  }

  return out;
}

export function drawLinks(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  activeLinks: Map<string, LinkState>,
  dt: number,
  linesOpacity: number,
) {
  ctx.lineWidth = 1;
  for (let i = 0; i < particles.length; i++) {
    const pi = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      const pj = particles[j];
      const dx = pj.x - pi.x;
      const dy = pj.y - pi.y;
      const key = `${i}-${j}`;

      if (Math.abs(dx) > 85 || Math.abs(dy) > 85) {
        if (activeLinks.has(key)) {
          const link = activeLinks.get(key)!;
          link.age -= dt;
          if (link.age <= 0) activeLinks.delete(key);
        }
        continue;
      }

      const d = Math.sqrt(dx * dx + dy * dy);

      if (d < 80) {
        if (!activeLinks.has(key)) activeLinks.set(key, { age: 0 });
        const link = activeLinks.get(key)!;
        link.age += dt;
      } else {
        if (activeLinks.has(key)) {
          const link = activeLinks.get(key)!;
          link.age -= dt;
          if (link.age <= 0) activeLinks.delete(key);
        }
      }
    }
  }

  activeLinks.forEach((link, key) => {
    const [i, j] = key.split('-').map(Number);
    const pi = particles[i];
    const pj = particles[j];
    const dx = pj.x - pi.x;
    const dy = pj.y - pi.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    let progress = Math.min(link.age / 400, 1);
    if (progress <= 0) return;
    progress = easeInOutQuad(progress);

    let alpha = linesOpacity * 0.4 * progress;
    const edgeFade = 1 - Math.min(d / 80, 1);
    alpha *= easeInOutQuad(edgeFade);

    if (alpha <= 0.01) return;

    const cx = (pi.x + pj.x) / 2;
    const cy = (pi.y + pj.y) / 2;
    const lx = ((pi.x - pj.x) / 2) * progress;
    const ly = ((pi.y - pj.y) / 2) * progress;

    ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(cx + lx, cy + ly);
    ctx.lineTo(cx - lx, cy - ly);
    ctx.stroke();
  });
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  now: number,
) {
  for (const p of particles) {
    const flicker = 0.4 + 0.3 * Math.sin(now * 0.005 + p.seed * 100);
    ctx.fillStyle = `rgba(255, 255, 255, ${flicker})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function getLinesOpacity(loopTime: number): number {
  if (loopTime < 1000) return easeInOutQuad(loopTime / 1000);
  if (loopTime < 7000) return 1;
  if (loopTime <= 8000) return 1 - easeInOutQuad((loopTime - 7000) / 1000);
  return 0;
}

export function updateTextDOM(
  charRefs: (HTMLSpanElement | null)[] | null,
  textChars: string[],
  loopTime: number,
) {
  if (!charRefs) return;
  charRefs.forEach((el, i) => {
    if (!el) return;
    const assembleStart = 500 + i * 50;
    const dissolveStart = 6500 + (textChars.length - 1 - i) * 50;
    let opacity = 0;
    let blur = 10;

    if (loopTime >= assembleStart && loopTime < dissolveStart) {
      const elapsed = loopTime - assembleStart;
      const p = Math.min(elapsed / 1000, 1);
      opacity = easeOutCubic(p);
      blur = 10 * (1 - p);
    } else if (loopTime >= dissolveStart) {
      const elapsed = loopTime - dissolveStart;
      const p = Math.min(elapsed / 1000, 1);
      opacity = 1 - easeInCubic(p);
      blur = 10 * p;
    }
    el.style.transform = 'translate(0px, 0px)';
    el.style.opacity = opacity.toFixed(3);
    el.style.filter = `blur(${blur.toFixed(1)}px)`;
  });
}
