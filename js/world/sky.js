import * as THREE from 'three';
import { PALETTE } from '../config.js';
import { makeGlowTexture } from '../textures.js';

// Vòm trời gradient bình minh + mặt trời mọc dần theo setProgress(0..1).
export function createSky() {
  const group = new THREE.Group();
  const uniforms = {
    top: { value: new THREE.Color(PALETTE.skyTop) },
    mid: { value: new THREE.Color(PALETTE.skyMid) },
    low: { value: new THREE.Color(PALETTE.skyLow) },
    zenith: { value: new THREE.Color('#ffb6c8') },
    light: { value: 0.0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: /* glsl */`
      varying vec3 vPos;
      void main() { vPos = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform vec3 top; uniform vec3 mid; uniform vec3 low; uniform vec3 zenith; uniform float light;
      varying vec3 vPos;
      void main() {
        float h = vPos.y;
        vec3 c = mix(low, mid, smoothstep(-0.02, 0.18, h));
        c = mix(c, top, smoothstep(0.18, 0.5, h));
        c = mix(c, zenith, smoothstep(0.55, 1.0, h) * 0.6);
        c = mix(c, vec3(1.0, 0.97, 0.9), light * 0.18 * (1.0 - smoothstep(0.0, 0.6, h)));
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), mat);
  group.add(dome);

  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture('#fff6c4'), transparent: true, depthWrite: false, fog: false }));
  sun.scale.set(80, 80, 1);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture('#ffe08a'), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0.9 }));
  glow.scale.set(190, 190, 1);
  const sunPivot = new THREE.Group();
  sunPivot.add(glow, sun);
  group.add(sunPivot);

  function setProgress(p) {
    const k = THREE.MathUtils.clamp(p, 0, 1);
    sunPivot.position.set(260, THREE.MathUtils.lerp(-20, 150, k), -720);
    uniforms.light.value = k;
  }
  setProgress(0.25);

  // Giữ vòm trời đi theo camera
  function follow(camera) { group.position.copy(camera.position); }

  return { group, sun: sunPivot, setProgress, follow };
}
