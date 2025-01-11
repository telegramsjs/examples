import fs from "node:fs";
import { TelegramClient, Events } from "telegramsjs";

const client = new TelegramClient("TOKEN");

client.on(Events.Message, async (msg) => {
  if (!msg.photo) return;

  const fileData = msg.photo.pop()!;
  const filePath = `./photos/${fileData.id}.jpg`;

  // fs.createWriteStream (default)
  await fileData.write(filePath, "stream", {
    // ...options
  });

  // or fs.promises.writeFile
  await fileData.write(filePath, "promise", {
    // ...options
  });

  // download only buffer
  const bufferFile = await fileData.download();
  // various buffer manipulations
  await fs.promises.writeFile(filePath, bufferFile);

  // Or all information for file (getFile)
  const allData = await fileData.fetch();
});

client.login();
