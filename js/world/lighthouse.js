import * as THREE from 'three';
import { PALETTE } from '../config.js';
import { makeGlowTexture } from '../textures.js';

// Ngọn hải đăng (cô Thuận): thân sọc trắng-hồng trên đá, tia sáng quét.
export function createLighthouse() {
  const group = new THREE.Group();
  const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.75, ...extra });

  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(9, 0), flat('#d9a7a0'));
  rock.scale.set(1.3, 0.5, 1.1);
  rock.position.y = -0.5;
  const rock2 = new THREE.Mesh(new THREE.DodecahedronGeometry(5, 0), flat('#e9bfb5'));
  rock2.position.set(7, -0.8, 3);
  rock2.scale.y = 0.55;
  group.add(rock, rock2);

  const H = 16, rows = 6;
  for (let i = 0; i < rows; i++) {
    const t0 = i / rows, t1 = (i + 1) / rows;
    const r0 = THREE.MathUtils.lerp(2.6, 1.7, t0), r1 = THREE.MathUtils.lerp(2.6, 1.7, t1);
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, H / rows, 12), flat(i % 2 ? PALETTE.pink : '#ffffff'));
    seg.position.y = 3 + (i + 0.5) * (H / rows);
    group.add(seg);
  }
  const topY = 3 + H;
  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.6, 12), flat('#ffffff'));
  gallery.position.y = topY + 0.3;
  const lampMat = new THREE.MeshStandardMaterial({ color: PALETTE.sun, emissive: PALETTE.sun, emissiveIntensity: 0.3, flatShading: true });
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.2, 10), lampMat);
  lamp.position.y = topY + 1.7;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.4, 10), flat(PALETTE.purple));
  roof.position.y = topY + 4;
  group.add(gallery, lamp, roof);

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture('#ffe08a'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false }));
  halo.scale.set(16, 16, 1);
  halo.position.y = lamp.position.y;
  group.add(halo);

  // Tia sáng: hình nón mở, đỉnh ở đèn, hướng theo +x của pivot
  const beamLen = 130;
  const beamGeo = new THREE.ConeGeometry(9, beamLen, 24, 1, true);
  beamGeo.translate(0, -beamLen / 2, 0);
  beamGeo.rotateZ(Math.PI / 2);
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { opacity: { value: 0 }, color: { value: new THREE.Color('#fff3c2') }, len: { value: beamLen } },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: /* glsl */`
      varying float vD;
      void main() { vD = position.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float opacity; uniform vec3 color; uniform float len;
      varying float vD;
      void main() { float k = 1.0 - clamp(vD / len, 0.0, 1.0); gl_FragColor = vec4(color, opacity * k * k); }`,
  });
  Object.defineProperty(beamMat, 'opacity', { get: () => beamMat.uniforms.opacity.value, set: (v) => { if (beamMat.uniforms) beamMat.uniforms.opacity.value = v; } });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  const pivot = new THREE.Group();
  pivot.position.y = lamp.position.y;
  pivot.add(beam);
  group.add(pivot);

  const light = new THREE.PointLight('#ffe7a8', 0, 90, 1.5);
  light.position.y = lamp.position.y;
  group.add(light);

  const state = { spin: true, on: 0 };
  function setOn(v) {
    state.on = v;
    lampMat.emissiveIntensity = 0.3 + 2.2 * v;
    beamMat.opacity = 0.22 * v;
    halo.material.opacity = 0.7 * v;
    light.intensity = 60 * v;
  }
  setOn(0);

  // Xoay pivot để tia chiếu tới điểm thế giới
  const tmp = new THREE.Vector3();
  function aimAngle(worldPoint) {
    group.updateMatrixWorld();
    tmp.copy(worldPoint);
    pivot.parent.worldToLocal(tmp);
    tmp.sub(pivot.position);
    return { y: Math.atan2(-tmp.z, tmp.x), z: Math.atan2(tmp.y, Math.hypot(tmp.x, tmp.z)) };
  }

  function update(dt) {
    if (state.spin) pivot.rotation.y = (pivot.rotation.y + dt * 0.6) % (Math.PI * 2);
  }

  return { group, lamp, beam, pivot, state, setOn, aimAngle, update };
}
