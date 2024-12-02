import { InlineKeyboardBuilder } from "telegramsjs";
import { CommandManager } from "../src/CommandManager.js";

const data = new CommandManager()
  .setName("/settings")
  .setAliases("/настройки")
  .setExecute(async (message, i18n) => {
    if (!message.author) return;

    const currentSettings = message.client.settingUser.get(message.author.id);

    const text = i18n.get("settingsCommand", message.author.language, {
      quality: currentSettings?.quality
        ? i18n.get(currentSettings.quality, message.author.language)
        : i18n.get("medium", message.author.language),
    });

    await message.reply(text, {
      parseMode: "HTML",
      replyMarkup: new InlineKeyboardBuilder()
        .text(
          `${i18n.get("low", message.author.language)} (🥉)`,
          "set_quality_low",
        )
        .text(
          `${i18n.get("medium", message.author.language)} (🥈)`,
          "set_quality_medium",
        )
        .text(
          `${i18n.get("high", message.author.language)} (🥇)`,
          "set_quality_high",
        ),
    });
  });

export { data };
