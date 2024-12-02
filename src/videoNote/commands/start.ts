import { CommandManager } from "../src/CommandManager.js";

const data = new CommandManager()
  .setName("/start")
  .setAliases("/старт")
  .setExecute(async (message, i18n) => {
    if (!message.author) return;

    const text = i18n.get("startCommand", message.author.language);

    await message.reply(text, {
      parseMode: "HTML",
    });

    if (!message.client.settingUser.has(message.author.id)) {
      await message.client.db.set("settings", message.author.id, {
        quality: "medium",
      });
    }
  });

export { data };
