import dotenv from "dotenv";
dotenv.config();
import path from "node:path";
import { Client } from "./src/core/client.js";
import { LoaderManager } from "./src/loader/LoaderManager.js";

const client = new Client(process.env.TOKEN!);

client.on("ready", async ({ user }) => {
  const setNameCooldown =
    (await client.db.get("client", "setNameCooldown")) ?? 0;
  const remainingTime = setNameCooldown + 86_400_000 - Date.now();

  if (remainingTime < 0) {
    await user?.setName("Тг кружки, кружки из видео", "ru");
    await user?.setName("Телеграм-кружки, кружки з відео", "uk");
    await user?.setName("Telegram circles, circles from video", "en");
    await client.db.set("client", "setNameCooldown", Date.now());
  } else await client.db.set("client", "setNameCooldown", Date.now());

  const loader = new LoaderManager(client);
  await loader.loadEvents(path.join(process.cwd(), "/dist/events"));
  await loader.loadCallbacks(path.join(process.cwd(), "/dist/callback"));
  await loader.loadCommands(path.join(process.cwd(), "/dist/commands"));
  console.log(`Ready! Logged in as @${user}`);
});

process.on("uncaughtException", (err, origin) => {
  console.error("Необработанная ошибка:", err);
  console.error("Происходила ошибка в:", origin);
});

process.on("unhandledRejection", (reason) => {
  console.error("Необработанное отклонение промиса:", reason);
});

client.login();
