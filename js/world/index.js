// Dựng toàn bộ thế giới 3D. Được import động từ main.js để lỗi CDN có thể bắt được → thiệp 2D.
import { createStage } from '../stage.js';
import { createSky } from './sky.js';
import { createSea } from './sea.js';
import { createBoat } from './boat.js';
import { createLighthouse } from './lighthouse.js';
import { createKnowledgeLights } from './lights.js';
import { createIsland } from './island.js';
import { createStorm } from './storm.js';

export const PLACES = {
  boatStart: [0, 0, 0],
  lighthouse: [-30, 0, -40],
  island: [25, 0, -60],
  storm: [5, 0, -100],
};

export async function buildWorld(canvas, quality) {
  await Promise.all([
    document.fonts.load("700 64px 'Be Vietnam Pro'"),
    document.fonts.load("600 64px 'Be Vietnam Pro'"),
    document.fonts.load("700 64px 'Dancing Script'"),
  ]).catch(() => {});

  const stage = await createStage(canvas, quality);
  const sky = createSky();
  const sea = createSea(quality);
  const boat = createBoat();
  const lighthouse = createLighthouse();
  const lights = createKnowledgeLights(quality.sparkCount);
  const island = createIsland();
  const storm = createStorm({ hemi: stage.hemi, sunLight: stage.sunLight });
  island.group.position.set(...PLACES.island);
  storm.group.position.set(...PLACES.storm);
  stage.scene.add(island.group, storm.group);

  boat.group.position.set(...PLACES.boatStart);
  lighthouse.group.position.set(...PLACES.lighthouse);
  stage.scene.add(sky.group, sea.group, boat.group, lighthouse.group, lights.group);

  const world = { stage, sky, sea, boat, lighthouse, lights, island, storm, quality };

  stage.onTick((dt, t) => {
    sky.follow(stage.camera);
    sea.update(t);
    boat.bob(t, sea.waveY);
    lighthouse.update(dt);
    lights.update(t);
    island.update(dt);
    storm.update(dt);
    for (const fn of world.extraTicks || []) fn(dt, t);
  });
  return world;
}
