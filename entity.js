import * as files from "./files.js";
import { GameObject } from "./objects.js";

export class Entities {
  entities = {};

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
          entities[entity],
          this.timeScale,
          this.states
        );

        await this.entities[entity].init();
      }
    }
  }

  getObjects(frame) {
    let objects = {};

    for (let entity in this.entities) {
      let obj = this.entities[entity].getObject(frame);
      if (obj) objects[entity] = obj;
    }

    return objects;
  }
}

const readEntities = (gameState, time) => {
  let obj = {};

  if (gameState.runnerInformation.locatorLocation)
    obj.locatorLocation = {
      type: "locator",
    };

  for (let team in gameState.teams) {
    for (let member of gameState.teams[team].members) {
      if (gameState.users[member] && gameState.users[member].locationUpdate) {
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
  constructor(fileIndex, entity, timeScale, states) {
    this.fileIndex = fileIndex;
    this.entity = entity;
    this.timeScale = timeScale;
    this.states = states;
  }

  async init() {
    this.initGameState = await files.readFile(this.states[this.fileIndex]);
    this.initEntityLocation = readEntity(this.initGameState, this.entity);
    this.initTime = Number(this.states[this.fileIndex].split(".")[0]);
    this.firstFrameTime = Number(this.states[0].split(".")[0]);
    this.initFrame = (this.initTime - this.firstFrameTime) / this.timeScale;

    await this.findEndState();
  }

  async findEndState() {
    this.endStateIndex = this.fileIndex;
    while (
      Number(this.states[this.endStateIndex].split(".")[0]) - this.initTime <
        1000 * 90 ||
      !this.states[this.endStateIndex + 1]
    ) {
      let location = readEntity(
        await files.readFile(this.states[this.endStateIndex]),
        this.entity
      );
      if (
        location &&
        (location[0] != this.initEntityLocation[0] ||
          location[1] != this.initEntityLocation[1])
      ) {
        break;
      }

      this.endStateIndex++;
    }

    this.endEntityLocation = readEntity(
      await files.readFile(this.states[this.endStateIndex]),
      this.entity
    );
    this.endTime = Number(this.states[this.endStateIndex].split(".")[0]);
    this.endFrame = (this.endTime - this.firstFrameTime) / this.timeScale;
    this.endState = this.states[this.endStateIndex];
  }

  getObject(frame) {
    if (
      this.entity.type == "user" &&
      this.initGameState.users[this.entity.user].locationUpdate &&
      this.initTime -
        this.initGameState.users[this.entity.user].locationUpdate >
        1000 * 60 * 3 &&
      true
    ) {
      return null;
    }

    let percent = (frame - this.initFrame) / (this.endFrame - this.initFrame);

    return new GameObject(
      getTransitionPosition(
        this.initEntityLocation,
        this.endEntityLocation,
        percent
      ),
      this.entity.type == "locator"
        ? "locatorLocation"
        : "player_" + this.entity.team
    );
  }
}

const getTransitionPosition = (initPos, endPos, percent) => {
  return [
    initPos[0] + (endPos[0] - initPos[0]) * percent,
    initPos[1] + (endPos[1] - initPos[1]) * percent,
  ];
};

const readEntity = (gameState, entity) => {
  if (entity.type == "locator")
    return gameState.runnerInformation.locatorLocation.map((v) => Number(v));
  if (entity.type == "user" && gameState.users[entity.user]?.location)
    return gameState.users[entity.user].location;
};
