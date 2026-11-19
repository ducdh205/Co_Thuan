import * as THREE from 'three';
import { PALETTE } from './config.js';

export async function createStage(canvas, quality) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality.tier === 'high', powerPreference: 'high-performance' });
  renderer.setPixelRatio(quality.pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PALETTE.skyLow, 140, 560);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 1500);
  camera.position.set(14, 6, 22);
  camera.lookAt(0, 2, -10);

  const hemi = new THREE.HemisphereLight('#fff4ea', '#9ef0e6', 2.1);
  const sunLight = new THREE.DirectionalLight('#fff1d0', 2.0);
  sunLight.position.set(120, 60, -300);
  scene.add(hemi, sunLight, new THREE.AmbientLight('#ffe9f0', 0.7));

  let composer = null;
  let bloomPass = null;
  if (quality.bloom) {
    const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
      import('three/addons/postprocessing/EffectComposer.js'),
      import('three/addons/postprocessing/RenderPass.js'),
      import('three/addons/postprocessing/UnrealBloomPass.js'),
      import('three/addons/postprocessing/OutputPass.js'),
    ]);
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.45, 0.97);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
  }

  const resizeFns = [];
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.fov = camera.aspect < 1 ? 65 : 50;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    if (composer) composer.setSize(w, h);
    resizeFns.forEach((fn) => fn(camera.aspect));
  }
  window.addEventListener('resize', resize);
  resize();

  const ticks = [];
  const clock = new THREE.Clock();
  let elapsed = 0;
  // Bảo vệ hiệu năng: đo FPS trong 3 giây (sau 1 giây khởi động); dưới 30 → tắt bloom, giảm độ phân giải
  const fps = { frames: 0, time: 0, done: false };
  function frame() {
    const raw = clock.getDelta();
    const dt = Math.min(raw, 0.1);
    elapsed += dt;
    if (!fps.done && elapsed > 1) {
      fps.frames++; fps.time += raw;
      if (fps.time >= 3) {
        fps.done = true;
        const avg = fps.frames / fps.time;
        if (avg < 30 && composer) { console.info("[stage] FPS", avg.toFixed(1), "→ giảm chất lượng"); stageApi.degrade(); }
      }
    }
    for (const fn of ticks) fn(dt, elapsed);
    if (composer) composer.render(); else renderer.render(scene, camera);
  }

  const stageApi = {
    renderer, scene, camera, sunLight, hemi,
    get bloom() { return !!composer; },
    onTick(fn) { ticks.push(fn); },
    onResize(fn) { resizeFns.push(fn); fn(camera.aspect); },
    start() { clock.getDelta(); renderer.setAnimationLoop(frame); },
    stop() { renderer.setAnimationLoop(null); },
    renderOnce() { frame(); },
    degrade() { composer = null; renderer.setPixelRatio(Math.min(quality.pixelRatio, 1.25)); resize(); },
  };
  return stageApi;
}
