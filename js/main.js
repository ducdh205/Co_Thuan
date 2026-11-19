import { parseParams } from './timing.js';
import { pickQuality } from './quality.js';
import { boot } from './boot.js';

const params = parseParams(location.search);
const debug = new URLSearchParams(location.search).get('debug');
let world = null;

async function loadWorld() {
  const quality = pickQuality({
    width: window.innerWidth,
    dpr: window.devicePixelRatio || 1,
    cores: navigator.hardwareConcurrency || 4,
    forced: params.quality,
  });
  const { buildWorld } = await import('./world/index.js');
  world = await buildWorld(document.getElementById('scene'), quality);
  if (debug) applyDebug(world, debug);
  world.stage.start();
}

function applyDebug(w, mode) {
  const cam = w.stage.camera;
  if (mode === "island") {
    const I = w.island;
    w.lighthouse.setOn(1);
    I.box.userData.lid.rotation.x = -1.9;
    I.box.userData.glow.material.opacity = 0.9;
    I.arrow.scale.x = 1;
    I.whirl.scale.setScalar(1);
    I.labelSprites.forEach((s) => (s.material.opacity = 1));
    cam.position.set(48, 14, -28);
    cam.lookAt(22, 3, -58);
  }
  if (mode === "storm" || mode === "rainbow") {
    w.storm.setStorm(mode === "storm" ? 1 : 0);
    w.storm.setRainbow(mode === "rainbow" ? 1 : 0);
    w.storm.bolts.forEach((b) => (b.material.opacity = mode === "storm" ? 1 : 0));
    cam.position.set(0, 8, -55);
    cam.lookAt(5, mode === "storm" ? 18 : 20, -120);
  }
  if (mode === 'lights') {
    w.lighthouse.setOn(1);
    w.lights.items.forEach((it) => (it.reveal = 1));
    w.lights.setLinksVisible(1);
    w.stage.camera.position.set(0, 8, 30);
    w.stage.camera.lookAt(0, 60, -230);
  }
}

boot({ params, loadWorld, onStart: () => {} });
