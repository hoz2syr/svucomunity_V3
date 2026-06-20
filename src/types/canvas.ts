export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  seed: number;
}

export interface TextParticle extends Particle {
  isText: boolean;
  textTarget: { x: number; y: number } | null;
  textCharIndex: number;
  arcHeight: number;
}

export interface LinkState {
  age: number;
}

export interface MouseState {
  x: number;
  y: number;
  isActive: boolean;
}
