import fs from "node:fs";
import path from "node:path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import type { ISettingUser } from "../core/client.js";

ffmpeg.setFfmpegPath(ffmpegPath);

async function convertToCircleVideo(
  inputPath: string,
  outputPath: string,
  settings: ISettingUser,
): Promise<boolean> {
  const qualitySettings: Record<string, any> = {
    low: {
      scale: "620:620",
      bitrate: "1500k",
      maxrate: "1500k",
      bufsize: "3000k",
      filesize: "5M",
    },
    medium: {
      scale: "620:620",
      bitrate: "2000k",
      maxrate: "2000k",
      bufsize: "4000k",
      filesize: "25M",
    },
    high: {
      scale: "620:620",
      bitrate: "2500k",
      maxrate: "2500k",
      bufsize: "5000k",
      filesize: "50M",
    },
  };

  const selectedSettings =
    qualitySettings[settings?.quality] || qualitySettings.medium;

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        `-vf scale=${selectedSettings.scale},setsar=1:1`,
        "-vcodec libx264",
        "-acodec aac",
        "-f mp4",
        `-b:v ${selectedSettings.bitrate}`,
        `-maxrate ${selectedSettings.maxrate}`,
        `-bufsize ${selectedSettings.bufsize}`,
        `-fs ${selectedSettings.filesize}`,
      ])
      .save(outputPath)
      .on("end", async () => {
        console.log("Конвертация завершена");
        if (settings.isBlastVideo) {
          await mergeVideos(
            outputPath,
            path.join(
              process.cwd(),
              `uploads/assert/blast_${settings.quality}.mp4`,
            ),
            outputPath,
          )
            .then((response) => resolve(response))
            .catch((err) => reject(err));
          return;
        }
        resolve(true);
      })
      .on("error", (err) => {
        console.error("Ошибка конвертации:", err.message);
        reject(err);
      });
  });
}

async function mergeVideos(
  originVideo: string,
  mergeToVideo: string,
  outputPath: string,
): Promise<true> {
  return new Promise(async (resolve, reject) => {
    ffmpeg(originVideo)
      .input(mergeToVideo)
      .on("end", () => {
        console.log("Взрыв добавлен!");
        resolve(true);
      })
      .on("error", (err) => {
        console.error("Ошибка взрыва:", err.message);
        reject(err);
      })
      .mergeToFile(
        outputPath.replace(".mp4", "_temp.mp4"),
        path.join(process.cwd(), "assert/"),
      );
  });
}

export { convertToCircleVideo };
