import { Events, type Message } from "telegramsjs";
import { Collection } from "@telegram.ts/collection";
import type { Client } from "../../src/core/client.js";
import { EventsManager } from "../../src/EventsManager.js";

const cooldown = new Collection<string, number>();

const data = new EventsManager()
  .setName(Events.Message)
  .setOnce(false)
  .setExecute(async (ctx: Message & { client: Client }, i18n) => {
    const commandEntity = ctx.entities?.botCommand.shift();

    if (!commandEntity) return;
    if (commandEntity.index !== 0 && commandEntity.offset !== 0) return;

    const commandName = commandEntity.search.replace(`@${ctx.client.user}`, "");
    const executeCommand = ctx.client.commands.get(commandName);

    if (!executeCommand) return;

    try {
      if (ctx.author) {
        const identifier = `${ctx.author.id}_${commandName}`;
        if (cooldown.get(identifier)) {
          const remainingTime = cooldown.get(identifier)! + 1000 - Date.now();

          if (remainingTime > 0) {
            await ctx.reply(i18n.get("sendCmdCooldown", ctx.author.language));
            return;
          }
        }
        cooldown.set(identifier, Date.now());
      }

      await executeCommand(ctx, i18n);
    } catch (err) {
      console.log(err);
    }
  });

export { data };
