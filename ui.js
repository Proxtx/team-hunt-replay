import { Canvas } from "canvas";
import fs from "fs/promises";

export class UI {
  constructor(width, height, fontSize) {
    this.canvas = new Canvas(width, height);
    this.width = width;
    this.height = height;
    this.fontSize = fontSize;
    this.ctx = this.canvas.getContext("2d");
  }

  render(gameState) {
    this.drawTeam(this.width, this.height);
  }

  drawTeam(availableWidth, availableHeight, teamIndex) {
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = availableWidth / 20;
    this.ctx.strokeRect(0, 0, availableWidth, availableHeight);
  }

  async save(frame) {
    await fs.save(
      "output_ui/" + frame + ".png",
      this.canvas.toBuffer("image/png")
    );
  }
}
