import * as THREE from 'three';
import { PALETTE } from '../config.js';

function boltTexture(text) {
  const w = 512, h = 640;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#fff6c4';
  ctx.beginPath();
  ctx.moveTo(290, 0); ctx.lineTo(170, 250); ctx.lineTo(260, 250); ctx.lineTo(150, 470);
  ctx.lineTo(360, 200); ctx.lineTo(265, 200); ctx.lineTo(360, 0); ctx.closePath();
  ctx.fill();
  ctx.shadowColor = 'rgba(255,92,138,0.9)';
  ctx.shadowBlur = 18;
  ctx.font = "800 54px ui-monospace, Consolas, monospace";
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff3d6e';
  ctx.fillText(text, w / 2, 560);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Mây giông ngắn (lỗi), tia chớp mang chữ lỗi, rồi cầu vồng.
export function createStorm({ hemi, sunLight } = {}) {
  const group = new THREE.Group();

  const clouds = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({ color: '#b9bccd', flatShading: true, roughness: 1, transparent: true, opacity: 0 });
  const rand = (a, b) => a + Math.random() * (b - a);
  for (let c = 0; c < 9; c++) {
    const puff = new THREE.Group();
    const n = 4 + (c % 3);
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rand(4, 7), 0), cloudMat);
      m.position.set(i * 5 - n * 2.5 + rand(-1, 1), rand(-1.5, 1.5), rand(-2, 2));
      puff.add(m);
    }
    puff.position.set(rand(-60, 60), rand(18, 32), rand(-25, 25));
    puff.userData.drift = rand(0.5, 1.5);
    clouds.add(puff);
  }
  group.add(clouds);

  const bolts = ['Syntax error', 'Segmentation fault', 'Syntax error'].map((t, i) => {
    const mat = new THREE.SpriteMaterial({ map: boltTexture(t), transparent: true, opacity: 0, depthWrite: false, fog: false });
    const s = new THREE.Sprite(mat);
    s.scale.set(16, 20, 1);
    s.position.set([-22, 14, 36][i], 12, [-5, 6, -12][i]);
    group.add(s);
    return s;
  });

  // Cầu vồng: các dải nửa vòng tròn
  const rainbow = new THREE.Group();
  const bands = ['#ff6b8b', '#ffa45c', '#ffe066', '#7be495', '#5ec8ff', '#9b7bff'];
  bands.forEach((col, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false, fog: false, side: THREE.DoubleSide });
    const arc = new THREE.Mesh(new THREE.TorusGeometry(70 - i * 2.4, 1.25, 4, 72, Math.PI), mat);
    rainbow.add(arc);
  });
  rainbow.position.set(0, -4, -80);
  rainbow.scale.set(1, 0.001, 1);
  group.add(rainbow);

  const base = { hemi: hemi?.intensity ?? 1, sun: sunLight?.intensity ?? 1 };

  function setStorm(p) {
    cloudMat.opacity = 0.95 * p;
    clouds.visible = p > 0.001;
    if (hemi) hemi.intensity = base.hemi * (1 - 0.3 * p);
    if (sunLight) sunLight.intensity = base.sun * (1 - 0.3 * p);
  }
  function setRainbow(p) {
    rainbow.scale.y = Math.max(0.001, p);
    rainbow.children.forEach((m) => (m.material.opacity = 0.7 * p));
    rainbow.visible = p > 0.001;
  }
  setStorm(0);
  setRainbow(0);

  function update(dt) {
    clouds.children.forEach((c) => { c.position.x += Math.sin(performance.now() / 4000 + c.userData.drift) * dt * c.userData.drift; });
  }

  return { group, clouds, bolts, rainbow, setStorm, setRainbow, update };
}
