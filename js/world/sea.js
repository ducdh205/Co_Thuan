import * as THREE from 'three';
import { PALETTE } from '../config.js';
import { makeTextTexture } from '../textures.js';

// Biển low-poly gợn sóng + những ký tự 0/1 lấp lánh như ánh nắng trên mặt nước.
export function createSea(quality) {
  const group = new THREE.Group();
  const seg = quality.tier === 'high' ? 110 : 70;
  const geo = new THREE.PlaneGeometry(700, 700, seg, seg);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, -160);
  const pos = geo.attributes.position;
  const base = Float32Array.from(pos.array);
  const colors = new Float32Array(pos.count * 3);
  const a = new THREE.Color(PALETTE.seaLight);
  const b = new THREE.Color(PALETTE.seaDeep);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3], z = base[i * 3 + 2];
    const n = 0.5 + 0.5 * Math.sin(x * 0.045 + Math.cos(z * 0.06) * 2.0);
    c.copy(a).lerp(b, n * 0.8 + Math.random() * 0.2);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, metalness: 0, emissive: '#1f8f88', emissiveIntensity: 0.35 }));
  group.add(mesh);

  function waveY(x, z, t) {
    return Math.sin(x * 0.09 + t * 1.1) * 0.55 + Math.cos(z * 0.11 + t * 0.9) * 0.45 + Math.sin((x + z) * 0.05 + t * 0.6) * 0.35;
  }

  // Lấp lánh 0/1
  const glints = new THREE.Group();
  const digitMats = ['0', '1'].map((d) => new THREE.SpriteMaterial({
    map: makeTextTexture(d, { font: "700 72px ui-monospace, Consolas, monospace", color: '#ffffff', shadow: '#fff6c4' }),
    transparent: true, depthWrite: false, opacity: 0,
  }));
  const glintCount = quality.tier === 'high' ? 70 : 36;
  for (let i = 0; i < glintCount; i++) {
    const s = new THREE.Sprite(digitMats[i % 2].clone());
    s.position.set((Math.random() - 0.5) * 120, 0.6, 10 - Math.random() * 150);
    const k = 0.9 + Math.random() * 1.1;
    s.scale.set(k * 0.7, k, 1);
    s.userData.phase = Math.random() * Math.PI * 2;
    s.userData.speed = 0.8 + Math.random() * 1.4;
    glints.add(s);
  }
  group.add(glints);
  const state = { glint: 1 };

  function update(t) {
    const arr = pos.array;
    for (let i = 0; i < pos.count; i++) {
      arr[i * 3 + 1] = waveY(base[i * 3], base[i * 3 + 2], t);
    }
    pos.needsUpdate = true;
    for (const s of glints.children) {
      const tw = Math.max(0, Math.sin(t * s.userData.speed + s.userData.phase));
      s.material.opacity = tw * tw * 0.85 * state.glint;
      s.position.y = waveY(s.position.x, s.position.z, t) + 0.5;
    }
  }

  return { group, update, glints, waveY, state };
}
