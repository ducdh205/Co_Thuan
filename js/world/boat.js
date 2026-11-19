import * as THREE from 'three';
import { PALETTE } from '../config.js';

function sailTexture() {
  const w = 512, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  // Tam giác giấy
  ctx.beginPath();
  ctx.moveTo(w / 2, 8); ctx.lineTo(w - 8, h - 8); ctx.lineTo(8, h - 8); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#fff1f4');
  ctx.fillStyle = g;
  ctx.fill();
  // Nếp gấp
  ctx.strokeStyle = 'rgba(123,97,255,0.18)';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(w / 2, 8); ctx.lineTo(w / 2, h - 8); ctx.stroke();
  // Chữ
  ctx.fillStyle = PALETTE.pink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = "700 46px 'Be Vietnam Pro', sans-serif";
  ctx.fillText('Hello,', w / 2, h * 0.62);
  ctx.fillText('World!', w / 2, h * 0.76);
  ctx.font = "600 30px ui-monospace, Consolas, monospace";
  ctx.fillStyle = PALETTE.purple;
  ctx.fillText('printf(…)', w / 2, h * 0.9);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Thuyền giấy nhỏ (Phương) với cánh buồm "Hello, World!".
export function createBoat() {
  const group = new THREE.Group();
  const paper = new THREE.MeshStandardMaterial({ color: '#ffffff', flatShading: true, roughness: 0.8, side: THREE.DoubleSide });
  const accent = new THREE.MeshStandardMaterial({ color: '#ffd6e0', flatShading: true, roughness: 0.8, side: THREE.DoubleSide });

  // Thân thuyền: hình thang đùn dọc trục z
  const shape = new THREE.Shape();
  shape.moveTo(-1.9, 0); shape.lineTo(1.9, 0); shape.lineTo(3.4, 1.6); shape.lineTo(-3.4, 1.6); shape.closePath();
  const hullGeo = new THREE.ExtrudeGeometry(shape, { depth: 2.2, bevelEnabled: false });
  hullGeo.translate(0, 0, -1.1);
  const hull = new THREE.Mesh(hullGeo, [paper, accent]);
  // mũi và đuôi thuyền dọc trục z → xoay để thuyền hướng -z
  hull.rotation.y = Math.PI / 2;
  group.add(hull);

  const sailTex = sailTexture();
  const sailMat = new THREE.MeshBasicMaterial({ map: sailTex, color: '#efe9ec', transparent: true, alphaTest: 0.5, side: THREE.FrontSide, fog: false });
  const sail = new THREE.Group();
  const front = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), sailMat);
  const back = front.clone();
  back.rotation.y = Math.PI;
  sail.add(front, back);
  sail.position.set(0, 3.9, 0);
  sail.rotation.y = Math.PI / 2; // mặt buồm nhìn sang hai bên mạn
  group.add(sail);

  const holder = new THREE.Group();
  holder.add(group);

  function bob(elapsed, waveY) {
    const p = holder.position;
    const y = waveY ? waveY(p.x, p.z, elapsed) : 0;
    group.position.y = y + 0.1;
    group.rotation.z = Math.sin(elapsed * 1.3) * 0.06;
    group.rotation.x = Math.cos(elapsed * 1.1) * 0.04;
  }

  return { group: holder, body: group, sail, bob };
}
