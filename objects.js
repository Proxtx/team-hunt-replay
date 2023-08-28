import { readFile } from "./files.js";

export class Objects {
  constructor(currentGameStateFile, nextGameStateFile, timeScale) {
    this.currentGameStateFile = currentGameStateFile;
    this.nextGameStateFile = nextGameStateFile;
    this.currentGameStateTime = Number(currentGameStateFile.split(".")[0]);
    this.nextGameStateTime = Number(nextGameStateFile.split(".")[0]);
    this.timeScale = timeScale;
  }

  async init() {
    this.currentGameState = await readFile(this.currentGameStateFile);
    this.nextGameState = await readFile(this.nextGameStateFile);
    this.targetObjects = readObjects(
      this.nextGameState,
      this.nextGameStateTime
    );
  }

  getIntermediateFrames() {
    return Math.floor(
      (this.nextGameStateTime - this.currentGameStateTime) / this.timeScale
    );
  }

  generateAnimatedObjects(frame) {
    //console.log(frame);
    let intermediateFrames = this.getIntermediateFrames();
    let progress = frame / intermediateFrames;
    let currentObjects = readObjects(
      this.currentGameState,
      this.currentGameStateTime
    );
    for (let object in currentObjects) {
      if (!this.targetObjects[object]) continue;
      currentObjects[object].location[0] +=
        (this.targetObjects[object].location[0] -
          currentObjects[object].location[0]) *
        progress;
      currentObjects[object].location[1] +=
        (this.targetObjects[object].location[1] -
          currentObjects[object].location[1]) *
        progress;
    }

    return currentObjects;
  }
}

const readObjects = (gameState, time) => {
  let obj = {};

  let capturedLocations =
    gameState.liveInformation.publiclyCapturedLocations.concat(
      gameState.runnerInformation.capturedLocations
    );
  let availableLocations = gameState.config.locations.filter((v) => {
    for (let location of capturedLocations)
      if (location == v.name) return false;
    return true;
  });

  for (let location of availableLocations) {
    obj["location_" + location.name] = new Object(
      location.location.split(" ").map((v) => Number(v)),
      "location"
    );
  }

  /*obj.locatorLocation = new Object(
    gameState.runnerInformation.locatorLocation.map((v) => Number(v)),
    "locatorLocation"
  );*/

  for (let fakeLocation in gameState.runnerInformation.pendingFakeLocations) {
    obj["fakeLocation" + fakeLocation] = new Object(
      gameState.runnerInformation.pendingFakeLocations[fakeLocation],
      "fakeLocation"
    );
  }

  /*for (let team in gameState.teams) {
    for (let member of gameState.teams[team].members) {
      if (
        gameState.users[member] &&
        gameState.users[member].locationUpdate &&
        time - gameState.users[member].locationUpdate < 1000 * 60
      ) {
        obj[member] = new Object(
          gameState.users[member].location,
          "player_" + team
        );
      }
    }
  }*/

  return obj;
};

class Object {
  constructor(location, icon, size = 1) {
    this.location = location;
    this.icon = "lib/" + icon + ".svg";
    this.size = size;
  }
}
