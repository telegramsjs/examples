import fs, { type ReadStream } from "node:fs";
import path from "node:path";
import { Events, InlineKeyboardBuilder, type Message } from "telegramsjs";
import { Collection } from "@telegram.ts/collection";
import type { Client } from "../../src/core/client.js";
import { EventsManager } from "../../src/EventsManager.js";
import { convertToCircleVideo } from "../../src/utils/index.js";

const useVideoUser = new Collection<string, boolean>();
const cacheVideo = new Collection<string, ReadStream>();

const MAX_MEMORY_MB = 150;
const MAX_VIDEO_DURATION = 60; // seconds
const MAX_VIDEO_SIZE = 20_971_520; // bytes

const clearFiles = async (files: string[]) => {
  for (const file of files) {
    try {
      await fs.promises.unlink(file);
    } catch (err) {
      console.error(`Ошибка удаления файла (${file}):`, err);
    }
  }
};

const data = new EventsManager()
  .setName(Events.Message)
  .setOnce(false)
  .setExecute(async (ctx: Message & { client: Client }, i18n) => {
    if (!ctx.chat) return;
    if (!ctx.author) return;
    if (!(ctx.video || ctx.videoNote)) return;

    if (useVideoUser.get(ctx.author.id)) {
      await ctx.reply(i18n.get("onlyOneTime", ctx.author.language));
      return;
    }

    if (process.memoryUsage().rss / 1024 / 1024 > MAX_MEMORY_MB) {
      cacheVideo.clear();
      await ctx.reply(i18n.get("memoryUsage", ctx.author.language));
      return;
    }

    if (
      (ctx.video?.duration || ctx.videoNote?.duration || 0) > MAX_VIDEO_DURATION
    ) {
      await ctx.reply(i18n.get("maxDuractionVideo", ctx.author.language));
      return;
    }

    if ((ctx.video?.size || ctx.videoNote?.size || 0) > MAX_VIDEO_SIZE) {
      await ctx.reply(i18n.get("bigVideo", ctx.author.language));
      return;
    }

    useVideoUser.set(ctx.author.id, true);

    const blastKeyboard = await ctx.chat.send(
      i18n.get("blastKeyboard", ctx.author.language),
      {
        replyMarkup: new InlineKeyboardBuilder()
          .text("✅️", "blast_yes")
          .text("❌️", "blast_no"),
      },
    );

    const isBlastVideo = await new Promise<boolean>((resolve) => {
      const collector = ctx.createMessageComponentCollector({
        max: 1,
        time: 30000,
        filter: (inline) =>
          inline.author.id === ctx.author!.id &&
          inline.data !== undefined &&
          inline.data.startsWith("blast_"),
      });

      collector.on("end", async (collect) => {
        await blastKeyboard.delete().catch(() => null);
        resolve(collect.values()[0]?.data.endsWith("yes") || false);
      });
    });

    const loadingMessage = await ctx.reply("⏳");
    const recordVideoNote = setInterval(
      () => ctx.chat!.sendAction("record_video_note"),
      5500,
    );

    const videoIdQuality = `${(ctx.video || ctx.videoNote)?.id}_${ctx.client.settingUser.get(ctx.author.id)?.quality || "medium"}_${isBlastVideo}`;
    const inputPath = path.resolve(`./uploads/download/${videoIdQuality}.mp4`);
    const outputPath = path.resolve(`./uploads/${videoIdQuality}_node.mp4`);
    const tempOutputPath = outputPath.replace(".mp4", "_temp.mp4");

    try {
      if (cacheVideo.has(videoIdQuality)) {
        await ctx.chat.sendVideoNote(cacheVideo.get(videoIdQuality)!);
        return;
      }

      if (ctx.video) {
        await ctx.video.write(inputPath);
      } else {
        await ctx.videoNote!.write(inputPath);
      }

      await convertToCircleVideo(inputPath, outputPath, {
        ...(ctx.client.settingUser.get(ctx.author.id) || { quality: "medium" }),
        isBlastVideo,
      });

      const finalPath = isBlastVideo ? tempOutputPath : outputPath;
      const videoData = fs.createReadStream(finalPath);

      cacheVideo.set(videoIdQuality, videoData);
      await ctx.chat.sendVideoNote(videoData);
    } catch (err) {
      console.error("Ошибка обработки видео:", err);
      await ctx.reply(i18n.get("errUploadVideo", ctx.author.language));
    } finally {
      clearInterval(recordVideoNote);
      await ctx.chat.deleteMessage(loadingMessage.id).catch(() => null);
      useVideoUser.delete(ctx.author.id);
      await clearFiles([inputPath, outputPath, tempOutputPath]);
    }
  });

export { data };
