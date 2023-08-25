import StaticMaps from "staticmaps";

export class Map {
  constructor(options) {
    this.options = {
      ...{},
      ...options,
    };

    this.map = new StaticMaps({
      width: this.options.width,
      height: this.options.height,
      tileUrl: this.options.tileUrl,
      tileSize: this.options.tileSize,
    });
  }

  applyGameState(gameState) {
    console.log(gameState);
  }

  async render() {
    await this.map.render(this.options.center.reverse(), this.options.zoom);
  }

  async debug() {
    await this.render();
    await this.map.image.save("debug.png");
  }
}
