gsap.registerPlugin(CustomEase);
CustomEase.create('smoothOut', '0.22, 1, 0.36, 1');
CustomEase.create('cinematic', '0.7, 0, 0.2, 1');

const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const exportBtn = document.getElementById('exportBtn');

let width, height, centerX, centerY;
let particles = [];
let animTimeline;
let isExporting = false;
let audioCtx;
let beatInterval;
let nextBeatTime = 0;
const BPM = 120;
const BEAT_DURATION = 60 / BPM; // 0.5s

function resize() {
  width = canvas.width = window.innerWidth * window.devicePixelRatio;
  height = canvas.height = window.innerHeight * window.devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  centerX = width / 2;
  centerY = height / 2;
}
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor(x, y, color, size, speedX, speedY, life, type = 'circle') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.speedX = speedX;
    this.speedY = speedY;
    this.life = life;
    this.maxLife = life;
    this.opacity = 1;
    this.type = type;
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life--;
    this.opacity = Math.max(0, this.life / this.maxLife);
    this.size *= 0.997;
    this.rotation += this.rotationSpeed;
    this.speedX *= 0.99;
    this.speedY *= 0.99;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.type === 'circle') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'square') {
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    } else if (this.type === 'triangle') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(0, -this.size / 2);
      ctx.lineTo(-this.size / 2, this.size / 2);
      ctx.lineTo(this.size / 2, this.size / 2);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'line') {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-this.size / 2, 0);
      ctx.lineTo(this.size / 2, 0);
      ctx.stroke();
    }

    ctx.restore();
  }
}

function spawnParticles(x, y, count, colors, lifeRange, sizeRange, speedRange, types) {
  const colorPool = colors || ['#7c4dff', '#00e5ff', '#ff4081', '#ffab40', '#ffffff'];
  const typePool = types || ['circle', 'square', 'triangle', 'line'];

  for (let i = 0; i < count; i++) {
    const life = Math.random() * (lifeRange[1] - lifeRange[0]) + lifeRange[0];
    const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * (speedRange[1] - speedRange[0]) + speedRange[0];
    const speedX = Math.cos(angle) * speed;
    const speedY = Math.sin(angle) * speed;
    const color = colorPool[Math.floor(Math.random() * colorPool.length)];
    const type = typePool[Math.floor(Math.random() * typePool.length)];

    particles.push(new Particle(x, y, color, size, speedX, speedY, life, type));
  }
}

function spawnBurst(x, y, count = 40) {
  spawnParticles(x, y, count, ['#ffffff', '#00e5ff'], [30, 70], [2, 7], [4, 10]);
  spawnParticles(x, y, count * 0.6, ['#7c4dff', '#ff4081'], [40, 90], [1, 5], [2, 6]);
  spawnParticles(x, y, count * 0.3, ['#ffab40'], [50, 100], [1, 4], [1, 4]);
}

function drawBackground(t) {
  const pulse = Math.sin(t * 1.2) * 0.5 + 0.5;
  const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.6);
  grad.addColorStop(0, `rgba(124, 77, 255, ${0.03 + pulse * 0.03})`);
  grad.addColorStop(0.5, 'rgba(5, 5, 15, 0)');
  grad.addColorStop(1, 'rgba(5, 5, 15, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const beat = Math.sin(t * Math.PI * BPM / 30) > 0.8;
  if (beat) {
    const flash = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.4);
    flash.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
    flash.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = flash;
    ctx.fillRect(0, 0, width, height);
  }
}

function renderLoop(t) {
  if (animTimeline && animTimeline.isActive() || isExporting) {
    drawBackground(t);
  } else if (particles.length > 0) {
    ctx.clearRect(0, 0, width, height);
  }

  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.update();
    p.draw();
  });

  if (animTimeline && animTimeline.isActive() || isExporting || particles.length > 0) {
    requestAnimationFrame(renderLoop);
  }
}

