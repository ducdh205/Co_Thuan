// Dòng thời gian của phim: một GSAP master timeline điều khiển máy quay, vật thể, thuyết minh và tấm thiệp.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { SCENES } from './config.js';
import { totalDuration, sceneAt } from './timing.js';
import { cameraKeys, boatKeys } from './keys.js';

export { cameraKeys, boatKeys };

const CARD_AT = 90.5;
const CONTROLS_AT = 92;

export function buildFilm(world, { captionEl, cardEl, controlsEl, onEnd }) {
  const { stage, sky, sea, boat, lighthouse, lights, island, storm, city } = world;
  const cam = stage.camera;
  const total = totalDuration();
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'sine.inOut' } });

  // --- Máy quay -----------------------------------------------------------
  const keys = cameraKeys();
  const rig = { px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0 };
  const setRig = (k) => Object.assign(rig, { px: k.pos[0], py: k.pos[1], pz: k.pos[2], lx: k.look[0], ly: k.look[1], lz: k.look[2] });
  setRig(keys[0]);
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    tl.to(rig, { px: b.pos[0], py: b.pos[1], pz: b.pos[2], lx: b.look[0], ly: b.look[1], lz: b.look[2], duration: b.t - a.t }, a.t);
  }
  const portrait = { k: 1 };
  stage.onResize((aspect) => { portrait.k = aspect < 1 ? 1.5 : 1; });
  const look = new THREE.Vector3();
  const dir = new THREE.Vector3();
  stage.onTick(() => {
    look.set(rig.lx, rig.ly, rig.lz);
    cam.position.set(rig.px, rig.py, rig.pz);
    const fade = 1 - THREE.MathUtils.smoothstep(tl.time(), 84, 88); // không lùi máy ở cảnh thiệp
    if (portrait.k !== 1 && fade > 0) {
      // Màn dọc: lùi máy quay ra xa theo hướng nhìn để giữ chủ thể trong khung
      dir.subVectors(cam.position, look);
      const dist = Math.min(dir.length(), 60);
      dir.normalize().multiplyScalar(dist * (portrait.k - 1) * fade);
      cam.position.add(dir);
    }
    cam.lookAt(look);
  });

  // --- Thuyền -------------------------------------------------------------
  const bk = boatKeys();
  boat.group.position.set(...bk[0].pos);
  tl.set(boat.group, { visible: false }, 0);
  tl.set(boat.group, { visible: true }, 12);
  tl.fromTo(boat.group.position, { y: 12 }, { y: 0, duration: 2.2, ease: 'bounce.out' }, 12);
  tl.fromTo(boat.sail.scale, { x: 0.001, y: 0.001 }, { x: 1, y: 1, duration: 1.4, ease: 'back.out(2.5)' }, 14);
  for (let i = 1; i < bk.length; i++) {
    const a = bk[i - 1], b = bk[i];
    tl.to(boat.group.position, { x: b.pos[0], z: b.pos[2], duration: b.t - a.t }, a.t);
  }

  // --- Bầu trời -----------------------------------------------------------
  const skyState = { p: 0.12 };
  tl.fromTo(skyState, { p: 0.12 }, { p: 0.75, duration: 70, ease: 'none', onUpdate: () => sky.setProgress(skyState.p) }, 0);

  // --- Đốm sáng kiến thức ---------------------------------------------------
  const L = lights.items;
  const lightState = { b: 1, links: 0 };
  const applyLights = () => { lights.setBrightness(lightState.b); lights.setLinksVisible(lightState.links); };
  tl.fromTo(L.map((it) => it), { reveal: 0 }, { reveal: 0, duration: 0.01 }, 0);
  tl.to(L[0], { reveal: 1, duration: 1.6, ease: 'back.out(2)' }, 18);
  [31, 34, 37, 39, 40.5, 42].forEach((at, i) => tl.to(L[i + 1], { reveal: 1, duration: 1.1, ease: 'back.out(2)' }, at));
  tl.to(lightState, { links: 1, duration: 3, onUpdate: applyLights }, 41);
  // giông: tắt dần, rồi sáng lại rực rỡ hơn
  tl.to(lightState, { b: 0.12, duration: 3, onUpdate: applyLights }, 47);
  tl.to(lightState, { b: 1.25, duration: 3, onUpdate: applyLights }, 58);
  for (let i = 7; i < Math.min(12, L.length); i++) tl.to(L[i], { reveal: 1, duration: 1, ease: 'back.out(2)' }, 58.5 + (i - 7) * 0.7);
  if (L.length > 12) tl.to(L.slice(12), { reveal: 1, duration: 0.9, ease: 'back.out(2)', stagger: { amount: 4 } }, 76);

  // --- Đảo C ---------------------------------------------------------------
  const I = island;
  const [lBien, lLoop, lPtr] = I.labelSprites.map((s) => s.material);
  tl.fromTo(I.box.userData.lid.rotation, { x: 0 }, { x: -1.9, duration: 1.2, ease: 'back.out(1.6)' }, 30);
  tl.fromTo(I.box.userData.glow.material, { opacity: 0 }, { opacity: 0.9, duration: 1 }, 30.3);
  tl.fromTo(lBien, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 30.5);
  tl.fromTo(I.whirl.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: 1.5, ease: 'back.out(1.8)' }, 33);
  tl.fromTo(lLoop, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 33.5);
  tl.fromTo(I.arrow.scale, { x: 0.001 }, { x: 1, duration: 1.6, ease: 'power2.out' }, 36);
  tl.fromTo(lPtr, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 36.6);

  // --- Hải đăng ------------------------------------------------------------
  const lh = { on: 0 };
  tl.fromTo(lh, { on: 0 }, { on: 1, duration: 2, onUpdate: () => lighthouse.setOn(lh.on) }, 33);
  tl.set(lighthouse.state, { spin: true }, 0);
  tl.set(lighthouse.state, { spin: false }, 52);
  const aimBoat = lighthouse.aimAngle(new THREE.Vector3(3, 2, -74));
  const aimThesis = lighthouse.aimAngle(new THREE.Vector3(0, 6, -118));
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  tl.call(() => { const r = lighthouse.pivot.rotation; r.y = aimBoat.y + wrap(r.y - aimBoat.y); }, null, 52.3);
  tl.to(lighthouse.pivot.rotation, { y: aimBoat.y, z: aimBoat.z, duration: 2.2, ease: 'power2.inOut' }, 52.5);
  tl.to(lighthouse.pivot.rotation, { y: aimThesis.y, z: aimThesis.z, duration: 3, ease: 'power2.inOut' }, 70);

  // --- Giông bão → cầu vồng -------------------------------------------------
  const st = { s: 0, r: 0 };
  const applyStorm = () => { storm.setStorm(st.s); storm.setRainbow(st.r); };
  tl.fromTo(st, { s: 0 }, { s: 1, duration: 5, onUpdate: applyStorm }, 47);
  storm.bolts.forEach((b, i) => {
    const at = 50 + i * 1.5;
    tl.fromTo(b.material, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'none' }, at);
    tl.to(b.material, { opacity: 0.25, duration: 0.15, ease: 'none' }, at + 0.2);
    tl.to(b.material, { opacity: 1, duration: 0.1, ease: 'none' }, at + 0.4);
    tl.to(b.material, { opacity: 0, duration: 0.9 }, at + 1.1);
  });
  const rock = { a: 0 };
  tl.fromTo(rock, { a: 0 }, { a: 1, duration: 2, yoyo: true, repeat: 1, onUpdate: () => { boat.body.rotation.y = Math.sin(performance.now() / 160) * 0.18 * rock.a; } }, 50);
  tl.to(st, { s: 0, duration: 3.5, onUpdate: applyStorm }, 55.5);
  tl.to(st, { r: 1, duration: 3.5, ease: 'power2.out', onUpdate: applyStorm }, 57);

  // --- Thành phố -------------------------------------------------------------
  tl.set(city.group, { visible: false }, 0);
  tl.set(city.group, { visible: true }, 63.5);
  tl.fromTo(city.group.position, { y: -7 }, { y: 1, duration: 3, ease: "power2.out" }, 63.5);
  tl.to(city.labels.map((l) => l.material), { opacity: 0, duration: 1 }, 86.3);
  tl.to(city.group.position, { y: -16, duration: 3, ease: "power2.in" }, 87.5); // chìm xuống sau màn pháo hoa
  const cg = { g: 0 };
  tl.fromTo(cg, { g: 0 }, { g: 1, duration: 8, ease: 'power1.out', onUpdate: () => city.setGrow(cg.g) }, 65);

  // --- Kết: đốm sáng hội tụ rồi nở thành thiệp --------------------------------
  const center = L[0].home;
  tl.to(L.map((it) => it.sprite.position), { x: center.x, y: center.y, z: center.z, duration: 2.6, ease: 'power3.in', stagger: { amount: 0.6 } }, 87);
  tl.to(L, { reveal: 3, duration: 0.6, ease: 'power2.out' }, 89.6);
  tl.to(L, { reveal: 0, duration: 0.8, ease: 'power2.in' }, 90.2);
  tl.to(lightState, { links: 0, duration: 0.6, onUpdate: applyLights }, 87);
  if (tl.duration() < total) tl.to({}, { duration: total - tl.duration() }, tl.duration());

  // --- Lớp HTML suy ra từ thời gian (an toàn khi tua/xem lại) ------------------
  let lastCaption = null;
  function syncDom() {
    const t = tl.time();
    const sc = sceneAt(t);
    const scene = SCENES[sc.index];
    const show = scene.caption && sc.local >= 0.8 && sc.local <= scene.duration - 1;
    if (scene.caption && scene.caption !== lastCaption) { captionEl.textContent = scene.caption; lastCaption = scene.caption; }
    captionEl.classList.toggle('show', !!show);
    const cardOn = t >= CARD_AT;
    if (cardOn && cardEl.hidden) { cardEl.hidden = false; cardEl.classList.remove('reveal'); void cardEl.offsetWidth; cardEl.classList.add('reveal'); }
    if (!cardOn && !cardEl.hidden) { cardEl.hidden = true; cardEl.classList.remove('reveal'); }
    controlsEl.hidden = t < CONTROLS_AT;
  }
  tl.eventCallback('onUpdate', syncDom);
  tl.eventCallback('onComplete', () => onEnd && onEnd());

  return {
    tl,
    get ended() { return tl.progress() >= 1; },
    play() { tl.play(); },
    pause() { tl.pause(); },
    resume() { if (tl.progress() < 1) tl.play(); },
    seek(t) { tl.pause(); tl.seek(t, false); syncDom(); },
    restart() { lighthouse.pivot.rotation.set(0, 0, 0); tl.restart(); syncDom(); },
  };
}
