import * as files from "./files.js";

export class Entities {
  entities = {};
  maxSearchPositions = {};

  constructor(timeScale, states) {
    this.timeScale = timeScale;
    this.states = states;
  }

  async readState(index) {
    let gameState = await files.readFile(this.states[index]);

    for (let entity in this.entities) {
      if (this.entities[entity].endState == this.states[index])
        delete this.entities[entity];
    }

    let entities = readEntities(gameState);
    for (let entity in entities) {
      if (!this.entities[entity]) {
        this.entities[entity] = new Entity(
          index,
          entity,
          this.timeScale,
          this.states,
          this.maxSearchPositions[entity]
        );

        await this.entities[entity].init();
      }
    }
  }

  getObjects(frame) {
    let objects = {};

    for (let entity of this.entities) {
      let obj = this.entities[entity].getObject(frame);
      if (obj) objects[entity] = obj;
    }

    return objects;
  }
}

const readEntities = (gameState) => {
  let obj = {};

  if (gameState.runnerInformation.locatorLocation)
    obj.locatorLocation = {
      type: "locator",
    };

  for (let team in gameState.teams) {
    for (let member of gameState.teams[team].members) {
      if (
        gameState.users[member] &&
        gameState.users[member].locationUpdate &&
        time - gameState.users[member].locationUpdate < 1000 * 60
      ) {
        obj[member] = {
          type: "user",
          user: member,
          team,
        };
      }
    }
  }

  return obj;
};

export class Entity {
  constructor(fileIndex, entity, timeScale, states, initMaxSearchPosition) {
    this.fileIndex = fileIndex;
    this.entity = entity;
    this.timeScale = timeScale;
    this.states = states;
  }

  async init() {
    this.initEntityLocation = readEntity(
      await files.readFile(this.states[this.fileIndex])
    );
    this.initTime = Number(this.states[this.fileIndex].split(".")[0]);
    this.firstFrameTime = Number(this.states[0].split(".")[0]);
    this.initFrame = (this.initTime - this.firstFrameTime) / this.timeScale;
  }

  async findEndState() {
    this.endStateIndex = this.fileIndex;
    let found = false;
    while (
      this.states[this.endStateIndex] - this.states[this.fileIndex] <
      1000 * 90
    ) {
      let location = readEntity(
        await files.readFile(this.states[this.endStateIndex])
      );
      if (
        location &&
        (location[0] != this.initEntityLocation[0] ||
          location[1] != this.initEntityLocation[1])
      ) {
        found = true;
        break;
      }
    }

    this.endEntityLocation = readEntity(
      await files.readFile(this.states[this.endStateIndex])
    );
    this.endTime = Number(this.states[this.endStateIndex].split(".")[0]);
    this.endFrame = (this.endTime - this.firstFrameTime) / this.timeScale;
    this.endState = this.states[this.endStateIndex];

    if (!found) {
      this.maxSearchPosition = this.endEntityLocation;
    }
  }

  getObject() {
    if (
      this.initMaxSearchPosition[0] == this.initEntityLocation[0] &&
      this.initMaxSearchPosition[1] == this.initEntityLocation[1]
    )
      return null;
  }
}

const readEntity = (gameState, entity) => {
  if (entity.type == "locator")
    return gameState.liveInformation.locatorLocation;
  if (entity.type == "user") return;
  if (gameState.users[entity.user]?.location)
    return gameState.users[entity.user].location;
};
