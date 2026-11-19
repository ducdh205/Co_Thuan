import * as THREE from 'three';
import { PALETTE } from '../config.js';
import { makeLabelSprite, makeTextTexture } from '../textures.js';

const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.75, ...extra });

// Thành phố hệ thống: nhìn từ trên giống một sơ đồ — các khối module nối bằng đường dữ liệu.
export function createCity() {
  const group = new THREE.Group();
  const buildings = [];

  // Hai nửa đất, giữa là kênh nước
  const ground = flat('#ffe9c7');
  const back = new THREE.Mesh(new THREE.BoxGeometry(110, 5, 34), ground);
  back.position.set(0, -1.9, -20);
  const front = new THREE.Mesh(new THREE.BoxGeometry(110, 5, 34), ground);
  front.position.set(0, -1.9, 22);
  group.add(back, front);

  const modules = [
    { name: 'Người dùng', pos: [-34, -20], color: '#ffd6e0' },
    { name: 'Nghiệp vụ', pos: [0, -20], color: '#e3dcff' },
    { name: 'Dữ liệu', pos: [34, -20], color: '#c9f5ef' },
    { name: 'Báo cáo', pos: [-34, 22], color: '#fff1bf' },
    { name: 'Thanh toán', pos: [34, 22], color: '#d8f3ff' },
  ];
  const buildingColors = [PALETTE.pink, PALETTE.purple, '#5ec8ff', '#ffb36b', '#5ee7df', '#ffffff'];
  const labels = [];
  let ci = 0;
  modules.forEach((m, mi) => {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(22, 0.6, 20), flat(m.color));
    plate.position.set(m.pos[0], 0.9, m.pos[1]);
    group.add(plate);
    const spots = [[-5, -4], [5, -4], [-5, 5], [5, 5]];
    spots.forEach(([dx, dz], k) => {
      if ((mi + k) % 5 === 4) return;
      const h = 4 + ((mi * 7 + k * 5) % 9);
      const w = 5 + ((mi + k) % 3);
      const geo = new THREE.BoxGeometry(w, h, w);
      geo.translate(0, h / 2, 0);
      const b = new THREE.Mesh(geo, flat(buildingColors[ci++ % buildingColors.length]));
      b.position.set(m.pos[0] + dx, 1.2, m.pos[1] + dz);
      b.scale.y = 0.001;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.72, 2, 4), flat('#ffffff'));
      roof.rotation.y = Math.PI / 4;
      roof.position.y = h + 1;
      b.add(roof);
      group.add(b);
      buildings.push(b);
    });
    const label = makeLabelSprite(m.name, 4.2, { font: "700 64px 'Be Vietnam Pro', sans-serif", color: '#ffffff', bg: 'rgba(123,97,255,0.85)', padding: 26 });
    label.position.set(m.pos[0], 20, m.pos[1]);
    label.material.opacity = 0;
    group.add(label);
    labels.push(label);
  });

  // Tòa nhà đồ án tốt nghiệp: đang xây — tầng dưới đặc, tầng trên là khung
  const thesis = new THREE.Group();
  thesis.position.set(0, 1.2, 22);
  const floorH = 3.2;
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(12, floorH, 10), flat(i % 2 ? '#ffffff' : '#ffc2d4'));
    f.position.y = floorH * (i + 0.5);
    thesis.add(f);
  }
  const frameGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(12, floorH * 3, 10));
  const frame = new THREE.LineSegments(frameGeo, new THREE.LineBasicMaterial({ color: PALETTE.purple }));
  frame.position.y = floorH * 4.5;
  thesis.add(frame);
  for (let i = 1; i < 3; i++) {
    const slab = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(12, 0.01, 10)), new THREE.LineBasicMaterial({ color: PALETTE.purple }));
    slab.position.y = floorH * (3 + i);
    thesis.add(slab);
  }
  const craneMat = flat(PALETTE.sun);
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.8, 24, 0.8), craneMat);
  mast.position.set(7.5, 12, -3);
  const jib = new THREE.Mesh(new THREE.BoxGeometry(16, 0.7, 0.7), craneMat);
  jib.position.set(3, 23.5, -3);
  thesis.add(mast, jib);
  const signTex = makeTextTexture('Đồ án tốt nghiệp', { font: "800 72px 'Be Vietnam Pro', sans-serif", color: PALETTE.pink, bg: '#ffffff', padding: 34 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.6 * signTex.userData.aspect, 2.6), new THREE.MeshBasicMaterial({ map: signTex, transparent: true }));
  sign.position.set(0, floorH * 1.5, 5.05);
  thesis.add(sign);
  const signTop = makeLabelSprite('Đồ án tốt nghiệp', 4.6, { font: "800 72px 'Be Vietnam Pro', sans-serif", color: '#ffffff', bg: 'rgba(255,92,138,0.92)', padding: 30 });
  signTop.position.set(0, 30, 0);
  signTop.material.opacity = 0;
  thesis.add(signTop);
  thesis.scale.y = 0.001;
  group.add(thesis);
  labels.push(signTop);

  // Đường dữ liệu: nối các khối như cạnh trong sơ đồ
  const nodes = [...modules.map((m) => m.pos), [0, 22]];
  const edges = [[0, 1], [1, 2], [0, 3], [2, 4], [1, 5], [3, 5], [5, 4]];
  const streets = new THREE.Group();
  const lineMat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.6, transparent: true, opacity: 0 });
  const dotMat = new THREE.MeshBasicMaterial({ color: PALETTE.pink, transparent: true, opacity: 0 });
  const flows = [];
  edges.forEach(([a, b], k) => {
    const A = new THREE.Vector3(nodes[a][0], 1.4, nodes[a][1]);
    const B = new THREE.Vector3(nodes[b][0], 1.4, nodes[b][1]);
    const len = A.distanceTo(B);
    const road = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, len), lineMat);
    road.position.copy(A).lerp(B, 0.5);
    road.lookAt(B.x, road.position.y, B.z);
    streets.add(road);
    for (let d = 0; d < 3; d++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), dotMat);
      streets.add(dot);
      flows.push({ dot, A, B, off: d / 3 + k * 0.13 });
    }
  });
  group.add(streets);

  // Cầu bắc qua kênh (quan hệ giữa các bảng)
  const bridges = new THREE.Group();
  [[-34], [0], [34]].forEach(([x]) => {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(5, 0.6, 5, 16, Math.PI), flat('#ffffff'));
    arch.rotation.y = Math.PI / 2;
    arch.position.set(x + 3, 0.5, 1);
    bridges.add(arch);
  });
  group.add(bridges);

  const state = { grow: 0 };
  function setGrow(p) {
    state.grow = p;
    buildings.forEach((b, i) => {
      const k = THREE.MathUtils.clamp(p * 1.6 - (i / buildings.length) * 0.6, 0, 1);
      b.scale.y = Math.max(0.001, easeOutBack(k));
    });
    thesis.scale.y = Math.max(0.001, easeOutBack(THREE.MathUtils.clamp(p * 1.4 - 0.2, 0, 1)));
    lineMat.opacity = 0.85 * p;
    dotMat.opacity = p;
    labels.forEach((l) => (l.material.opacity = THREE.MathUtils.clamp(p * 2 - 1, 0, 1)));
  }
  setGrow(0);

  function update(elapsed) {
    for (const f of flows) {
      const t = (elapsed * 0.25 + f.off) % 1;
      f.dot.position.copy(f.A).lerp(f.B, t);
      f.dot.position.y = 1.9;
    }
  }

  return { group, buildings, streets, bridges, thesis, labels, setGrow, update };
}

function easeOutBack(x) {
  const c1 = 1.70158, c3 = c1 + 1;
  return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
