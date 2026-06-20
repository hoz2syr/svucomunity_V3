export function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export function easeInCubic(x: number): number {
  return x * x * x;
}

export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function spring(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1.5) return 1;
  const w0 = 12.649;
  const zeta = 0.553;
  const wd = 10.53;
  const e = Math.exp(-zeta * w0 * t);
  return 1 - e * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
}
