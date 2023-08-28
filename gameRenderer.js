import * as files from "./files.js";
import { Map } from "./map.js";
import config from "@proxtx/config";
import { Objects } from "./objects.js";
import { generateVideo } from "./video.js";
import { Entities } from "./entity.js";

const outputFiles = await files.getOutputFiles();

let states = await files.getFiles();

export const renderGame = async () => {
  let map = new Map({
    tileUrl: config.tileUrl,
    width: config.width,
    height: config.width,
    center: config.center,
    zoom: config.zoom,
    tileSize: 256 * 4,
  });

  //let stateIndex = states.indexOf("1691850950284.json");

  let entities = new Entities(config.timeScale, states);

  /*let frame = Math.round(
    (Number(states[stateIndex].split(".")[0]) -
      Number(states[0].split(".")[0])) /
      config.timeScale
  );*/

  let frame = 0;

  for (let stateIndex in states) {
    let index = Number(stateIndex);
    if (!states[index + 1]) break;
    frame = await renderState(index, index + 1, map, frame, entities);
  }

  //await generateVideo();
};

const renderState = async (
  currentStateFileIndex,
  nextStateFileIndex,
  map,
  startFrame,
  entities
) => {
  let currentStateFile = states[currentStateFileIndex];
  let nextStateFile = states[nextStateFileIndex];

  let objects = new Objects(currentStateFile, nextStateFile, config.timeScale);
  await objects.init();

  await entities.readState(currentStateFileIndex);

  console.log(currentStateFile);

  for (let i = 0; i < objects.getIntermediateFrames(); i++) {
    console.log(startFrame + i);
    if (outputFiles.includes(startFrame + i + ".png")) continue;
    map.applyObjects(await objects.generateAnimatedObjects(i));
    map.applyObjects(entities.getObjects(startFrame + i), false);
    await map.save(startFrame + i);
  }

  return objects.getIntermediateFrames() + startFrame;
};

//relaunch at 2685
