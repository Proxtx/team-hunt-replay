import * as files from "./files.js";
import { Map } from "./map.js";
import config from "@proxtx/config";
import { Objects } from "./objects.js";
import { generateVideo } from "./video.js";

export const renderGame = async () => {
  let states = await files.getFiles();

  let map = new Map({
    tileUrl: config.tileUrl,
    width: config.width,
    height: config.width,
    center: config.center,
    zoom: config.zoom,
    tileSize: 256 * 4,
  });

  let frame = 0;

  for (let stateIndex in states) {
    let index = Number(stateIndex);
    if (!states[index + 1]) continue;
    frame = await renderState(states[index], states[index + 1], map, frame);
  }

  //await renderState(states[499], states[500], map);

  //await generateVideo();
};

const renderState = async (
  currentStateFile,
  nextStateFile,
  map,
  startFrame
) => {
  let objects = new Objects(currentStateFile, nextStateFile, config.timeScale);
  await objects.init();

  /*map.applyObjects(objects.generateAnimatedObjects(0));
  await map.debug();
  map.applyObjects(objects.generateAnimatedObjects(1));
  await map.debug();*/

  //console.log(objects.getIntermediateFrames());

  for (let i = 0; i < objects.getIntermediateFrames(); i++) {
    map.applyObjects(await objects.generateAnimatedObjects(i));
    console.log(startFrame + i);
    await map.save(startFrame + i);
  }

  return objects.getIntermediateFrames() + startFrame;
};
