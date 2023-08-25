import * as files from "./files.js";
import { Map } from "./map.js";
import config from "@proxtx/config";

export const renderGame = async () => {
  let states = await files.getFiles();

  let map = new Map({
    tileUrl: config.tileUrl,
    width: config.width,
    height: config.width,
    center: config.center,
    zoom: config.zoom,
    tileSize: 512,
  });

  renderFrame(states[500], map);
};

const renderFrame = async (file, map) => {
  let state = await files.readFile(file);

  map.applyGameState(state);

  await map.debug();
};
