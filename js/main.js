import { parseParams } from './timing.js';
import { pickQuality } from './quality.js';
import { boot } from './boot.js';
import { createMusic, probeMusic } from './audio.js';
import { visibilityActions } from './visibility.js';

const params = parseParams(location.search);
const debug = new URLSearchParams(location.search).get('debug');
const $ = (id) => document.getElementById(id);

let world = null;
let film = null;
let music = null;
let started = false;
let hasFile = false;
const musicProbe = probeMusic().then((ok) => (hasFile = ok));

function ensureMusic() {
  if (!music) music = createMusic({ hasFile });
  return music;
}

function updateMusicButton() {
  $('music').textContent = music && music.playing ? '🔊' : '🔇';
}

async function loadWorld() {
  const quality = pickQuality({
    width: window.innerWidth,
    dpr: window.devicePixelRatio || 1,
    cores: navigator.hardwareConcurrency || 4,
    forced: params.quality,
  });
  const [{ buildWorld }, { buildFilm }] = await Promise.all([
    import('./world/index.js'),
    import('./film.js'),
  ]);
  world = await buildWorld($('scene'), quality);
  film = buildFilm(world, {
    captionEl: $('caption'),
    cardEl: $('card'),
    controlsEl: $('controls'),
    onEnd: () => {},
  });
  window.__film = film; // để kiểm thử tự động
  await musicProbe;
  if (debug) applyDebug(world, debug);
  else if (params.seek !== null) film.seek(params.seek);
}

function onStart() {
  started = true;
  if (params.seek !== null || debug) return; // chế độ chụp ảnh: đứng yên tại thời điểm đã tua
  if (!params.autostart) { ensureMusic().play(); updateMusicButton(); }
  film.play();
}

$('replay').addEventListener('click', () => {
  if (!film) return;
  film.restart();
  ensureMusic().restart();
  updateMusicButton();
});

$('music').addEventListener('click', () => {
  ensureMusic().toggle();
  updateMusicButton();
});

document.addEventListener('visibilitychange', () => {
  const act = visibilityActions({
    hidden: document.hidden, started: started && !!film, ended: !!film && film.ended,
    muted: !music || music.muted, frozen: params.seek !== null || !!debug,
  });
  if (act.film === 'pause') film.pause();
  if (act.film === 'resume') film.resume();
  if (music && act.music === 'pause') music.pause();
  if (music && act.music === 'play') music.play();
  updateMusicButton();
});

function applyDebug(w, mode) {
  const cam = w.stage.camera;
  w.stage.onTick(() => {}); // giữ vòng lặp
  film.pause();
  const fix = (pos, look) => w.stage.onTick(() => { cam.position.set(...pos); cam.lookAt(...look); });
  if (mode === 'lights') {
    w.lighthouse.setOn(1);
    w.lights.items.forEach((it) => (it.reveal = 1));
    w.lights.setLinksVisible(1);
    fix([0, 8, 30], [0, 60, -230]);
  }
  if (mode === 'island') {
    const I = w.island;
    w.lighthouse.setOn(1);
    I.box.userData.lid.rotation.x = -1.9;
    I.box.userData.glow.material.opacity = 0.9;
    I.arrow.scale.x = 1;
    I.whirl.scale.setScalar(1);
    I.labelSprites.forEach((s) => (s.material.opacity = 1));
    fix([57, 14, -24], [31, 3, -54]);
  }
  if (mode === 'city' || mode === 'city-street') {
    w.city.setGrow(1);
    w.lighthouse.setOn(1);
    if (mode === 'city') fix([0, 125, -95], [0, 0, -138]);
    else fix([22, 9, -96], [0, 7, -125]);
  }
  if (mode === 'storm' || mode === 'rainbow') {
    w.storm.setStorm(mode === 'storm' ? 1 : 0);
    w.storm.setRainbow(mode === 'rainbow' ? 1 : 0);
    w.storm.bolts.forEach((b) => (b.material.opacity = mode === 'storm' ? 1 : 0));
    fix([0, 8, -55], [5, mode === 'storm' ? 18 : 20, -120]);
  }
}

boot({ params, loadWorld, onStart, onReady: () => world.stage.start() });
