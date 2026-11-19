import * as THREE from 'three';
import { gsap } from 'gsap';
import { PALETTE } from '../config.js';
import { makeGlowTexture, makeLabelSprite } from '../textures.js';

export const LABELS = ['C', 'biến', 'vòng lặp', 'hàm', 'mảng', 'con trỏ', 'struct', 'đệ quy', 'thuật toán', 'cơ sở dữ liệu', 'use case', 'hệ thống'];

// Đốm sáng kiến thức nhiều màu trên bầu trời, nối nhau thành chòm (đồ thị / cấu trúc dữ liệu).
export function createKnowledgeLights(count) {
  const group = new THREE.Group();
  const colors = [PALETTE.pink, PALETTE.purple, PALETTE.sun, '#ffffff', '#5ee7df'];
  const textures = colors.map((c) => makeGlowTexture(c));
  const items = [];

  // Chòm sao: các cụm điểm tựa trên bầu trời phía trước (hướng -z)
  const clusters = [
    { c: new THREE.Vector3(-70, 70, -260), r: 34 },
    { c: new THREE.Vector3(10, 95, -300), r: 38 },
    { c: new THREE.Vector3(90, 65, -270), r: 34 },
    { c: new THREE.Vector3(-20, 135, -330), r: 44 },
  ];
  const rand = mulberry32(2011);
  for (let i = 0; i < count; i++) {
    const cl = clusters[i % clusters.length];
    const p = new THREE.Vector3(
      cl.c.x + (rand() - 0.5) * cl.r * 2,
      cl.c.y + (rand() - 0.5) * cl.r * 1.2,
      cl.c.z + (rand() - 0.5) * cl.r,
    );
    if (i === 0) p.set(0, 62, -230); // ngôi sao "C" ở chính giữa, dễ thấy
    const mat = new THREE.SpriteMaterial({ map: textures[i % colors.length], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false });
    const sprite = new THREE.Sprite(mat);
    const size = i === 0 ? 26 : i < LABELS.length ? 15 : 5 + rand() * 6;
    sprite.position.copy(p);
    sprite.scale.setScalar(0.001);
    group.add(sprite);
    const item = { sprite, size, home: p.clone(), cluster: i % clusters.length, reveal: 0, twinkle: rand() * 6.28 };
    if (i < LABELS.length) {
      const label = makeLabelSprite(LABELS[i], i === 0 ? 16 : 9, {
        font: i === 0 ? "800 120px 'Be Vietnam Pro', sans-serif" : "700 64px 'Be Vietnam Pro', sans-serif",
        color: '#ffffff', shadow: colors[i % colors.length],
      });
      label.material.opacity = 0;
      label.position.copy(p).add(new THREE.Vector3(0, i === 0 ? 0 : -size * 0.55, 1));
      group.add(label);
      item.label = label;
    }
    items.push(item);
  }

  // Đường nối giữa các đốm cùng cụm (kiểu cây/đồ thị: nối với đốm gần nhất trước đó)
  const pairs = [];
  for (let i = 1; i < items.length; i++) {
    let best = -1, bestD = Infinity;
    for (let j = 0; j < i; j++) {
      if (items[j].cluster !== items[i].cluster && j !== 0) continue;
      const d = items[j].home.distanceTo(items[i].home);
      if (d < bestD) { bestD = d; best = j; }
    }
    if (best >= 0) pairs.push([best, i]);
  }
  const linePos = new Float32Array(pairs.length * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const linkMat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, fog: false });
  const links = new THREE.LineSegments(lineGeo, linkMat);
  group.add(links);

  const state = { brightness: 1, links: 0 };

  function reveal(i, duration = 1.2) {
    const it = items[i];
    return gsap.to(it, { reveal: 1, duration, ease: 'back.out(2)' });
  }
  function setLinksVisible(p) { state.links = p; }
  function setBrightness(b) { state.brightness = b; }

  function update(elapsed) {
    for (let k = 0; k < pairs.length; k++) {
      const [a, b] = pairs[k];
      const pa = items[a].sprite.position, pb = items[b].sprite.position;
      linePos.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], k * 6);
    }
    lineGeo.attributes.position.needsUpdate = true;
    linkMat.opacity = 0.55 * state.links * state.brightness;
    for (const it of items) {
      const tw = 0.85 + 0.15 * Math.sin(elapsed * 2.2 + it.twinkle);
      const s = Math.max(0.001, it.size * it.reveal * tw);
      it.sprite.scale.set(s, s, 1);
      it.sprite.material.opacity = Math.min(1, it.reveal) * state.brightness;
      if (it.label) {
        it.label.material.opacity = Math.min(1, it.reveal) * state.brightness;
        it.label.position.copy(it.sprite.position).y -= it.label === items[0].label ? 0 : it.size * 0.55;
      }
    }
  }

  return { group, items, links, labels: LABELS, reveal, setLinksVisible, setBrightness, update };
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
