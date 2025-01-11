import { TelegramClient, InlineKeyboardBuilder, Events } from "telegramsjs";

const gameName = "your-game";
const gameUrl = "https://your-game.com";

const client = new TelegramClient("TOKEN");

client.on(Events.Message, async (msg) => {
  if (!msg.content) return;
  if (!msg.entities) return;
  if (msg.entities.botCommand?.[0]?.index !== 0) return;

  const commandName = msg.entities?.botCommand?.[0]!.search;

  if (!commandName) return;

  if (commandName === "/start") {
    await msg.chat?.sendGame(gameName);
    return;
  } else if (commandName === "/good") {
    await msg.chat?.send(gameName, {
      replyMarkup: new InlineKeyboardBuilder()
        .game("Play good!")
        .url("Help game", "https://help-your-game.com"),
    });
    return;
  }
});

client.on(Events.CallbackQuery, async (inline) => {
  if (!inline.gameShortName) return;

  await inline.showAlert(inline.gameShortName, gameUrl);
});

client.login();
