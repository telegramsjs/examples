import fs from "node:fs/promises";
import paths from "node:path";
import type { Client } from "../core/client.js";
import { EventsManager } from "../EventsManager.js";
import { CallbackManager } from "../CallbackManager.js";
import { CommandManager } from "../CommandManager.js";
import { Language } from "../Language.js";
import {
  Events,
  type CallbackQuery,
  type EventHandlerParameters,
} from "telegramsjs";
import enCommand from "../../language/command/en.json";
import ruCommand from "../../language/command/ru.json";
import ukCommand from "../../language/command/uk.json";

class LoaderManager {
  public client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async loadEvents(path: string): Promise<void> {
    const i18n = new Language();
    const data = await this.#loadFiles<EventsManager>(path);

    for (const [fullPath, event] of data) {
      if (event.once) {
        this.client.once(event.name, async (ctx: EventHandlerParameters) => {
          await event.execute(ctx, i18n);
        });
      } else {
        this.client.on(event.name, async (ctx: EventHandlerParameters) => {
          await event.execute(ctx, i18n);
        });
      }

      console.log(`[ Loading event ]: "${event.name}" from file: ${fullPath}`);
    }

    console.log("\n");
  }

  async loadCallbacks(path: string): Promise<void> {
    const i18n = new Language();
    const data = await this.#loadFiles<CallbackManager>(path);

    this.client.on(Events.CallbackQuery, async (ctx) => {
      if (!ctx.data) return;
      for (const [_, event] of data) {
        try {
          if (event.regExp) {
            if (new RegExp(event.name).test(ctx.data)) {
              await event.execute(
                ctx as CallbackQuery & { client: Client },
                i18n,
              );
            }
            return;
          }
          if (event.name === ctx.data) {
            await event.execute(
              ctx as CallbackQuery & { client: Client },
              i18n,
            );
          }
        } catch (err) {
          console.error(
            `[ Error handler]: callback "${event.name}", err: ${String(err)}`,
          );
        }
      }
    });

    for (const [fullPath, event] of data) {
      console.info(
        `[ Loading callback ]: "${event.name}" from file: ${fullPath}`,
      );
    }

    console.log("\n");
  }

  async loadCommands(path: string) {
    const data = await this.#loadFiles<CommandManager>(path);

    for (const [fullPath, command] of data) {
      this.client.commands.set(command.name, command.execute);

      if (command.aliases && command.aliases.length > 0) {
        for (const name of command.aliases) {
          this.client.commands.set(name, command.execute);
        }
      }

      console.log(
        `[ Loading command ]: "${command.name}" from file: ${fullPath}`,
      );
    }

    console.log("\n");

    await this.client.setMyCommands({
      commands: enCommand,
      languageCode: "en",
    });
    await this.client.setMyCommands({
      commands: ruCommand,
      languageCode: "ru",
    });
    await this.client.setMyCommands({
      commands: ukCommand,
      languageCode: "uk",
    });
  }

  async #loadFiles<T>(path: string): Promise<[string, T][]> {
    const result: [string, T][] = [];
    const files = await fs.readdir(path, { recursive: true }).catch(() => []);

    for (const file of files) {
      if (!file.endsWith(".js")) continue;
      const fullPath = paths.join(path, file);
      const { data } = await import(fullPath);
      result.push([fullPath, data]);
    }

    return result;
  }
}

export { LoaderManager };
