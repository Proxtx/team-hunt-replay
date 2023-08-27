import StaticMaps from "staticmaps";

export class Map {
  constructor(options) {
    this.options = {
      ...{},
      ...options,
    };
  }

  applyObjects(objects) {
    objects = JSON.parse(JSON.stringify(objects));

    this.map = new StaticMaps({
      width: this.options.width,
      height: this.options.height,
      tileUrl: this.options.tileUrl,
      tileSize: this.options.tileSize,
    });

    for (let objectName in objects) {
      let object = objects[objectName];
      this.map.addMarker({
        img: object.icon,
        width: 50,
        height: 50,
        /*drawHeight: 20,
        drawWidth: 20,*/
        coord: object.location.reverse(),
      });
    }
  }

  async render() {
    await this.map.render(this.options.center.reverse(), this.options.zoom);
    this.options.center.reverse();
  }

  async debug() {
    await this.render();
    await this.map.image.save("debug.png");
  }

  async save(id) {
    await this.render();
    await this.map.image.save("output/" + id + ".png");
  }
}
