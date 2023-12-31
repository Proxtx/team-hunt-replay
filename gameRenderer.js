import * as files from "./files.js";
import { Map } from "./map.js";
import config from "@proxtx/config";
import { Objects } from "./objects.js";
import { generateVideo } from "./video.js";
import { Entities } from "./entity.js";
import { UI } from "./ui.js";

const outputFiles = await files.getOutputFiles();

//const ui = new UI();

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

  /*ui.render(await files.readFile(states[500]));
  await ui.save();*/

  for (let stateIndex in states) {
    let index = Number(stateIndex);
    if (!states[index + 1]) break;
    await renderState(index, index + 1, map, entities);
  }

  //await generateVideo();
};

const renderState = async (
  currentStateFileIndex,
  nextStateFileIndex,
  map,
  entities
) => {
  let firstFrameTime = Number(states[0].split(".")[0]);

  let startTime = Number(states[currentStateFileIndex].split(".")[0]);
  let startFrame = Math.round((startTime - firstFrameTime) / config.timeScale);

  let endTime = Number(states[nextStateFileIndex].split(".")[0]);
  let endFrame = Math.round((endTime - firstFrameTime) / config.timeScale);

  let currentStateFile = states[currentStateFileIndex];
  let nextStateFile = states[nextStateFileIndex];

  console.log(currentStateFile, endFrame - startFrame);

  let objects = new Objects(currentStateFile, nextStateFile, config.timeScale);
  await objects.init();

  await entities.readState(currentStateFileIndex);

  for (let i = 0; startFrame + i < endFrame; i++) {
    console.log(startFrame + i);
    if (outputFiles.includes(startFrame + i + ".png")) continue;
    map.applyObjects(await objects.generateAnimatedObjects(i));
    map.applyObjects(entities.getObjects(startFrame + i), false);
    await map.save(startFrame + i);
  }

  return objects.getIntermediateFrames() + startFrame;
};

//relaunch at 2685
//2686
//max: 17981
