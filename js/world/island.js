import * as THREE from 'three';
import { PALETTE } from '../config.js';
import { makeLabelSprite, makeGlowTexture } from '../textures.js';

const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.8, ...extra });

function giftBox(color, size) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(size, size * 0.8, size), flat(color));
  base.position.y = size * 0.4;
  const ribbonMat = flat('#ffffff');
  const r1 = new THREE.Mesh(new THREE.BoxGeometry(size * 1.02, size * 0.82, size * 0.18), ribbonMat);
  r1.position.y = size * 0.4;
  const r2 = r1.clone();
  r2.rotation.y = Math.PI / 2;
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, size * 0.8, -size / 2);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(size * 1.12, size * 0.22, size * 1.12), flat(color));
  lid.position.set(0, size * 0.11, size / 2);
  const bow = new THREE.Mesh(new THREE.TorusKnotGeometry(size * 0.16, size * 0.05, 32, 6), flat(PALETTE.sun));
  bow.position.set(0, size * 0.32, size / 2);
  lidPivot.add(lid, bow);
  g.add(base, r1, r2, lidPivot);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(PALETTE.sun), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.position.y = size * 1.1;
  glow.scale.setScalar(size * 3.2);
  g.add(glow);
  g.userData = { lid: lidPivot, glow };
  return g;
}

// Đảo C: hộp quà = biến, xoáy nước = vòng lặp, mũi tên sáng = con trỏ.
export function createIsland() {
  const group = new THREE.Group();

  const sand = new THREE.Mesh(new THREE.CylinderGeometry(15, 18, 3, 9), flat('#ffe1a8'));
  sand.position.y = -0.6;
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(9, 12, 1.4, 8), flat('#8ee3a5'));
  grass.position.set(-3, 1.2, -2);
  group.add(sand, grass);

  // Khối đá chữ "C" lớn
  const cRock = new THREE.Mesh(new THREE.TorusGeometry(4.6, 1.5, 6, 14, Math.PI * 1.55), flat(PALETTE.purple));
  cRock.rotation.z = Math.PI * 0.225;
  cRock.position.set(-5, 7.6, -5);
  group.add(cRock);

  // Cây dừa nhỏ cho vui mắt
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 7, 5), flat('#c99a6b'));
  trunk.position.set(7, 4.5, -6);
  trunk.rotation.z = -0.15;
  group.add(trunk);
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.9, 5, 4), flat('#5fd39a'));
    leaf.position.set(7.5, 8, -6);
    leaf.rotation.set(Math.PI / 2.4, (i / 5) * Math.PI * 2, 0, 'YXZ');
    leaf.translateY(2.2);
    group.add(leaf);
  }

  // biến: hộp quà
  const box = giftBox(PALETTE.pink, 2.6);
  box.position.set(1, 0.9, 4);
  group.add(box);
  // ô nhớ được trỏ tới
  const box2 = giftBox('#5ee7df', 1.8);
  box2.position.set(9, 0.9, 5);
  group.add(box2);

  // con trỏ: mũi tên sáng từ hộp 1 sang hộp 2 (dựng theo +x, scale.x để "vẽ")
  const arrow = new THREE.Group();
  const glowMat = new THREE.MeshStandardMaterial({ color: PALETTE.sun, emissive: PALETTE.sun, emissiveIntensity: 1.4, flatShading: true });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.6, 6), glowMat);
  shaft.rotation.z = -Math.PI / 2;
  shaft.position.x = 2.3;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.3, 6), glowMat);
  head.rotation.z = -Math.PI / 2;
  head.position.x = 5.2;
  arrow.add(shaft, head);
  arrow.position.set(2.3, 3.6, 4.4);
  arrow.scale.set(0.001, 1, 1);
  group.add(arrow);

  // vòng lặp: xoáy nước tròn bên mép đảo
  const whirl = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.2 + i * 1.5, 0.22, 4, 32, Math.PI * 1.6),
      new THREE.MeshStandardMaterial({ color: i % 2 ? '#ffffff' : '#bff7f1', emissive: '#7de9e0', emissiveIntensity: 0.4, flatShading: true, transparent: true, opacity: 0.9 }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.rotation.z = i * 1.3;
    whirl.add(ring);
  }
  whirl.position.set(-14, 0.5, 14);
  whirl.scale.setScalar(0.001);
  group.add(whirl);

  const labelOpts = { font: "700 64px 'Be Vietnam Pro', sans-serif", color: '#ffffff', bg: 'rgba(255,92,138,0.85)', padding: 26 };
  const lBien = makeLabelSprite('biến', 1.8, labelOpts);
  lBien.position.set(1, 6.4, 4);
  const lLoop = makeLabelSprite('vòng lặp', 1.8, { ...labelOpts, bg: 'rgba(43,179,192,0.9)' });
  lLoop.position.set(-14, 4.6, 14);
  const lPtr = makeLabelSprite('con trỏ', 1.8, { ...labelOpts, bg: 'rgba(123,97,255,0.88)' });
  lPtr.position.set(6, 6.4, 4.6);
  const labelSprites = [lBien, lLoop, lPtr];
  labelSprites.forEach((s) => { s.material.opacity = 0; group.add(s); });

  function update(dt) {
    whirl.rotation.y += dt * 1.8;
  }

  return { group, box, box2, whirl, arrow, cRock, labelSprites, update };
}
