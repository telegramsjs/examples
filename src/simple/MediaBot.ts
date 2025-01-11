import fs from "node:fs";
import { TelegramClient, Events } from "telegramsjs";

const client = new TelegramClient("TOKEN");

/**
 * All available types for sending files: Buffer, ReadStream, Blob, FormData, DataView, ArrayBuffer, Uint8Array.
 * All these types still lead to a buffer under the hood.
 */

client.on(Events.Message, async (msg) => {
  if (!msg.content) return;
  if (!msg.entities) return;
  if (msg.entities.botCommand?.[0]?.index !== 0) return;

  const commandName = msg.entities?.botCommand?.[0]!.search;

  if (!commandName) return;

  if (commandName === "/local") {
    await ctx.chat?.sendPhoto("./path/to/file/car.png");
    return;
  } else if (commandName === "/stream") {
    await ctx.chat?.sendPhoto(fs.createReadStream("./path/to/file/car.png"));
    return;
  } else if (commandName === "/buffer") {
    await ctx.chat?.sendPhoto(fs.readFileSync("./path/to/file/car.png"));
    return;
  } else if (commandName === "/url") {
    await ctx.chat?.sendPhoto("https://picsum.photos/200/300/?random");
    return;
  } else if (commandName === "/caption") {
    await ctx.chat?.sendPhoto("https://picsum.photos/200/300/?random", {
      caption: "Text *Markdown*",
      parseMode: "Markdown",
    });
    return;
  } else if (commandName === "/group") {
    // Or ctx.chat.sendMediaGroup
    await ctx.chat?.send({
      media: [
        {
          media:
            "AgACAgIAAxkBAAODZ4I-2Qob-I1of7zFjRpMSG6s1NEAAtbrMRtpnBlIt19keIwir6EBAAMCAAN5AAM2BA",
          caption: "From fileId",
          type: "photo",
        },
        {
          media: "https://picsum.photos/200/300/?random",
          caption: "From url",
          type: "photo",
        },
        {
          media: "./path/to/file/car.png",
          caption: "From source file",
          type: "photo",
        },
        {
          media: fs.createReadStream("./path/to/file/car.png"),
          caption: "From stream",
          type: "photo",
        },
        {
          media: fs.readFileSync("./path/to/file/car.png"),
          caption: "From buffer",
          type: "photo",
        },
      ],
    });
    return;
  }
});

client.login();