function buildTimeline() {
  animTimeline = gsap.timeline({ paused: true });

  // BEAT 1 (0.0s) - Genesis
  animTimeline.addLabel('beat1', 0);

  animTimeline.to('.geo', {
    autoAlpha: 1,
    scale: 1,
    rotation: (i) => (Math.random() - 0.5) * 60,
    duration: 0.8,
    stagger: { each: 0.06, from: 'center' },
    ease: 'cinematic',
    onStart: () => {
      spawnBurst(centerX, centerY, 50);
      requestAnimationFrame(renderLoop);
    }
  }, 0);

  // BEAT 2 (0.5s) - Cards In
  animTimeline.addLabel('beat2', 0.5);

  animTimeline.to('.glass-card', {
    autoAlpha: 1,
    scale: 1,
    y: 0,
    duration: 0.6,
    stagger: { each: 0.08, from: 'random' },
    ease: 'back.out(1.4)',
    onStart: () => {
      spawnParticles(centerX, centerY, 15, ['#00e5ff'], [30, 60], [2, 5], [2, 6]);
    }
  }, 0.5);

  // BEAT 3 (1.0s) - Typography Start
  animTimeline.addLabel('beat3', 1.0);

  animTimeline.to('.char', {
    autoAlpha: 1,
    y: 0,
    rotationX: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'back.out(2)'
  }, 1.0);

  // BEAT 4 (1.5s) - Cards Out / Morph Begin
  animTimeline.addLabel('beat4', 1.5);

  animTimeline.to('.glass-card', {
    autoAlpha: 0,
    scale: 0.5,
    rotation: (i) => (Math.random() - 0.5) * 45,
    duration: 0.5,
    stagger: { each: 0.05, from: 'edges' },
    ease: 'power2.in'
  }, 1.5);

  animTimeline.to('.geo', {
    autoAlpha: 0,
    scale: 1.5,
    duration: 0.6,
    stagger: 0.04,
    ease: 'power2.in'
  }, 1.5);

  // BEAT 5 (2.0s) - Subline + Light Orbs
  animTimeline.addLabel('beat5', 2.0);

  animTimeline.to('.subline .word', {
    autoAlpha: 1,
    y: 0,
    duration: 0.35,
    stagger: 0.05,
    ease: 'power3.out'
  }, 2.0);

  animTimeline.to('.light-orb', {
    autoAlpha: 0.6,
    scale: 1,
    duration: 1.2,
    stagger: 0.15,
    ease: 'smoothOut'
  }, 2.0);

  // BEAT 6 (2.5s) - Light Streaks
  animTimeline.addLabel('beat6', 2.5);

  animTimeline.to('.light-streak', {
    autoAlpha: 0.8,
    scaleX: 1,
    duration: 0.3,
    stagger: 0.08,
    ease: 'power2.out'
  }, 2.5);

  // BEAT 7 (3.0s) - Decor Lines
  animTimeline.addLabel('beat7', 3.0);

  animTimeline.to('.line-h', {
    autoAlpha: 0.6,
    scaleX: 1,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power3.out'
  }, 3.0);

  animTimeline.to('.line-v', {
    autoAlpha: 0.5,
    scaleY: 1,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power3.out'
  }, 3.0);

  animTimeline.to('.tagline', {
    autoAlpha: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    onStart: () => {
      spawnBurst(centerX, centerY, 60);
    }
  }, 3.2);

  // BEAT 8 (3.5s) - Marker + Orb Movement
  animTimeline.addLabel('beat8', 3.5);

  animTimeline.to('.marker', {
    autoAlpha: 0.7,
    duration: 0.5,
    ease: 'power2.out'
  }, 3.5);

  animTimeline.to('.orb-1', { x: 80, y: -40, duration: 1.2, ease: 'smoothOut' }, 3.5);
  animTimeline.to('.orb-2', { x: -60, y: 50, duration: 1.2, ease: 'smoothOut' }, 3.5);
  animTimeline.to('.orb-3', { x: 40, y: -60, duration: 1.2, ease: 'smoothOut' }, 3.5);

  // BEAT 9 (4.0s) - Final Morph
  animTimeline.addLabel('beat9', 4.0);

  animTimeline.to('.decor-line', {
    autoAlpha: 0,
    scaleX: 0,
    scaleY: 0,
    duration: 0.4,
    stagger: 0.05,
    ease: 'power2.in'
  }, 4.0);

  animTimeline.to('.light-orb', {
    autoAlpha: 0,
    scale: 2,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power2.in'
  }, 4.0);

  animTimeline.to('.light-streak', {
    autoAlpha: 0,
    scaleX: 0,
    duration: 0.4,
    stagger: 0.05,
    ease: 'power2.in'
  }, 4.0);

  // BEAT 10 (4.5s) - Final Text Pulse + Burst
  animTimeline.addLabel('beat10', 4.5);

  animTimeline.to('.headline', {
    scale: 1.05,
    duration: 0.15,
    yoyo: true,
    repeat: 1,
    ease: 'power2.inOut'
  }, 4.5);

  animTimeline.to('.subline', {
    autoAlpha: 0,
    y: -10,
    duration: 0.4,
    ease: 'power2.in'
  }, 4.5);

  animTimeline.to('.tagline', {
    autoAlpha: 0,
    duration: 0.4,
    ease: 'power2.in'
  }, 4.5);

  animTimeline.call(() => {
    spawnBurst(centerX, centerY, 100);
    triggerBeat('final');
  }, null, 4.5);

  // BEAT 11 (5.0s) - End
  animTimeline.addLabel('beat11', 5.0);

  animTimeline.to('.marker', {
    autoAlpha: 0,
    duration: 0.5,
    ease: 'power2.in'
  }, 5.0);

  animTimeline.to('.headline', {
    autoAlpha: 0.3,
    scale: 0.95,
    duration: 0.8,
    ease: 'power3.inOut'
  }, 5.0);

  animTimeline.to({}, { duration: 0.6, onComplete: onAnimComplete }, 5.6);
}

