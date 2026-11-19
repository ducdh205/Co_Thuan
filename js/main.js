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
  if (mode === 'lights') {
    w.lighthouse.setOn(1);
    w.lights.items.forEach((it) => (it.reveal = 1));
    w.lights.setLinksVisible(1);
    w.stage.camera.position.set(0, 8, 30);
    w.stage.camera.lookAt(0, 60, -230);
  }
}

boot({ params, loadWorld, onStart: () => {} });
