import ffmpeg from "fluent-ffmpeg";
import config from "@proxtx/config";

export const generateVideo = async () => {
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input("E:\\Dev\\Node\\team-hunt-replay\\output")
      .inputOptions([`-framerate ${config.fps}`])

      .videoCodec("libx264")
      .outputOptions(["-pix_fmt yuv420p"])

      .fps(config.fps)

      .saveToFile("E:\\Dev\\Node\\team-hunt-replay\\output.mp4")
      .on("end", () => resolve())
      .on("error", (error) => reject(new Error(error)));
  });
};