function onAnimComplete() {
  stopAudio();
  if (!isExporting) {
    playBtn.disabled = false;
    playBtn.innerHTML = '&#9654; Replay';
  }
}

// =====================
// AUDIO ENGINE
// =====================
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playKick(time) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.15);
  gain.gain.setValueAtTime(0.8, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

  osc.start(time);
  osc.stop(time + 0.15);
}

function playSnare(time) {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.1;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1000;

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.3, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  noise.start(time);
  noise.stop(time + 0.1);
}

function playHiHat(time) {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.05;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 5000;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.08, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noise.start(time);
  noise.stop(time + 0.04);
}

function playSynthPad(time, duration = 1.5) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, time);
  osc.frequency.linearRampToValueAtTime(220, time + duration);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, time);
  filter.frequency.linearRampToValueAtTime(2000, time + duration * 0.5);
  filter.frequency.linearRampToValueAtTime(400, time + duration);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.06, time + 0.3);
  gain.gain.linearRampToValueAtTime(0, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(time);
  osc.stop(time + duration);
}

function playFinalDrop(time) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, time);
  osc.frequency.exponentialRampToValueAtTime(55, time + 0.4);
  gain.gain.setValueAtTime(0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + 0.5);
}

let beatCount = 0;
let schedulerTimer;
const scheduleAhead = 0.1;

function scheduler() {
  while (nextBeatTime < audioCtx.currentTime + scheduleAhead) {
    const beatInBar = beatCount % 4;

    if (beatInBar === 0 || beatInBar === 2) {
      playKick(nextBeatTime);
      triggerBeat('kick');
    } else if (beatInBar === 1 || beatInBar === 3) {
      playSnare(nextBeatTime);
      triggerBeat('snare');
    }

    playHiHat(nextBeatTime);

    if (beatCount % 2 === 0) {
      playSynthPad(nextBeatTime, BEAT_DURATION * 2);
    }

    nextBeatTime += BEAT_DURATION / 2;
    beatCount++;
  }
}

function triggerBeat(type) {
  const pulse = document.querySelector('.beat-pulse');
  const rings = document.querySelectorAll('.beat-ring');

  rings.forEach(ring => {
    gsap.fromTo(ring,
      { scale: 0.5, opacity: 0.8 },
      { scale: 1.5, opacity: 0, duration: 0.4, ease: 'power2.out' }
    );
  });

  gsap.fromTo(pulse,
    { scale: 1.2, opacity: 1 },
    { scale: 1, opacity: 0.6, duration: 0.1, ease: 'power2.out' }
  );

  if (type === 'final') {
    gsap.to(pulse, {
      scale: 2,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      onComplete: () => {
        gsap.set(pulse, { scale: 1, opacity: 0.6 });
      }
    });
  }
}

function startAudio() {
  initAudio();
  beatCount = 0;
  nextBeatTime = audioCtx.currentTime + 0.05;
  scheduler();
  schedulerTimer = setInterval(scheduler, 25);
}

function stopAudio() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
}

// =====================
// PLAY & EXPORT
// =====================
function resetState() {
  particles = [];
  gsap.set('.geo', { autoAlpha: 0, scale: 0.5, rotation: 0 });
  gsap.set('.glass-card', { autoAlpha: 0, scale: 0.8, y: 20, rotation: 0 });
  gsap.set('.char', { autoAlpha: 0, y: 40, rotationX: -90 });
  gsap.set('.subline .word', { autoAlpha: 0, y: 10 });
  gsap.set('.tagline', { autoAlpha: 0, y: 10 });
  gsap.set('.marker', { autoAlpha: 0 });
  gsap.set('.light-orb', { autoAlpha: 0, scale: 0.3, x: 0, y: 0 });
  gsap.set('.light-streak', { autoAlpha: 0, scaleX: 0 });
  gsap.set('.decor-line', { autoAlpha: 0, scaleX: 0, scaleY: 0 });
  gsap.set('.headline', { scale: 1, autoAlpha: 1 });
  gsap.set('.beat-pulse', { scale: 1, opacity: 0.6 });
}

function play() {
  resetState();
  stopAudio();
  buildTimeline();
  animTimeline.play(0);
  startAudio();
  playBtn.disabled = true;
}

async function exportVideo() {
  isExporting = true;
  const chunks = [];
  const stream = canvas.captureStream(60);

  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 10000000
  });

  recorder.ondataavailable = e => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motion-graphic-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    isExporting = false;
    playBtn.disabled = false;
    playBtn.innerHTML = '&#9654; Replay';
  };

  play();
  recorder.start(100);
  playBtn.disabled = true;

  animTimeline.eventCallback('onComplete', () => {
    setTimeout(() => {
      recorder.stop();
      stopAudio();
    }, 400);
  });
}

playBtn.addEventListener('click', play);
exportBtn.addEventListener('click', exportVideo);

window.addEventListener('load', () => {
  resetState();
});
